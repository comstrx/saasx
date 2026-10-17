#!/usr/bin/env bash

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
info () {

    tint 96 '[*]' "$*"

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
