#!/usr/bin/env bash
# shellcheck disable=SC2016
set -Eeuo pipefail

# shellcheck source=scripts/base.sh
source -- "$(dirname -- "${BASH_SOURCE[0]}")/base.sh"
# shellcheck source=scripts/assets.sh
source -- "$(dirname -- "${BASH_SOURCE[0]}")/assets.sh"

release-binary () {

    local root="${1:-}" part="${2:-}" id="${3:-}" bin="${4:-}" target="${5:-}" exe="${6:-}"

    if [[ "${part}" == desk ]]; then printf '%s\n' "${root}/platform/desk/dist/apps/${bin}${exe}"
    else printf '%s\n' "${root}/platform/${part}/target/${target}/release/${bin}${exe}"
    fi

}
release-desk () {

    local root="${1:-}" target="${2:-}"

    need-all bun || return

    info "Building desk for ${target}"

    if ! ( cd "${root}/engine/bun" && bun install --frozen-lockfile && bun link ) ||
        ! ( cd "${root}/platform/desk" && bun install --frozen-lockfile && NODE_ENV=production bun run app --all --target "${target}" ); then
        err "Failed to build desk for ${target}"; return
    fi

}
release-version () {

    local root="${1:-}" file="" version="" first="" fail=0

    for file in "${root}"/engine/rust/Cargo.toml "${root}"/platform/*/Cargo.toml "${root}"/platform/*/src-tauri/Cargo.toml "${root}"/engine/bun/package.json "${root}"/platform/*/package.json; do

        [[ -f "${file}" ]] || continue

        if [[ "${file}" == *.json ]]; then version="$(jq -r '.version // empty' "${file}" | tr -d '\r')"
        else version="$(awk '/^\[/ { on = ($0 == "[workspace.package]" || $0 == "[package]") } on && $1 == "version" { gsub(/[" ]/, "", $3); print $3; exit }' "${file}")"
        fi

        [[ -n "${version}" ]] || continue
        first="${first:-${version}}"

        [[ "${version}" == "${first}" ]] || { warn "${file#"${root}/"} is at ${version}, not ${first}"; fail=1; }

    done

    [[ -n "${first}" ]] || { err "No versioned manifest"; return; }
    (( fail == 0 ))     || { err "Every manifest must carry one version"; return; }

    printf '%s\n' "${first}"

}
release-zip () {

    local dir="${1:-}" base="${2:-}" file="${3:-}" tar=""

    tar="$(cygpath -u "${SYSTEMROOT:-C:\\Windows}")/System32/tar.exe"

    [[ -x "${tar}" ]] || { err "No Windows tar: ${tar}"; return; }

    "${tar}" -a -c -f "$(cygpath -w "${file}")" -C "$(cygpath -w "${dir}")" "${base}"

}
release-try () {

    local root="${1:-}" out="${2:-}" repo="${3:-}" tag="${4:-}" id="${5:-}" bin="${6:-}" tmp="" line=""

    tmp="$(mktemp -d)" || return

    assets-installers "${root}/scripts" "${tmp}" "${repo}" "${tag}" "${id}" "${bin}" &&
    line="$(assets-install "${tmp}/${id}-installer" "${bin}" "${tmp}/bin" "${out}")" || line=""

    rm -rf -- "${tmp}"

    [[ "${line}" == "${bin} ${tag#v}" ]] || { err "The ${id} installer gave: ${line:-nothing}"; return; }

}
release-args () {

    local semver='^v[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$' slug='^[A-Za-z0-9-]+/[A-Za-z0-9._-]+$'

    while (( $# )); do

        case "${1}" in
            -t|--tag)    tag="${2:-}";    shift ;;
            -r|--repo)   repo="${2:-}";   shift ;;
            -o|--out)    out="${2:-}";    shift ;;
            -T|--target) target="${2:-}"; shift ;;
            *)           err "Unknown argument: ${1}"; return ;;
        esac

        shift

    done

    root="$(git -C "$(dirname -- "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)" || return

    if [[ -z "${repo}" ]]; then
        repo="$(git -C "${root}" remote get-url origin)" || return
        repo="${repo%.git}"
        repo="${repo#*github.com[:/]}"
    fi

    if has cygpath; then root="$(cygpath -u "${root}")" && out="$(cygpath -u "${out:-${root}/target/dist}")" || return; fi

    out="${out:-${root}/target/dist}"
    [[ "${out}" == /* ]] || out="${PWD}/${out}"

    [[ -z "${tag}" || "${tag}" =~ ${semver} ]]                  || { err "Not a release tag (vX.Y.Z): ${tag}"; return; }
    [[ "${repo}" =~ ${slug} ]]                                  || { err "Not a repository: ${repo}"; return; }
    [[ -z "${target}" ]] || assets-targets | grep -xF -- "${target}" >/dev/null || { err "Not a release target: ${target}"; return; }

}
release-plan () {

    need-all git jq awk || return

    local tag="" repo="" out="" target="" root="" version=""

    release-args "$@" && version="$(release-version "${root}")" || return

    if [[ -n "${tag}" ]]; then

        [[ "${tag#v}" == "${version}" ]] || { err "${tag} does not match the manifests at ${version}"; return; }

        git -C "${root}" rev-parse -q --verify "refs/tags/${tag}^{commit}" >/dev/null || { err "Tag not found: ${tag}"; return; }

        grep -qE "^## ${tag//./\\.}( |\$)" "${root}/CHANGELOG.md" || { err "CHANGELOG.md has no ${tag} section"; return; }

        git -C "${root}" merge-base --is-ancestor "${tag}^{commit}" origin/main || { err "${tag} is not on origin/main"; return; }

    fi

    printf 'v%s\n' "${version}"

}
release-build () {

    need-all git cargo cargo-auditable jq tar || return

    local tag="" repo="" out="" target="" root="" list="" part="" id="" bin="" exe="" base="" stage="" line="" flags="" binary=""
    local -a bins=()

    release-args "$@" || return

    [[ -n "${tag}" && -n "${target}" ]] || { err "build --target <triple> --tag <vX.Y.Z> [--repo <owner/name>] [--out <dir>]"; return; }

    list="$(assets-bins "${root}")" || return

    [[ -n "${list}" ]] || { err "No binary to release"; return; }

    mkdir -p -- "${out}" || return

    [[ "${target}" != *-windows-msvc ]] || { exe=".exe"; flags="-C target-feature=+crt-static"; }

    while read -r part; do

        if [[ "${part}" == desk ]]; then release-desk "${root}" "$(assets-triple desk- "${target}")" || return; continue; fi

        read -r -a bins <<< "$(awk -v part="${part}" '$1 == part { printf "--bin %s ", $3 }' <<< "${list}")"

        info "Building ${part} for ${target}"

        env "CARGO_TARGET_$(tr '[:lower:]-' '[:upper:]_' <<< "${target}")_RUSTFLAGS=${flags}" \
            cargo auditable build --release --locked --target "${target}" --manifest-path "${root}/platform/${part}/Cargo.toml" "${bins[@]}" \
            || { err "Failed to build ${part} for ${target}"; return; }

    done < <(cut -d ' ' -f 1 <<< "${list}" | sort -u)

    while read -r part id bin; do

        base="${id}-${tag#v}-$(assets-triple "${id}" "${target}")"
        binary="$(release-binary "${root}" "${part}" "${id}" "${bin}" "${target}" "${exe}")"
        line="$("${binary}" --version)" || line=""

        [[ "${line}" == "${bin} ${tag#v}" ]] || { err "${bin} --version gave: ${line:-nothing}"; return; }

        stage="$(mktemp -d)" && mkdir -- "${stage}/${base}" &&
        cp -- "${binary}" "${root}/LICENSE" "${root}/platform/${part}/README.md" "${stage}/${base}/" || return

        if [[ -n "${exe}" ]]; then release-zip "${stage}" "${base}" "${out}/${base}.zip" && assets-sum "${out}/${base}.zip"
        else COPYFILE_DISABLE=1 tar -czf "${out}/${base}.tar.gz" -C "${stage}" "${base}" && assets-sum "${out}/${base}.tar.gz"
        fi || { rm -rf -- "${stage}"; err "Failed to pack ${base}"; return; }

        rm -rf -- "${stage}"

        release-try "${root}" "${out}" "${repo}" "${tag}" "${id}" "${bin}" "${target}" || return

        succ "Packed -> ${base}"

    done <<< "${list}"

}
release-seal () {

    need-all git cargo jq || return

    local tag="" repo="" out="" target="" root="" list="" part="" id="" bin="" triple="" file=""
    local -a expected=()

    release-args "$@" || return

    [[ -n "${tag}" ]] || { err "seal --tag <vX.Y.Z> [--repo <owner/name>] [--out <dir>]"; return; }

    list="$(assets-bins "${root}")" || return

    while read -r part id bin; do

        for triple in $(assets-targets); do

            file="${id}-${tag#v}-$(assets-triple "${id}" "${triple}").$(assets-ext "${triple}")"

            assets-check "${out}/${file}" || return
            expected+=( "${file}" )

        done

        assets-installers "${root}/scripts" "${out}" "${repo}" "${tag}" "${id}" "${bin}" || return

        expected+=( "${id}-installer.sh" "${id}-installer.ps1" )

    done <<< "${list}"

    [[ -f "${out}/sbom.cdx.json" ]] || { err "Missing: sbom.cdx.json"; return; }

    assets-sum "${out}/sbom.cdx.json" && expected+=( sbom.cdx.json ) || return

    for file in "${out}"/*; do

        file="${file##*/}"

        [[ "${file}" != *.sha256 && "${file}" != SHA256SUMS ]] || continue
        printf '%s\n' "${expected[@]}" | grep -xF -- "${file}" >/dev/null || { err "Unexpected file: ${file}"; return; }

    done

    assets-sums "${out}" || return

    succ "Sealed -> ${#expected[@]} assets in ${out}"

}
release-publish () {

    need-all git gh awk || return

    local tag="" repo="" out="" target="" root="" notes="" draft=""
    local -a files=() kind=()

    release-args "$@" || return

    [[ -n "${tag}" && -f "${out}/SHA256SUMS" ]] || { err "publish --tag <vX.Y.Z> [--repo <owner/name>] [--out <sealed dir>]"; return; }

    files=( "${out}"/* )
    notes="$(awk -v tag="${tag}" '/^## / { on = ($2 == tag); next } on' "${root}/CHANGELOG.md")"

    [[ "${tag}" != *-* ]] || kind=( --prerelease )

    draft="$(gh release view "${tag}" --repo "${repo}" --json isDraft --jq .isDraft 2>/dev/null)" || draft=""

    if [[ "${draft}" == false ]]; then info "Release exists: ${repo}@${tag}"; return 0; fi

    if [[ -z "${draft}" ]]; then

        gh release create "${tag}" --repo "${repo}" --title "${tag}" --notes "${notes:-${tag}}" --verify-tag --draft "${kind[@]}" "${files[@]}" >/dev/null \
            || { err "Failed to draft ${repo}@${tag}"; return; }

    else

        gh release upload "${tag}" --repo "${repo}" --clobber "${files[@]}" || { err "Failed to upload to ${repo}@${tag}"; return; }

    fi

    [[ "${tag}" == *-* ]] || kind=( --latest )

    gh release edit "${tag}" --repo "${repo}" --draft=false "${kind[@]}" >/dev/null || { err "Failed to publish ${repo}@${tag}"; return; }

    succ "Released -> https://github.com/${repo}/releases/tag/${tag}"

}
release-verify () {

    need-all git cargo jq curl gh || return

    local tag="" repo="" out="" target="" root="" list="" part="" id="" bin="" tmp="" line="" host="" file="" fail=0

    release-args "$@" || return

    [[ -n "${tag}" ]] || { err "verify --tag <vX.Y.Z> [--repo <owner/name>]"; return; }

    list="$(assets-bins "${root}")" && host="$(assets-host)" || return

    while read -r part id bin; do

        tmp="$(mktemp -d)" || return

        line="$(assets-install "https://github.com/${repo}/releases/download/${tag}/${id}-installer" "${bin}" "${tmp}/bin")" || line=""

        if [[ "${line}" == "${bin} ${tag#v}" ]]; then succ "Installs -> ${id}"; else err "The public ${id} installer gave: ${line:-nothing}" || fail=1; fi

        for file in "${id}-${tag#v}-$(assets-triple "${id}" "${host}").$(assets-ext "${host}")" "${id}-installer.sh" "${id}-installer.ps1"; do

            if gh release download "${tag}" --repo "${repo}" --pattern "${file}" --dir "${tmp}" && assets-attested "${repo}" "${tag}" "${tmp}/${file}"
            then succ "Attested -> ${file}"
            else err "No provenance for ${file}" || fail=1
            fi

        done

        rm -rf -- "${tmp}"

    done <<< "${list}"

    (( fail == 0 ))

}
main () {

    case "${1:-}" in
        plan|build|seal|publish|verify) "release-${1}" "${@:2}" ;;
        *)                              err "plan | build | seal | publish | verify [--tag <vX.Y.Z>] [--target <triple>] [--repo <owner/name>] [--out <dir>]" ;;
    esac

}

main "$@"
