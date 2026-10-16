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
info () {

    tint 96 '[*]' "$*"

}
succ () {

    tint 32 '[+]' "$*"

}
err () {

    tint 31 '[-]' "$*"
    return 1

}
has () {

    [[ -n "${1:-}" ]] || return 1

    command -v -- "${1}" >/dev/null 2>&1

}
need () {

    has "${1:-}" || { err "Missing: ${1:-}"; return; }

}
need-all () {

    local bin="" fail=0

    for bin in "$@"; do
        has "${bin}" || { err "Missing: ${bin}"; fail=1; }
    done

    (( fail == 0 ))

}

TOOLX_HOST="${TOOLX_HOST:-https://github.com}"
TOOLX_WORK="${TOOLX_WORK:-/tmp/toolx/extracted}"
TOOLX_SOURCE="SaaSX"
TOOLX_SPELLING="Saa[Ss]X"
TOOLX_FORMAT="**/*.{md,mdx,yml,yaml,json,jsonc}"
TOOLX_PRUNE="paths|cache-workspaces"
TOOLX_DEPENDS=".dependencies, .devDependencies, .optionalDependencies"
TOOLX_SCHEMA='import { defineSchema } from "../../../src/lib/spec/surface.ts";\n\nexport default defineSchema({ screens: [] });\n'
TOOLX_STUB="schema/index.ts"
TOOLX_EMPTY_DIRS=( brand schema )
TOOLX_WORKFLOWS=( labeler labels global )
TOOLX_PARTS=( engine/rust engine/bun platform/api platform/infra platform/skill platform/web platform/mobile )
TOOLX_RUST="rustx"
TOOLX_BUN="bunx"

toolx-part () {

    local name="${1%x}" part=""

    for part in "${TOOLX_PARTS[@]}"; do

        [[ "${part##*/}" != "${name##*/}" ]] || { printf '%s\n' "${part}"; return; }

    done

    return 1

}
toolx-git () {

    git -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"

}
toolx-edit () {

    local file="${1:-}" body=""

    body="$("${@:2}" < "${file}")" || return
    printf '%s\n' "${body}" > "${file}"

}
toolx-yaml () {

    local file="${1:-}" own="${2:-}" drop="${3:-}" item="${4:-^ *- }"

    [[ ! -f "${file}" ]] || toolx-edit "${file}" awk -v keys="${TOOLX_PRUNE}" -v own="${own}" -v drop="${drop}" -v item="${item}" '
        function ind ( s ) { match(s, /^ */); return RLENGTH }
        function cut ( i,  d ) { d = ind(L[i]); X[i] = 1; while ( ++i <= n && (L[i] !~ /[^ ]/ || ind(L[i]) > d) ) X[i] = (L[i] ~ /[^ ]/) }
        { L[++n] = $0 }
        END {
            for ( i = 1; i <= n; i++ ) if ( L[i] ~ "^ *(" keys "):" ) cut(i)
            for ( i = 1; i <= n; i++ ) if ( !X[i] && L[i] ~ drop ) { for ( j = i; j && !(L[j] ~ item && (j == i || ind(L[j]) < ind(L[i]))); j-- ); if ( j ) cut(j) }
            for ( i = 1; i <= n; i++ ) if ( L[i] ~ "^ *[a-z-]+: *" own " *$" ) X[i] = 1
            for ( i = 1; i <= n; i++ ) if ( !X[i] && L[i] ~ /^ *with: *$/ ) { for ( j = i + 1; j <= n && (X[j] || L[j] !~ /[^ ]/); j++ ); X[i] = (j > n || ind(L[j]) <= ind(L[i])) }
            for ( i = p = 1; i <= n; i++ ) if ( !X[i] ) { s = L[i]; gsub(own "/?", "", s); b = (s !~ /[^ ]/); if ( !(b && p) ) print s; p = b }
        }
    '

}
toolx-rename () {

    local name="${1:-}" title="${1:-}"

    title="${title%x}"

    sed -e "s/${TOOLX_SOURCE,,}/${name}/g" -e "s/${TOOLX_SPELLING}/${title^}X/g"

}
toolx-newest () {

    sed 's/-/~/' | sort -V | sed -n '$ { s/~/-/; p; }'

}
toolx-changelog () {

    local root="${1:-}" tag="${2:-}" path="${3:-}" only="${4:-}"

    { git -C "${root}" show "${tag}:CHANGELOG.md" 2>/dev/null || true; } | awk -v part="### ${path}" -v only="${only}" '
        /^## /  { head = $0; hit = (only == "" || $2 == only); next }
        /^### / { on = (hit && $0 == part); if ( on && only == "" ) print "\n" head; next }
        on
    '

}
toolx-drop () {

    local path="${1:-}" part="" drop=""

    for part in "${TOOLX_PARTS[@]}"; do

        [[ "${part}" == "${path}" ]] || drop+="${drop:+|}${part}"

    done

    printf '%s\n' "${drop}"

}
toolx-tree () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="${5:-}"
    local -a flows=( "${TOOLX_WORKFLOWS[@]}" "${path##*/}" )

    [[ "${repo##*/}" != "${TOOLX_RUST}" ]] || flows+=( daily )
    flows=( "${flows[@]/%/.yml}" )

    find "${dir}" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf -- {} + &&
    git -C "${root}" archive "${tag}" -- ':(glob)*' ':(exclude,glob)*.sh' .github ':(exclude).github/workflows' | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}" -- "${flows[@]/#/.github/workflows/}" | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}:${path}" | tar -x -C "${dir}"

}
toolx-github () {

    local repo="${1:-}" dir="${2:-}" path="${3:-}" drop="${4:-}" file=""

    for file in "${dir}"/.github/workflows/*.yml; do

        if grep -qF -- "${path}" "${file}"; then toolx-yaml "${file}" "${path}" "${drop}" || return; fi

    done

    toolx-yaml "${dir}/.github/dependabot.yml" "${path}" "${drop}" &&
    toolx-yaml "${dir}/.github/labels.yml"     "${path}" "${drop}|${path}" &&
    toolx-yaml "${dir}/.github/labeler.yml"    "${path}" "${drop}|${path}" '^[^ #]' || return

    ! grep -rlE -- "${drop}|${path}" "${dir}/.github" >&2 \
        || { err "Unresolved part paths in the ${repo##*/} .github"; return; }

}
toolx-specs () {

    local dir="${1:-}" spec="" sub=""
    local -a specs=( "${dir}"/specs/*/ )

    spec="${specs[0]}"

    [[ -d "${spec}" ]] || return 0

    rm -rf -- "${specs[@]:1}" || return

    for sub in "${TOOLX_EMPTY_DIRS[@]}"; do

        [[ ! -d "${spec}${sub}" ]] || find "${spec}${sub}" -type f -delete || return

    done

    mkdir -p -- "${spec}${TOOLX_STUB%/*}" &&
    printf '%b' "${TOOLX_SCHEMA}" > "${spec}${TOOLX_STUB}" &&
    find "${spec}" -type d -empty -exec touch {}/.gitignore \;

}
toolx-deps () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="${5:-}" drop="${6:-}"
    local owner="${repo%%/*}" rust="" bun="" engine="" file="" linked=0
    local -a files=()

    rust="$(toolx-part "${TOOLX_RUST}")" && bun="$(toolx-part "${TOOLX_BUN}")" || return
    engine="$(git -C "${root}" show "${tag}:${bun}/package.json" | jq -r .name)" || return

    mapfile -t files < <(grep -rlE --include=Cargo.toml "path = \"(\.\./)+${rust}" "${dir}")

    for file in "${files[@]}"; do

        toolx-edit "${file}" sed -E "s#path = \"(\.\./)+${rust}[^\"]*\"#git = \"${TOOLX_HOST}/${owner}/${TOOLX_RUST}.git\", tag = \"${tag}\"#" \
            || return

    done

    if [[ -f "${dir}/package.json" ]] && jq -e --arg name "${engine}" "any(${TOOLX_DEPENDS} | objects; has(\$name))" "${dir}/package.json" >/dev/null; then

        linked=1

        toolx-edit "${dir}/package.json" jq --arg name "${engine}" --arg spec "git+${TOOLX_HOST}/${owner}/${TOOLX_BUN}.git#${tag}" \
            "(${TOOLX_DEPENDS} | objects | select(has(\$name)) | .[\$name]) = \$spec" || return

        [[ ! -f "${dir}/bunfig.toml" ]] || toolx-edit "${dir}/bunfig.toml" sed -E "\#\"(\.\./)+${bun}[/\"]#d" || return

    fi

    ! grep -rlIE --exclude-dir=.git -- "(\.\./)+(${drop}|${path})" "${dir}" >&2 \
        || { err "Unresolved part paths in ${repo##*/}"; return; }

    if (( ${#files[@]} )); then

        need cargo || return
        cargo fetch --quiet --manifest-path "${dir}/Cargo.toml" || return

    fi
    if (( linked )); then

        (
            cache="$(mktemp -d)" && trap 'rm -rf -- "${cache}"' EXIT &&
            cd -- "${dir}" && BUN_INSTALL_CACHE_DIR="${cache}" bun install --lockfile-only --silent
        ) || return

    fi

}
toolx-docs () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="${5:-}" body="" prettier="" file=""

    body="$(toolx-changelog "${root}" "${tag}" "${path}")"

    if [[ -n "${body//[[:space:]]/}" ]]; then printf '# Changelog\n\nEvery release of %s.\n%s\n' "${TOOLX_SOURCE}" "${body}" > "${dir}/CHANGELOG.md"
    else rm -f -- "${dir}/CHANGELOG.md"
    fi || return

    while IFS= read -r -d '' file; do
        toolx-edit "${file}" toolx-rename "${repo##*/}" || return
    done < <(find "${dir}" -maxdepth 1 -type f -name '*.md' -print0; find "${dir}/.github" -type f -print0)

    prettier="$(git -C "${root}" show "${tag}:.github/workflows/global.yml" | awk '$1 == "PRETTIER:" { print $2 }')"
    [[ -n "${prettier}" ]] || { err "No prettier version in the ${TOOLX_SOURCE} CI"; return; }

    (
        cd -- "${dir}" &&
        bun x "${prettier}" --config .prettierrc.yml --ignore-path .gitignore --no-error-on-unmatched-pattern --log-level warn --write "${TOOLX_FORMAT}"
    )

}
toolx-sync () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="" drop=""

    path="$(toolx-part "${repo}")" && drop="$(toolx-drop "${path}")" || return

    toolx-tree   "${root}" "${tag}" "${repo}" "${dir}" "${path}" &&
    toolx-github "${repo}" "${dir}" "${path}" "${drop}" &&
    toolx-specs  "${dir}" &&
    toolx-deps   "${root}" "${tag}" "${repo}" "${dir}" "${path}" "${drop}" &&
    toolx-docs   "${root}" "${tag}" "${repo}" "${dir}" "${path}"

}
toolx-args () {

    local part="" owner=""

    while (( $# )); do

        case "${1}" in
            -r|--repo) repo="${2:-}"; shift ;;
            -t|--tag)  tag="${2:-}";  shift ;;
            -p|--path) root="${2:-}"; shift ;;
            --release) release=1; [[ -z "${2:-}" || "${2}" == -* ]] || { name="${2}"; shift; } ;;
            -*)        err "Unknown option: ${1}"; return ;;
            *)
                if   [[ -z "${repo}" ]]; then repo="${1}"
                elif [[ -z "${tag}"  ]]; then tag="${1}"
                else err "Unexpected argument: ${1}"; return
                fi
            ;;
        esac

        shift

    done

    { part="$(toolx-part "${repo}")" && [[ -n "${tag}" ]]; } \
        || { err "<prepare|distribute> <[owner/]repo> <tag> [--path <saasx>] [--release [name]]"; return; }

    root="$(git -C "${root:-.}" rev-parse --show-toplevel)" || return

    git -C "${root}" rev-parse -q --verify "refs/tags/${tag}^{commit}" >/dev/null \
        || { err "Tag not found in ${root}: ${tag}"; return; }

    owner="${repo%/*}"

    if [[ "${repo}" != */* ]]; then
        owner="$(git -C "${root}" remote get-url origin)" || return
        owner="${owner%/*}"
        owner="${owner##*[/:]}"
    fi

    repo="${owner}/${part##*/}x"

}
toolx-prepare () {

    need-all git gh jq bun || return

    local repo="" tag="" root="" name="" release=0 dir="" branch="" message=""

    toolx-args "$@" || return

    dir="${TOOLX_WORK}/${repo##*/}"
    message="Track Tag ${tag}"

    (( ! release )) || message="Track Release ${tag}"

    branch="$(gh api "repos/${repo}" --jq .default_branch)" || { err "Repository not found: ${repo}"; return; }

    {
        rm -rf -- "${dir:?}" && mkdir -p -- "${dir%/*}" &&
        toolx-git clone --quiet --depth 1 "${TOOLX_HOST}/${repo}.git" "${dir}" &&
        git -C "${dir}" symbolic-ref HEAD "refs/heads/${branch}" &&
        toolx-sync "${root}" "${tag}" "${repo}" "${dir}" &&
        git -C "${dir}" add -A
    } || { err "Failed to prepare: ${repo}"; return; }

    git -C "${dir}" diff --cached --quiet || git -C "${dir}" \
        -c user.name="$(git -C "${root}" log -1 --format=%an "${tag}")" \
        -c user.email="$(git -C "${root}" log -1 --format=%ae "${tag}")" \
        commit --quiet -m "${message}" || { err "Failed to commit: ${repo}"; return; }

    succ "Prepared -> ${dir}"

}
toolx-distribute () {

    need-all git gh || return

    local repo="" tag="" root="" name="" release=0 notes="" title="" tags="" latest=""

    toolx-args "$@" || return

    tags="$(toolx-git ls-remote --tags --refs "${TOOLX_HOST}/${repo}.git")" || { err "Repository not reachable: ${repo}"; return; }
    tags="$(awk -F 'refs/tags/' '{ print $2 }' <<< "${tags}")"
    latest="$(toolx-newest <<< "${tags}")"

    if grep -qxF -- "${tag}" <<< "${tags}"; then

        info "Tag exists: ${repo}@${tag}"

    elif [[ -n "${latest}" && "$(printf '%s\n' "${latest}" "${tag}" | toolx-newest)" != "${tag}" ]]; then

        err "Refusing ${tag}: ${repo} is already at ${latest}"
        return

    else

        toolx-prepare "$@" || return

        toolx-git -C "${TOOLX_WORK}/${repo##*/}" push --quiet --atomic origin HEAD "HEAD:refs/tags/${tag}" \
            || { err "Failed to tag: ${repo}@${tag}"; return; }

        succ "Tagged -> ${repo}@${tag}"

    fi

    (( release )) || return 0

    if gh release view "${tag}" --repo "${repo}" >/dev/null 2>&1; then
        info "Release exists: ${repo}@${tag}"
        return 0
    fi

    notes="$(toolx-changelog "${root}" "${tag}" "$(toolx-part "${repo}")" "${tag}" | toolx-rename "${repo##*/}")"
    notes="${notes#$'\n'}"
    title="$(toolx-rename "${repo##*/}" <<< "${name:-${tag}}")"

    gh release create "${tag}" \
        --repo "${repo}" \
        --title "${title}" \
        --notes "${notes:-Synced with ${TOOLX_SOURCE} ${tag}.}" \
        --verify-tag >/dev/null \
        || { err "Failed to release: ${repo}@${tag}"; return; }

    succ "Released -> ${TOOLX_HOST}/${repo}/releases/tag/${tag}"

}
main () {

    case "${1:-}" in
        prepare|distribute) "toolx-${1}" "${@:2}" ;;
        *)                  err "Unknown command: ${1:-}" ;;
    esac

}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
