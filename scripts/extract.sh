#!/usr/bin/env bash
# shellcheck disable=SC2016
set -Eeuo pipefail

# shellcheck source=scripts/base.sh
source -- "$(dirname -- "${BASH_SOURCE[0]}")/base.sh"

toolx-parts () {

    printf '%s\n' \
        "engine/rust     RustX    rust daily" \
        "engine/bun      BunX     bun" \
        "platform/api    APIX     api" \
        "platform/infra  InfraX   infra" \
        "platform/skill  SkillX   skill" \
        "platform/web    WebX     web" \
        "platform/mobile MobileX  mobile" \
        "platform/desk   DeskX    desk"

}
toolx-specs () {

    printf '%s\n' admin client

}
toolx-part () {

    local name="${1##*/}"

    toolx-parts | awk -v name="${name%x}" '{ n = split($1, p, "/") } p[n] == name { $1 = $1; print; found = 1; exit } END { exit !found }'

}
toolx-drop () {

    toolx-parts | awk -v path="${1:-}" '$1 != path { drop = drop (drop ? "|" : "") $1 } END { print drop }'

}
toolx-git () {

    GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"

}
toolx-tokenless () {

    env -u GH_TOKEN -u GITHUB_TOKEN "$@"

}
toolx-edit () {

    local file="${1:-}" body=""

    body="$("${@:2}" < "${file}")" || return
    printf '%s\n' "${body}" > "${file}"

}
toolx-yaml () {

    local file="${1:-}" own="${2:-}" drop="${3:-}" item="${4:-^ *- }" keys="paths|cache-workspaces"

    [[ ! -f "${file}" ]] || toolx-edit "${file}" awk -v keys="${keys}" -v own="${own}" -v drop="${drop}" -v item="${item}" '
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

    local source="${1:-}" name="${2:-}" title="${3:-}" letter="" any="" i=0

    for (( i = 0; i < ${#source}; i++ )); do

        letter="${source:i:1}"
        any+="[${letter^}${letter,}]"

    done

    sed -e "s/${source,,}/${name}/g" -e "s/${any}/${title}/g"

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
toolx-tree () {

    local root="${1:-}" tag="${2:-}" dir="${3:-}" path="${4:-}" spec=""
    local -a flows=( labeler labels global ) own=()

    read -r -a own <<< "$(toolx-part "${path##*/}" | cut -d' ' -f3-)"
    flows+=( "${own[@]}" )
    flows=( "${flows[@]/#/.github/workflows/}" )

    find "${dir}" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf -- {} + &&
    git -C "${root}" archive "${tag}" -- ':(glob)*' .github ':(exclude).github/workflows' | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}" -- "${flows[@]/%/.yml}" | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}:${path}" -- ':(exclude)specs' | tar -x -C "${dir}" || return

    for spec in $(toolx-specs); do
        if git -C "${root}" cat-file -e "${tag}:${path}/specs/${spec}" 2>/dev/null; then git -C "${root}" archive "${tag}:${path}" -- "specs/${spec}" | tar -x -C "${dir}" || return; fi
    done

}
toolx-github () {

    local dir="${1:-}" path="${2:-}" drop="${3:-}" file=""

    for file in "${dir}"/.github/workflows/*.yml; do

        if grep -qF -- "${path}" "${file}"; then toolx-yaml "${file}" "${path}" "${drop}" || return; fi

    done

    rm -f -- "${dir}/.github/dependabot.yml" &&
    toolx-yaml "${dir}/.github/labels.yml"     "${path}" "${drop}|${path}" &&
    toolx-yaml "${dir}/.github/labeler.yml"    "${path}" "${drop}|${path}" '^[^ #]'

}
toolx-deps () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" host="${5:-}"
    local owner="${repo%%/*}" rust="engine/rust" bun="engine/bun" engine="" file="" linked=0
    local depends=".dependencies, .devDependencies, .optionalDependencies"
    local -a files=()

    engine="$(git -C "${root}" show "${tag}:${bun}/package.json" | jq -r .name)" || return

    mapfile -t files < <(grep -rlE --include=Cargo.toml "path = \"(\.\./)+${rust}" "${dir}")

    for file in "${files[@]}"; do

        toolx-edit "${file}" sed -E "s#path = \"(\.\./)+${rust}[^\"]*\"#git = \"${host}/${owner}/${rust##*/}x.git\", tag = \"${tag}\"#" \
            || return

    done

    if [[ -f "${dir}/package.json" ]] && jq -e --arg name "${engine}" "any(${depends} | objects; has(\$name))" "${dir}/package.json" >/dev/null; then

        linked=1

        toolx-edit "${dir}/package.json" jq --arg name "${engine}" --arg spec "git+${host}/${owner}/${bun##*/}x.git#${tag}" \
            "(${depends} | objects | select(has(\$name)) | .[\$name]) = \$spec" || return

        [[ ! -f "${dir}/bunfig.toml" ]] || toolx-edit "${dir}/bunfig.toml" sed -E "\#\"(\.\./)+${bun}[/\"]#d" || return

    fi

    for file in "${files[@]}"; do

        need-all cargo && toolx-tokenless cargo fetch --quiet --manifest-path "${file}" || return

    done
    if (( linked )); then

        (
            cache="$(mktemp -d)" && trap 'rm -rf -- "${cache}"' EXIT &&
            cd -- "${dir}" && BUN_INSTALL_CACHE_DIR="${cache}" toolx-tokenless bun install --lockfile-only --silent
        ) || return

    fi

}
toolx-docs () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="${5:-}" source="${6:-}" title="" body="" prettier="" file=""

    title="$(toolx-part "${repo}" | cut -d' ' -f2)"
    body="$(toolx-changelog "${root}" "${tag}" "${path}")"

    if [[ -n "${body//[[:space:]]/}" ]]; then printf '# Changelog\n\nEvery release of %s.\n%s\n' "${title}" "${body}" > "${dir}/CHANGELOG.md"
    else rm -f -- "${dir}/CHANGELOG.md"
    fi || return

    while IFS= read -r -d '' file; do
        toolx-edit "${file}" toolx-rename "${source}" "${repo##*/}" "${title}" || return
    done < <(find "${dir}" -maxdepth 1 -type f -name '*.md' -print0; find "${dir}/.github" -type f -print0)

    prettier="$(git -C "${root}" show "${tag}:.github/workflows/global.yml" | awk '$1 == "PRETTIER:" { print $2 }')"
    [[ -n "${prettier}" ]] || { err "No prettier version in the ${source} CI"; return; }

    (
        cd -- "${dir}" &&
        toolx-tokenless bun x "${prettier}" --config .prettierrc.yml --ignore-path .gitignore --no-error-on-unmatched-pattern --log-level warn \
            --write "**/*.{md,mdx,yml,yaml,json,jsonc}"
    )

}
toolx-sync () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" host="${5:-}" source="${6:-}" path="" drop="" file="" text=""

    path="$(toolx-part "${repo}" | cut -d' ' -f1)" && drop="$(toolx-drop "${path}")" || return

    toolx-tree   "${root}" "${tag}" "${dir}" "${path}" &&
    toolx-github "${dir}" "${path}" "${drop}" &&
    toolx-deps   "${root}" "${tag}" "${repo}" "${dir}" "${host}" &&
    toolx-docs   "${root}" "${tag}" "${repo}" "${dir}" "${path}" "${source}" || return

    ! grep -rlIE --exclude-dir=.git -- "${drop}|${path}" "${dir}" >&2 \
        || { err "Monorepo paths left in ${repo##*/}"; return; }

    while IFS= read -r file; do

        text="$(< "${file}")"
        text="${text//"${host}"/}"

        [[ "${text,,}" != *"${source,,}"* ]] || { err "${source} left in ${repo##*/}: ${file#"${dir}/"}"; return; }

    done < <(grep -rlIi --exclude-dir=.git -- "${source}" "${dir}")

}
toolx-args () {

    local part="" owner=""
    local semver='^v[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$' login='^[A-Za-z0-9-]+$' address='^(https|file)://[A-Za-z0-9._~/:@%+-]+$'

    while (( $# )); do

        case "${1}" in
            -r|--repo) repo="${2:-}"; shift ;;
            -t|--tag)  tag="${2:-}";  shift ;;
            -p|--path) root="${2:-}"; shift ;;
            -d|--dist) dist="${2:-}"; shift ;;
            -n|--name) name="${2:-}"; shift ;;
            -h|--host) host="${2:-}"; shift ;;
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

    { part="$(toolx-part "${repo}" | cut -d' ' -f1)" && [[ -n "${tag}" ]]; } \
        || { err "<prepare|push|tag|release> <[owner/]repo> <tag> [--path <saasx>] [--dist <dir>] [--host <url>] [--name <title>]"; return; }

    host="${host:-https://github.com}"
    source="SaaSX"

    [[ "${tag}" =~ ${semver} ]]   || { err "Not a release tag (vX.Y.Z): ${tag}"; return; }
    [[ "${host}" =~ ${address} ]] || { err "Not a repository host: ${host}"; return; }

    root="$(git -C "${root:-.}" rev-parse --show-toplevel)" || return

    git -C "${root}" rev-parse -q --verify "refs/tags/${tag}^{commit}" >/dev/null \
        || { err "Tag not found in ${root}: ${tag}"; return; }

    owner="${repo%/*}"

    if [[ "${repo}" != */* ]]; then
        owner="$(git -C "${root}" remote get-url origin)" || return
        owner="${owner%/*}"
        owner="${owner##*[/:]}"
    fi

    [[ "${owner}" =~ ${login} ]] || { err "Not a repository owner: ${owner}"; return; }

    repo="${owner}/${part##*/}x"
    dir="${dist:-/tmp/toolx/extracted}"
    dir="${dir%/}/${repo##*/}"

}
toolx-checkout () {

    local repo="${1:-}" dir="${2:-}" url="${3:-}/${1:-}.git" head="" branch="" tip=""

    head="$(toolx-git ls-remote --symref "${url}" HEAD)" || { err "Repository not reachable: ${repo}"; return; }
    branch="$(awk '$1 == "ref:" { sub("refs/heads/", "", $2); print $2; exit }' <<< "${head}")"
    branch="${branch:-main}"
    tip="$(awk '$1 != "ref:" && $2 == "HEAD" { print $1; exit }' <<< "${head}")"

    if [[ -d "${dir}/.git" ]]; then

        [[ "$(git -C "${dir}" remote get-url origin 2>/dev/null)" == "${url}" ]] || { err "Not a clone of ${repo}: ${dir}"; return; }
        [[ -z "$(git -C "${dir}" status --porcelain)" ]] || { err "Local changes in ${dir}"; return; }

    else

        mkdir -p -- "${dir%/*}" && toolx-git clone --quiet --depth 1 "${url}" "${dir}" || return

    fi

    git -C "${dir}" symbolic-ref HEAD "refs/heads/${branch}" || return

    if [[ -n "${tip}" ]]; then

        toolx-git -C "${dir}" fetch --quiet --depth 1 origin "+refs/heads/${branch}:refs/remotes/origin/${branch}" &&
        git -C "${dir}" reset --quiet --hard "origin/${branch}"

    elif git -C "${dir}" rev-parse -q --verify HEAD >/dev/null; then

        git -C "${dir}" update-ref -d HEAD

    fi

}
toolx-prepare () {

    need-all git tar jq bun || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source=""

    toolx-args "$@" || return

    {
        toolx-checkout "${repo}" "${dir}" "${host}" &&
        toolx-sync "${root}" "${tag}" "${repo}" "${dir}" "${host}" "${source}" &&
        git -C "${dir}" add -A
    } || { err "Failed to prepare: ${repo}"; return; }

    git -C "${dir}" diff --cached --quiet || git -C "${dir}" \
        -c user.name="$(git -C "${root}" log -1 --format=%an "${tag}")" \
        -c user.email="$(git -C "${root}" log -1 --format=%ae "${tag}")" \
        commit --quiet -m "Track ${tag}" || { err "Failed to commit: ${repo}"; return; }

    succ "Prepared -> ${dir}"

}
toolx-push () {

    local repo="" tag="" root="" dist="" dir="" name="" host="" source=""

    toolx-prepare "$@" && toolx-args "$@" || return

    toolx-git -C "${dir}" push --quiet origin HEAD || { err "Failed to push: ${repo}"; return; }

    succ "Pushed -> ${repo}"

}
toolx-tag () {

    need-all git || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" tags="" latest=""

    toolx-args "$@" || return

    tags="$(toolx-git ls-remote --tags --refs "${host}/${repo}.git")" || { err "Repository not reachable: ${repo}"; return; }
    tags="$(awk -F 'refs/tags/' '{ print $2 }' <<< "${tags}")"
    latest="$(toolx-newest <<< "${tags}")"

    if grep -qxF -- "${tag}" <<< "${tags}"; then info "Tag exists: ${repo}@${tag}"; return 0; fi

    [[ -z "${latest}" || "$(printf '%s\n' "${latest}" "${tag}" | toolx-newest)" == "${tag}" ]] \
        || { err "Refusing ${tag}: ${repo} is already at ${latest}"; return; }

    toolx-prepare "$@" || return

    toolx-git -C "${dir}" push --quiet --atomic origin HEAD "HEAD:refs/tags/${tag}" \
        || { err "Failed to tag: ${repo}@${tag}"; return; }

    succ "Tagged -> ${repo}@${tag}"

}
toolx-release () {

    need-all gh || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" title="" notes=""

    toolx-tag "$@" && toolx-args "$@" || return

    if gh release view "${tag}" --repo "${repo}" >/dev/null 2>&1; then info "Release exists: ${repo}@${tag}"; return 0; fi

    title="$(toolx-part "${repo}" | cut -d' ' -f2)"
    notes="$(toolx-changelog "${root}" "${tag}" "$(toolx-part "${repo}" | cut -d' ' -f1)" "${tag}" | toolx-rename "${source}" "${repo##*/}" "${title}")"
    notes="${notes#$'\n'}"
    name="$(toolx-rename "${source}" "${repo##*/}" "${title}" <<< "${name:-${tag}}")"

    gh release create "${tag}" \
        --repo "${repo}" \
        --title "${name}" \
        --notes "${notes:-Synced with ${source} ${tag}.}" \
        --verify-tag >/dev/null \
        || { err "Failed to release: ${repo}@${tag}"; return; }

    succ "Released -> ${host}/${repo}/releases/tag/${tag}"

}
main () {

    case "${1:-}" in
        prepare|push|tag|release) "toolx-${1}" "${@:2}" ;;
        *)                        err "prepare | push | tag | release <[owner/]repo> <tag>" ;;
    esac

}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
