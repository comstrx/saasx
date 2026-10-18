#!/usr/bin/env bash
# shellcheck disable=SC2016

assets-targets () {

    printf '%s\n' \
        x86_64-unknown-linux-musl  aarch64-unknown-linux-musl \
        x86_64-apple-darwin        aarch64-apple-darwin \
        x86_64-pc-windows-msvc     aarch64-pc-windows-msvc

}
assets-host () {

    local arch="" os=""

    arch="$(uname -m)" && os="$(uname -s)" || return

    [[ "${os}" != MINGW* && "${os}" != MSYS* && "${os}" != CYGWIN* ]] || arch="${PROCESSOR_ARCHITEW6432:-${PROCESSOR_ARCHITECTURE:-${arch}}}"

    case "${arch}" in
        x86_64|amd64|AMD64)  arch=x86_64 ;;
        aarch64|arm64|ARM64) arch=aarch64 ;;
        *)                   err "Not a release CPU: ${arch}"; return ;;
    esac

    case "${os}" in
        Linux)                printf '%s-unknown-linux-musl\n' "${arch}" ;;
        Darwin)               printf '%s-apple-darwin\n' "${arch}" ;;
        MINGW*|MSYS*|CYGWIN*) printf '%s-pc-windows-msvc\n' "${arch}" ;;
        *)                    err "Not a release OS: ${os}"; return ;;
    esac

}
assets-ext () {

    if [[ "${1:-}" == *-windows-* ]]; then printf 'zip\n'; else printf 'tar.gz\n'; fi

}
assets-bins () {

    local root="${1:-}" manifest="" part="" spec=""
    local pick='.packages[] | .name as $name | .targets[] | select(.name == $name and any(.kind[]; . == "bin"))
        | "\($part) \(if .name == $part then .name else "\($part)-\(.name)" end) \(.name)"'

    {
        for manifest in "${root}"/platform/*/Cargo.toml; do

            part="${manifest%/Cargo.toml}"
            part="${part##*/}"

            cargo metadata --quiet --no-deps --locked --format-version 1 --manifest-path "${manifest}" | jq -r --arg part "${part}" "${pick}" | tr -d '\r' || return

        done

        if [[ -f "${root}/platform/desk/src-tauri/Cargo.toml" ]]; then
            for spec in "${root}"/platform/desk/specs/*/; do
                spec="${spec%/}"; spec="${spec##*/}"
                [[ "${spec}" == \(* ]] || printf 'desk desk-%s desk-%s\n' "${spec}" "${spec}"
            done
        fi
    } | sort

}
assets-triple () {

    local id="${1:-}" target="${2:-}"

    if [[ "${id}" == desk-* ]]; then printf '%s\n' "${target/-unknown-linux-musl/-unknown-linux-gnu}"; else printf '%s\n' "${target}"; fi

}
assets-digest () {

    if has sha256sum; then sha256sum -- "${1:-}"; else shasum -a 256 -- "${1:-}"; fi | cut -d ' ' -f 1

}
assets-sum () {

    local file="${1:-}" sum=""

    sum="$(assets-digest "${file}")" && printf '%s  %s\n' "${sum}" "${file##*/}" > "${file}.sha256"

}
assets-check () {

    local file="${1:-}"

    [[ -f "${file}" && -f "${file}.sha256" ]] || { err "Missing: ${file##*/}"; return; }
    [[ "$(< "${file}.sha256")" == "$(assets-digest "${file}")  ${file##*/}" ]] || { err "Checksum mismatch: ${file##*/}"; return; }

}
assets-sums () {

    ( cd -- "${1:-}" && cat -- *.sha256 | sort -k 2 > SHA256SUMS )

}
assets-stamp () {

    local source="${1:-}" file="${2:-}" repo="${3:-}" tag="${4:-}" id="${5:-}" bin="${6:-}" name="" linux="musl"

    [[ "${id}" =~ ^[a-z0-9][a-z0-9-]*$ ]]                 || { err "Not an asset name: ${id}"; return; }
    [[ -z "${bin}" || "${bin}" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { err "Not a binary name: ${bin}"; return; }
    [[ "${id}" != desk-* ]] || linux="gnu"

    sed -E \
        -e "s#^(\\\$?)repo( = |=)''\$#\\1repo\\2'${repo}'#" \
        -e "s#^(\\\$?)tag( = |=)''\$#\\1tag\\2'${tag}'#" \
        -e "s#^(\\\$?)id( = |=)''\$#\\1id\\2'${id}'#" \
        -e "s#^(\\\$?)bin( = |=)''\$#\\1bin\\2'${bin}'#" \
        -e "s#^linux=''\$#linux='${linux}'#" \
        "${source}" > "${file}" || return

    for name in repo tag id; do
        grep -qE "^\\\$?${name}( = |=)'[^']+'\$" "${file}" || { err "Cannot stamp ${name} into ${file##*/}"; return; }
    done

    [[ -z "${bin}" ]]        || grep -qE "^\\\$?bin( = |=)'[^']+'\$" "${file}" || { err "Cannot stamp bin into ${file##*/}"; return; }
    [[ "${file}" != *.sh ]] || grep -qE "^linux='(musl|gnu)'\$" "${file}"    || { err "Cannot stamp linux into ${file##*/}"; return; }

}
assets-installers () {

    local scripts="${1:-}" out="${2:-}" repo="${3:-}" tag="${4:-}" id="${5:-}" bin="${6:-}"

    assets-stamp "${scripts}/install.sh"  "${out}/${id}-installer.sh"  "${repo}" "${tag}" "${id}" "${bin}" &&
    assets-stamp "${scripts}/install.ps1" "${out}/${id}-installer.ps1" "${repo}" "${tag}" "${id}" "${bin}" &&
    assets-sum "${out}/${id}-installer.sh" &&
    assets-sum "${out}/${id}-installer.ps1"

}
assets-install () {

    local source="${1:-}" bin="${2:-}" dir="${3:-}" from="${4:-}" host="" args="" exe=""

    host="$(assets-host)" || return

    if [[ "${host}" == *-windows-* ]]; then

        exe=".exe"
        args="-Dir '$(cygpath -w "${dir}")'"
        [[ -z "${from}" ]] || args+=" -From '$(cygpath -w "${from}")'"

        if [[ "${source}" == https://* ]]; then
            powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((Invoke-RestMethod '${source}.ps1'))) ${args}"
        else
            powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "& '$(cygpath -w "${source}.ps1")' ${args}"
        fi

    elif [[ "${source}" == https://* ]]; then
        curl --proto '=https' --tlsv1.2 -LsSf "${source}.sh" | sh -s -- --dir "${dir}" ${from:+--from "${from}"}
    else
        sh "${source}.sh" --dir "${dir}" ${from:+--from "${from}"}
    fi || return

    if [[ -n "${bin}" ]]; then "${dir}/${bin}${exe}" --version
    elif [[ -f "${dir}/LICENSE" ]]; then printf 'unpacked\n'
    else err "Nothing unpacked into ${dir}"; return
    fi

}
assets-attested () {

    local repo="${1:-}" tag="${2:-}" file="${3:-}"

    gh attestation verify "${file}" --repo "${repo}" --signer-workflow "${repo}/.github/workflows/release.yml" --source-ref "refs/tags/${tag}" >/dev/null

}
