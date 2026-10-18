#!/bin/sh
set -eu

repo=''
tag=''
id=''
bin=''
linux=''

say () {

    printf '%s\n' "$*" >&2

}
fail () {

    say "error: $*"
    exit 1

}
digest () {

    if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d ' ' -f 1
    else shasum -a 256 "$1" | cut -d ' ' -f 1
    fi

}
target () {

    arch="$(uname -m)"
    os="$(uname -s)"

    case "${arch}" in
        x86_64|amd64)  arch=x86_64 ;;
        aarch64|arm64) arch=aarch64 ;;
        *)             fail "unsupported CPU: ${arch}" ;;
    esac

    case "${os}" in
        Linux)  printf '%s-unknown-linux-%s\n' "${arch}" "${linux:-musl}" ;;
        Darwin)
            if [ "${arch}" = x86_64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || true)" = 1 ]; then arch=aarch64; fi
            printf '%s-apple-darwin\n' "${arch}"
        ;;
        MINGW*|MSYS*|CYGWIN*) fail "on Windows run ${id}-installer.ps1 from PowerShell" ;;
        *)                    fail "unsupported OS: ${os}" ;;
    esac

}
fetch () {

    if [ -n "${from}" ]; then cp -- "${from}/$1" "${tmp}/$1"
    else curl --proto '=https' --tlsv1.2 -fsSL --retry 3 --connect-timeout 15 -o "${tmp}/$1" "https://github.com/${repo}/releases/download/${tag}/$1"
    fi || fail "cannot fetch $1"

}
main () {

    dir=''
    from=''

    while [ "$#" -gt 0 ]; do

        case "$1" in
            --dir)     [ "$#" -ge 2 ] || fail "--dir needs a path"; dir="$2"; shift ;;
            --from)    [ "$#" -ge 2 ] || fail "--from needs a directory"; from="$2"; shift ;;
            -h|--help) say "${id:-installer} [--dir <path>] [--from <directory>]"; exit 0 ;;
            *)         fail "unknown option: $1" ;;
        esac

        shift

    done

    if [ -z "${repo}" ] || [ -z "${tag}" ] || [ -z "${id}" ]; then fail "this installer was never stamped for a release"; fi
    [ -n "${from}" ] || command -v curl >/dev/null 2>&1 || fail "curl is required"
    command -v sha256sum >/dev/null 2>&1 || command -v shasum >/dev/null 2>&1 || fail "sha256sum or shasum is required"

    if [ -n "${bin}" ]; then
        triple="$(target)"
        base="${id}-${tag#v}-${triple}"
        dir="${dir:-${XDG_BIN_HOME:-${HOME}/.local/bin}}"
        say "installing ${id} ${tag} for ${triple}"
    else
        base="${id}-${tag#v}"
        dir="${dir:-${PWD}/${id}}"
        say "unpacking ${id} ${tag}"
    fi

    asset="${base}.tar.gz"
    tmp="$(mktemp -d)"

    trap 'rm -rf -- "${tmp}"' EXIT
    trap 'exit 130' INT TERM

    fetch "${asset}"
    fetch "${asset}.sha256"

    read -r sum name < "${tmp}/${asset}.sha256" || true
    [ "${name:-}" = "${asset}" ] || fail "the checksum file names ${name:-nothing}, not ${asset}"
    [ "${sum:-}" = "$(digest "${tmp}/${asset}")" ] || fail "checksum mismatch for ${asset}"

    tar -xzf "${tmp}/${asset}" -C "${tmp}"

    if [ -z "${bin}" ]; then

        [ -d "${tmp}/${base}" ] || fail "${base} is missing from ${asset}"

        mkdir -p -- "${dir}"
        [ -z "$(ls -A -- "${dir}")" ] || fail "${dir} is not empty"
        cp -R -- "${tmp}/${base}/." "${dir}/"

        say "unpacked ${dir}"
        return 0

    fi

    [ -f "${tmp}/${base}/${bin}" ] || fail "${bin} is missing from ${asset}"

    mkdir -p -- "${dir}"
    cp -- "${tmp}/${base}/${bin}" "${dir}/.${bin}.new"
    chmod 755 "${dir}/.${bin}.new"
    mv -f -- "${dir}/.${bin}.new" "${dir}/${bin}"

    say "installed ${dir}/${bin}"

    case ":${PATH}:" in
        *":${dir}:"*) ;;
        *)            say "add ${dir} to PATH to run ${bin}" ;;
    esac

}

main "$@"
