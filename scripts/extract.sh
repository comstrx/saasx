#!/usr/bin/env bash
# shellcheck disable=SC2016
set -Eeuo pipefail

# shellcheck source=scripts/base.sh
source -- "$(dirname -- "${BASH_SOURCE[0]}")/base.sh"
# shellcheck source=scripts/assets.sh
source -- "$(dirname -- "${BASH_SOURCE[0]}")/assets.sh"

extract-parts () {

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
extract-specs () {

    printf '%s\n' admin client

}
extract-part () {

    local name="${1##*/}"

    extract-parts | awk -v name="${name%x}" '{ n = split($1, p, "/") } p[n] == name { $1 = $1; print; found = 1; exit } END { exit !found }'

}
extract-drop () {

    extract-parts | awk -v path="${1:-}" '$1 != path { drop = drop (drop ? "|" : "") $1 } END { print drop }'

}
extract-git () {

    GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"

}
extract-edit () {

    local file="${1:-}" body=""

    body="$("${@:2}" < "${file}")" || return
    printf '%s\n' "${body}" > "${file}"

}
extract-yaml () {

    local file="${1:-}" own="${2:-}" drop="${3:-}" item="${4:-^ *- }" keys="paths|cache-workspaces"

    [[ ! -f "${file}" ]] || extract-edit "${file}" awk -v keys="${keys}" -v own="${own}" -v drop="${drop}" -v item="${item}" '
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
extract-rename () {

    local source="${1:-}" name="${2:-}" title="${3:-}" letter="" any="" i=0

    for (( i = 0; i < ${#source}; i++ )); do

        letter="${source:i:1}"
        any+="[${letter^}${letter,}]"

    done

    sed -e "s/${source,,}/${name}/g" -e "s/${any}/${title}/g"

}
extract-newest () {

    sed 's/-/~/' | sort -V | sed -n '$ { s/~/-/; p; }'

}
extract-changelog () {

    local root="${1:-}" tag="${2:-}" path="${3:-}" only="${4:-}"

    { git -C "${root}" show "${tag}:CHANGELOG.md" 2>/dev/null || true; } | awk -v part="### ${path}" -v only="${only}" '
        /^## /  { head = $0; hit = (only == "" || $2 == only); on = 0; next }
        /^### / { on = (hit && $0 == part); if ( on && only == "" ) print "\n" head; next }
        on
    '

}
extract-tree () {

    local root="${1:-}" tag="${2:-}" dir="${3:-}" path="${4:-}" spec=""
    local -a flows=( labeler labels global ) own=()

    read -r -a own <<< "$(extract-part "${path##*/}" | cut -d' ' -f3-)"
    flows+=( "${own[@]}" )
    flows=( "${flows[@]/#/.github/workflows/}" )

    find "${dir}" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf -- {} + &&
    git -C "${root}" archive "${tag}" -- ':(glob)*' .github ':(exclude).github/workflows' | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}" -- "${flows[@]/%/.yml}" | tar -x -C "${dir}" &&
    git -C "${root}" archive "${tag}:${path}" -- ':(exclude)specs' | tar -x -C "${dir}" || return

    for spec in $(extract-specs); do
        if git -C "${root}" cat-file -e "${tag}:${path}/specs/${spec}" 2>/dev/null; then git -C "${root}" archive "${tag}:${path}" -- "specs/${spec}" | tar -x -C "${dir}" || return; fi
    done

}
extract-github () {

    local dir="${1:-}" path="${2:-}" drop="${3:-}" file=""

    for file in "${dir}"/.github/workflows/*.yml; do

        if grep -qF -- "${path}" "${file}"; then extract-yaml "${file}" "${path}" "${drop}" || return; fi

    done

    rm -f -- "${dir}/.github/dependabot.yml" &&
    extract-yaml "${dir}/.github/labels.yml"     "${path}" "${drop}|${path}" &&
    extract-yaml "${dir}/.github/labeler.yml"    "${path}" "${drop}|${path}" '^[^ #]'

}
extract-deps () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" host="${5:-}"
    local owner="${repo%%/*}" rust="engine/rust" bun="engine/bun" engine="" file="" linked=0
    local depends=".dependencies, .devDependencies, .optionalDependencies"
    local -a files=()

    engine="$(git -C "${root}" show "${tag}:${bun}/package.json" | jq -r .name)" || return

    mapfile -t files < <(grep -rlE --include=Cargo.toml "path = \"(\.\./)+${rust}" "${dir}")

    for file in "${files[@]}"; do

        extract-edit "${file}" sed -E "s#path = \"(\.\./)+${rust}[^\"]*\"#git = \"${host}/${owner}/${rust##*/}x.git\", tag = \"${tag}\"#" \
            || return

    done

    if [[ -f "${dir}/package.json" ]] && jq -e --arg name "${engine}" "any(${depends} | objects; has(\$name))" "${dir}/package.json" >/dev/null; then

        linked=1

        extract-edit "${dir}/package.json" jq --arg name "${engine}" --arg spec "git+${host}/${owner}/${bun##*/}x.git#${tag}" \
            "(${depends} | objects | select(has(\$name)) | .[\$name]) = \$spec" || return

        [[ ! -f "${dir}/bunfig.toml" ]] || extract-edit "${dir}/bunfig.toml" sed -E "\#\"(\.\./)+${bun}[/\"]#d" || return

    fi

    for file in "${files[@]}"; do

        need-all cargo && tokenless cargo fetch --quiet --manifest-path "${file}" || return

    done
    if (( linked )); then

        (
            cache="$(mktemp -d)" && trap 'rm -rf -- "${cache}"' EXIT &&
            cd -- "${dir}" && BUN_INSTALL_CACHE_DIR="${cache}" tokenless bun install --lockfile-only --silent
        ) || return

    fi

}
extract-docs () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" path="${5:-}" source="${6:-}" title="" body="" prettier="" file=""

    title="$(extract-part "${repo}" | cut -d' ' -f2)"
    body="$(extract-changelog "${root}" "${tag}" "${path}")"

    if [[ -n "${body//[[:space:]]/}" ]]; then printf '# Changelog\n\nEvery release of %s.\n%s\n' "${title}" "${body}" > "${dir}/CHANGELOG.md"
    else rm -f -- "${dir}/CHANGELOG.md"
    fi || return

    while IFS= read -r -d '' file; do
        extract-edit "${file}" sed -e "s#${source,,}/${path}#${repo##*/}#g" || return
        extract-edit "${file}" extract-rename "${source}" "${repo##*/}" "${title}" || return
    done < <(find "${dir}" -maxdepth 1 -type f -name '*.md' -print0; find "${dir}/.github" -type f -print0)

    prettier="$(git -C "${root}" show "${tag}:.github/workflows/global.yml" | awk '$1 == "PRETTIER:" { print $2 }')"
    [[ -n "${prettier}" ]] || { err "No prettier version in the ${source} CI"; return; }

    (
        cd -- "${dir}" &&
        tokenless bun x "${prettier}" --config .prettierrc.yml --ignore-path .gitignore --no-error-on-unmatched-pattern --log-level warn \
            --write "**/*.{md,mdx,yml,yaml,json,jsonc}"
    )

}
extract-sync () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" host="${5:-}" source="${6:-}" path="" drop="" file="" text=""

    path="$(extract-part "${repo}" | cut -d' ' -f1)" && drop="$(extract-drop "${path}")" || return

    extract-tree   "${root}" "${tag}" "${dir}" "${path}" &&
    extract-github "${dir}" "${path}" "${drop}" &&
    extract-deps   "${root}" "${tag}" "${repo}" "${dir}" "${host}" &&
    extract-docs   "${root}" "${tag}" "${repo}" "${dir}" "${path}" "${source}" || return

    ! grep -rlIE --exclude-dir=.git -- "${drop}|${path}" "${dir}" >&2 \
        || { err "Monorepo paths left in ${repo##*/}"; return; }

    while IFS= read -r file; do

        text="$(< "${file}")"
        text="${text//"${host}"/}"

        [[ "${text,,}" != *"${source,,}"* ]] || { err "${source} left in ${repo##*/}: ${file#"${dir}/"}"; return; }

    done < <(grep -rlIi --exclude-dir=.git -- "${source}" "${dir}")

}
extract-args () {

    local part="" owner="" origin=""
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

    { part="$(extract-part "${repo}" | cut -d' ' -f1)" && [[ -n "${tag}" ]]; } \
        || { err "<prepare|push|tag|release> <[owner/]repo> <tag> [--path <saasx>] [--dist <dir>] [--host <url>] [--name <title>]"; return; }

    host="${host:-https://github.com}"
    source="SaaSX"
    source_repo=""

    [[ "${tag}" =~ ${semver} ]]   || { err "Not a release tag (vX.Y.Z): ${tag}"; return; }
    [[ "${host}" =~ ${address} ]] || { err "Not a repository host: ${host}"; return; }

    root="$(git -C "${root:-.}" rev-parse --show-toplevel)" || return

    git -C "${root}" rev-parse -q --verify "refs/tags/${tag}^{commit}" >/dev/null \
        || { err "Tag not found in ${root}: ${tag}"; return; }

    origin="$(git -C "${root}" remote get-url origin)" || return
    origin="${origin%.git}"
    source_repo="${origin#*github.com[:/]}"
    owner="${repo%/*}"

    [[ "${repo}" == */* ]] || owner="${source_repo%/*}"

    [[ "${owner}" =~ ${login} ]] || { err "Not a repository owner: ${owner}"; return; }

    if has cygpath; then root="$(cygpath -u "${root}")" || return; fi

    repo="${owner}/${part##*/}x"
    dir="${dist:-/tmp/tools/extracted}"
    dir="${dir%/}/${repo##*/}"
    out="${dir%/*}/assets/${repo##*/}"

}
extract-checkout () {

    local repo="${1:-}" dir="${2:-}" url="${3:-}/${1:-}.git" head="" branch="" tip=""

    head="$(extract-git ls-remote --symref "${url}" HEAD)" || { err "Repository not reachable: ${repo}"; return; }
    branch="$(awk '$1 == "ref:" { sub("refs/heads/", "", $2); print $2; exit }' <<< "${head}")"
    branch="${branch:-main}"
    tip="$(awk '$1 != "ref:" && $2 == "HEAD" { print $1; exit }' <<< "${head}")"

    if [[ -d "${dir}/.git" ]]; then

        [[ "$(git -C "${dir}" remote get-url origin 2>/dev/null)" == "${url}" ]] || { err "Not a clone of ${repo}: ${dir}"; return; }
        [[ -z "$(git -C "${dir}" status --porcelain)" ]] || { err "Local changes in ${dir}"; return; }

    else

        mkdir -p -- "${dir%/*}" && extract-git clone --quiet --depth 1 "${url}" "${dir}" || return

    fi

    git -C "${dir}" symbolic-ref HEAD "refs/heads/${branch}" || return

    if [[ -n "${tip}" ]]; then

        extract-git -C "${dir}" fetch --quiet --depth 1 origin "+refs/heads/${branch}:refs/remotes/origin/${branch}" &&
        git -C "${dir}" reset --quiet --hard "origin/${branch}"

    elif git -C "${dir}" rev-parse -q --verify HEAD >/dev/null; then

        git -C "${dir}" update-ref -d HEAD

    fi

}
extract-prepare () {

    need-all git tar jq bun || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out=""

    extract-args "$@" || return

    {
        extract-checkout "${repo}" "${dir}" "${host}" &&
        extract-sync "${root}" "${tag}" "${repo}" "${dir}" "${host}" "${source}" &&
        git -C "${dir}" add -A
    } || { err "Failed to prepare: ${repo}"; return; }

    git -C "${dir}" diff --cached --quiet || git -C "${dir}" \
        -c user.name="$(git -C "${root}" log -1 --format=%an "${tag}")" \
        -c user.email="$(git -C "${root}" log -1 --format=%ae "${tag}")" \
        commit --quiet -m "Track ${tag}" || { err "Failed to commit: ${repo}"; return; }

    succ "Prepared -> ${dir}"

}
extract-push () {

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out=""

    extract-prepare "$@" && extract-args "$@" || return

    extract-git -C "${dir}" push --quiet origin HEAD || { err "Failed to push: ${repo}"; return; }

    succ "Pushed -> ${repo}"

}
extract-tag () {

    need-all git || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out="" tags="" latest=""

    extract-args "$@" || return

    tags="$(extract-git ls-remote --tags --refs "${host}/${repo}.git")" || { err "Repository not reachable: ${repo}"; return; }
    tags="$(awk -F 'refs/tags/' '{ print $2 }' <<< "${tags}")"
    latest="$(extract-newest <<< "${tags}")"

    if grep -qxF -- "${tag}" <<< "${tags}"; then info "Tag exists: ${repo}@${tag}"; return 0; fi

    [[ -z "${latest}" || "$(printf '%s\n' "${latest}" "${tag}" | extract-newest)" == "${tag}" ]] \
        || { err "Refusing ${tag}: ${repo} is already at ${latest}"; return; }

    extract-prepare "$@" || return

    extract-git -C "${dir}" push --quiet --atomic origin HEAD "HEAD:refs/tags/${tag}" \
        || { err "Failed to tag: ${repo}@${tag}"; return; }

    succ "Tagged -> ${repo}@${tag}"

}
extract-pack () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" dir="${4:-}" out="${5:-}" source_repo="${6:-}" path="" part="" list="" id="" bin="" triple="" file="" version=""

    version="${tag#v}"

    path="$(extract-part "${repo}" | cut -d' ' -f1)" && part="${path##*/}" || return
    list="$(assets-bins "${root}" | awk -v part="${part}" '$1 == part { print $2, $3 }')" || return

    rm -rf -- "${out}" && mkdir -p -- "${out}" || return

    if [[ -n "${list}" ]]; then

        while read -r id bin; do

            for triple in $(assets-targets); do

                file="${id}-${version}-$(assets-triple "${id}" "${triple}").$(assets-ext "${triple}")"

                gh release download "${tag}" --repo "${source_repo}" --pattern "${file}" --pattern "${file}.sha256" --dir "${out}" \
                    || { err "Cannot download ${file} from ${source_repo}@${tag}"; return; }

                assets-check "${out}/${file}" || return

            done

            assets-installers "${root}/scripts" "${out}" "${repo}" "${tag}" "${id}" "${bin}" || return

        done <<< "${list}"

    else

        id="${repo##*/}"

        git -C "${dir}" archive --format=tar.gz --prefix="${id}-${version}/" --output="${out}/${id}-${version}.tar.gz" HEAD &&
        git -C "${dir}" archive --format=zip    --prefix="${id}-${version}/" --output="${out}/${id}-${version}.zip"    HEAD &&
        assets-sum "${out}/${id}-${version}.tar.gz" &&
        assets-sum "${out}/${id}-${version}.zip" &&
        assets-installers "${root}/scripts" "${out}" "${repo}" "${tag}" "${id}" "" || return

    fi

    syft scan "dir:${dir}" --config "${dir}/.syft.yml" --source-name "${repo##*/}" --source-version "${tag}" --output "cyclonedx-json=${out}/sbom.cdx.json" \
        && assets-sum "${out}/sbom.cdx.json" \
        && assets-sums "${out}" || return

    succ "Packed -> ${out}"

}
extract-assets () {

    need-all git gh jq cargo syft || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out=""

    extract-prepare "$@" && extract-args "$@" || return

    extract-pack "${root}" "${tag}" "${repo}" "${dir}" "${out}" "${source_repo}"

}
extract-verify () {

    need-all git gh jq cargo curl || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out="" path="" list="" id="" bin="" tmp="" line="" want="" file="" fail=0
    local -a files=()

    extract-args "$@" || return

    if [[ "$(gh repo view "${repo}" --json isPrivate --jq .isPrivate 2>/dev/null)" != false ]]; then warn "Private or unreachable, nothing public to verify: ${repo}"; return 0; fi

    path="$(extract-part "${repo}" | cut -d' ' -f1)" || return
    list="$(assets-bins "${root}" | awk -v part="${path##*/}" '$1 == part { print $2, $3 }')" && host="$(assets-host)" || return

    [[ -n "${list}" ]] || list="${repo##*/} "

    while read -r id bin; do

        tmp="$(mktemp -d)" || return

        line="$(assets-install "https://github.com/${repo}/releases/download/${tag}/${id}-installer" "${bin}" "${tmp}/bin")" || line=""
        want="unpacked"
        [[ -z "${bin}" ]] || want="${bin} ${tag#v}"

        if [[ "${line}" == "${want}" ]]; then succ "Installs -> ${repo##*/} ${id}"; else err "The public ${id} installer gave: ${line:-nothing}" || fail=1; fi

        if [[ -n "${bin}" ]]; then files=( "${id}-${tag#v}-$(assets-triple "${id}" "${host}").$(assets-ext "${host}")" ); else files=( "${id}-${tag#v}.tar.gz" "${id}-${tag#v}.zip" ); fi
        files+=( "${id}-installer.sh" "${id}-installer.ps1" sbom.cdx.json )

        for file in "${files[@]}"; do

            if gh release download "${tag}" --repo "${repo}" --pattern "${file}" --dir "${tmp}" && assets-attested "${source_repo}" "${tag}" "${tmp}/${file}"
            then succ "Attested -> ${repo##*/} ${file}"
            else err "No provenance for ${repo##*/} ${file}" || fail=1
            fi

        done

        rm -rf -- "${tmp}"

    done <<< "${list}"

    (( fail == 0 ))

}
extract-publish () {

    local root="${1:-}" tag="${2:-}" repo="${3:-}" host="${4:-}" source="${5:-}" name="${6:-}" title="" notes=""

    if gh release view "${tag}" --repo "${repo}" >/dev/null 2>&1; then info "Release exists: ${repo}@${tag}"; return 0; fi

    title="$(extract-part "${repo}" | cut -d' ' -f2)"
    notes="$(extract-changelog "${root}" "${tag}" "$(extract-part "${repo}" | cut -d' ' -f1)" "${tag}" | extract-rename "${source}" "${repo##*/}" "${title}")"
    notes="${notes#$'\n'}"
    name="$(extract-rename "${source}" "${repo##*/}" "${title}" <<< "${name:-${tag}}")"

    gh release create "${tag}" \
        --repo "${repo}" \
        --title "${name}" \
        --notes "${notes:-Synced with ${source} ${tag}.}" \
        --verify-tag >/dev/null \
        || { err "Failed to release: ${repo}@${tag}"; return; }

    succ "Released -> ${host}/${repo}/releases/tag/${tag}"

}
extract-release () {

    need-all gh syft cargo || return

    local repo="" tag="" root="" dist="" dir="" name="" host="" source="" source_repo="" out=""

    extract-tag "$@" && extract-args "$@" || return

    extract-publish "${root}" "${tag}" "${repo}" "${host}" "${source}" "${name}" &&
    extract-pack "${root}" "${tag}" "${repo}" "${dir}" "${out}" "${source_repo}" || return

    gh release upload "${tag}" --repo "${repo}" --clobber "${out}"/* >/dev/null || { err "Failed to upload the assets of ${repo}@${tag}"; return; }

    succ "Uploaded -> $(find "${out}" -type f | wc -l | tr -d ' ') assets to ${repo}@${tag}"

}
main () {

    case "${1:-}" in
        prepare|push|tag|assets|release|verify) "extract-${1}" "${@:2}" ;;
        *)                                      err "prepare | push | tag | assets | release | verify <[owner/]repo> <tag>" ;;
    esac

}

main "$@"
