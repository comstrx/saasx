#!/usr/bin/env bash
# shellcheck disable=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
set -Eeuo pipefail

clr () {

    [[ -z "${NO_COLOR:-}" ]]    || return 1
    [[ -n "${FORCE_COLOR:-}"    || -n "${GITHUB_ACTIONS:-}" ]] && return 0

    [[ -n "${TERM:-}" ]]        || return 1
    [[ "${TERM:-}" != "dumb" ]] || return 1

    [[ -t 1 || -t 2 ]]

}
tint () {

    local code="${1:-}" tag="${2:-}"

    shift 2 >/dev/null 2>&1 || true

    if clr; then printf '\033[%sm%s\033[0m %b\n' "${code}" "${tag}" "$*" >&2
    else printf '%s %b\n' "${tag}" "$*" >&2
    fi

    return 0

}
succ () {

    tint 32 '[+]' "$*"

}
warn () {

    tint 33 '[!]' "$*"

}
err () {

    tint 31 '[-]' "$*"
    return 1

}
has () {

    [[ -n "${1:-}" ]] || return 1

    command -v -- "${1}" >/dev/null 2>&1

}
need-all () {

    local bin="" fail=0

    for bin in "$@"; do
        has "${bin}" || { err "Missing: ${bin}"; fail=1; }
    done

    (( fail == 0 ))

}

NOTIFY_CURL=( -sS --fail-with-body --connect-timeout 10 --max-time 20 --retry 3 --retry-max-time 60 --retry-connrefused )
NOTIFY_JOBS='.jobs[] | select(.conclusion == "failure" or .conclusion == "timed_out") | .name'
NOTIFY_RUN='.workflow_run | [
    .conclusion, .name, .repository.full_name, .head_branch, .head_sha[:7], (.display_title // "" | split("\n")[0]),
    .event, .triggering_actor.login, .run_attempt, .id, .html_url, (.updated_at | fromdate) - (.run_started_at | fromdate)
] | map(. // "" | tostring) | join("\u001f")'
NOTIFY_PAYLOAD='{
    telegram: { chat_id: $chat, text: $text[:4096], disable_notification: $quiet, link_preview_options: { is_disabled: true } },
    slack:    { text: ($text | gsub("&"; "&amp;") | gsub("<"; "&lt;") | gsub(">"; "&gt;")) },
    discord:  { content: $text[:2000], allowed_mentions: { parse: [] }, flags: (if $quiet then 4100 else 4 end) },
    webhook:  { text: $text }
}[$channel] | tojson | tojson'

notify-curl () {

    local channel="${1:-}" url="${2:-}" body="${3:-}" out=""

    [[ "${url}" == https://* && "${url}" != *[[:space:]\"\\]* ]] || { err "Malformed ${channel} endpoint"; return; }

    out="$(printf 'url = "%s"\njson = %s\n' "${url}" "${body}" | curl "${NOTIFY_CURL[@]}" "${@:4}" -K - 2>&1)" \
        || { err "Failed to notify ${channel}: ${out:0:300}"; return; }

}
notify-post () {

    need-all curl jq || return

    local quiet=false text="" channel="" url="" body=""
    local -a args=() sent=() failed=()

    [[ "${1:-}" != --quiet ]] || { quiet=true; shift; }

    text="$*"
    [[ -n "${text}" ]] || { err "post [--quiet] <text>"; return; }

    for channel in telegram slack discord webhook; do

        args=()

        case "${channel}" in
            telegram) url="${TELEGRAM_CHAT_ID:+${TELEGRAM_TOKEN:+https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage}}" ;;
            slack)    url="${SLACK_WEBHOOK_URL:-}" ;;
            discord)  url="${DISCORD_WEBHOOK_URL:-}"; args=( --url-query wait=true ) ;;
            webhook)  url="${WEBHOOK_URL:-}" ;;
        esac

        [[ -n "${url}" ]] || continue

        body="$(jq -rn --arg channel "${channel}" --arg chat "${TELEGRAM_CHAT_ID:-}" --arg text "${text}" --argjson quiet "${quiet}" "${NOTIFY_PAYLOAD}")" || return

        if notify-curl "${channel}" "${url}" "${body}" "${args[@]}"; then sent+=( "${channel}" ); else failed+=( "${channel}" ); fi

    done

    (( ${#sent[@]} + ${#failed[@]} )) || { warn "No notification channel configured"; return 0; }
    (( ! ${#sent[@]} )) || succ "Notified -> ${sent[*]}"

    (( ! ${#failed[@]} ))

}
notify-workflow () {

    need-all jq gh || return

    local status="" name="" repo="" ref="" sha="" title="" event="" actor="" attempt="" id="" url="" took=""
    local icon="❌" verb="failed" jobs="" line=""
    local -a post=()

    IFS=$'\x1f' read -r status name repo ref sha title event actor attempt id url took < <(jq -r "${NOTIFY_RUN}" "${GITHUB_EVENT_PATH:-}" 2>/dev/null) \
        || { err "No workflow_run event to report"; return; }

    case "${status}" in
        success)         icon="✅"; verb="passed"; post=( --quiet ) ;;
        failure)         ;;
        timed_out)       icon="⏱️"; verb="timed out" ;;
        startup_failure) icon="💥"; verb="failed to start" ;;
        *)               icon="⚠️"; verb="${status//_/ }" ;;
    esac

    if [[ "${status}" != success ]]; then
        jobs="$(gh api --paginate "repos/${repo}/actions/runs/${id}/attempts/${attempt}/jobs?per_page=100" --jq "${NOTIFY_JOBS}")" \
            || warn "No job details for ${repo} run ${id}"
    fi

    if   (( took >= 3600 )); then took="$(( took / 3600 ))h $(( took % 3600 / 60 ))m"
    elif (( took >= 60 ));   then took="$(( took / 60 ))m $(( took % 60 ))s"
    else took="${took}s"
    fi

    line="${ref} @ ${sha} · ${event} by ${actor} · ${took}"
    jobs="${jobs//$'\n'/, }"

    (( attempt <= 1 ))            || line+=" · attempt ${attempt}"
    [[ "${title}" != "${name}" ]] || title=""
    (( ${#title} <= 100 ))        || title="${title:0:99}…"
    (( ${#jobs} <= 300 ))         || jobs="${jobs:0:299}…"

    notify-post "${post[@]}" "$(printf '%s\n' "${icon} ${repo##*/} · ${name} ${verb}" "${line}" ${title:+"${title}"} ${jobs:+"Failed: ${jobs}"} "${url}")"

}
main () {

    case "${1:-}" in
        post|workflow) "notify-${1}" "${@:2}" ;;
        *)             err "Unknown command: ${1:-}" ;;
    esac

}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
