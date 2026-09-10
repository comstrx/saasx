#!/usr/bin/env bash
# shellcheck disable=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
set -Eeuo pipefail
shopt -s inherit_errexit

INFRAX_NAME="infrax"
INFRAX_VERSION="0.2.6"
INFRAX_TEMPLATE_SHA="b26219a9e67328390d1b3a26f59b6610d8d3ab7b51ab85d8fdc4383f18dc4164"
INFRAX_DEV_TEMPLATE="${INFRAX_DEV_TEMPLATE-}"
INFRAX_BIN="${INFRAX_BIN:-$(realpath -- "${BASH_SOURCE[0]}")}"

export INFRAX_NAME INFRAX_VERSION INFRAX_TEMPLATE_SHA INFRAX_DEV_TEMPLATE INFRAX_BIN

infrax_defaults () {

    cat <<'__INFRAX_DEFAULTS__'
STACK=light
STACKS=standard light full
CLOUD=aws
CLOUDS=aws gcp

PROJECT=
SERVICES=
MODULES=

BASE_DOMAIN=
HOST_PREFIX=
GRAFANA_HOST=grafana
DNS_PROVIDER=
CLOUDFLARE_DOMAIN_ID=
SSL_EMAIL=
ALARM_EMAIL=
ADMIN_CIDRS=

GIT_REPO_URL=
GIT_BRANCH=main
DEPLOY_PATH=deploy

SSH_HOST=
SSH_USER=ubuntu
SSH_PORT=22
SSH_KEY=
SSH_HOST_KEY=
SSH_PUBLIC_KEY=
SERVER_PATH=

AWS_PROFILE=
AWS_REGION=
GCP_PROJECT=
GCP_REGION=
GCP_ZONE=

TF_STATE_BUCKET=
TF_STATE_REGION=
TOFU_LOCK_STALE=3600
TOFU_GUARDED=aws_instance aws_eip aws_db_instance aws_eks_cluster aws_eks_node_group aws_s3_bucket google_compute_instance google_compute_address google_sql_database_instance google_container_cluster google_container_node_pool google_storage_bucket
TOFU_ALLOW_DESTROY=false

VPC_CIDR=10.0.0.0/16
AZ_COUNT=2

EC2_TYPE=m7i-flex.large
EC2_DISK_GB=40
EC2_UBUNTU=24.04
GCE_TYPE=e2-standard-2
GCE_DISK_GB=40
GCE_IMAGE=ubuntu-os-cloud/ubuntu-2404-lts-amd64

K3S_VERSION=v1.36.4+k3s1
K8S_VERSION=1.36
EKS_NODE_TYPE=c6i.xlarge
GKE_NODE_TYPE=e2-standard-4
NODE_DISK_GB=30
NODE_MIN=2
NODE_DESIRED=2
NODE_MAX=20
NODE_MAX_PODS=110
AUTOSCALER_ROLE_ARN=
EDGE_FIXED_IPS=false
EDGE_EIPS=

DB_INSTANCE_CLASS=db.t4g.medium
CLOUDSQL_TIER=db-custom-1-3840
DB_DISK_GB=50
DB_MAX_DISK_GB=200
DB_BACKUP_DAYS=7
DB_MULTI_AZ=false
DB_APPLY_NOW=true
DB_REPLICAS=0
DB_ALARM_CPU=85
DB_ALARM_FREE_GB=5

REGISTRY=
REGISTRY_USER=
GHCR_REGISTRY=ghcr.io
ECR_REGISTRY=
REGISTRY_KEEP_IMAGES=20
REGISTRY_REFRESH_SCHEDULE=0 */6 * * *

STORAGE_SIZE=10Gi
STORAGE_ENDPOINT=
BUCKET_SUFFIX=
BACKUP_BUCKET=
BACKUP_KEEP_DAYS=30
BACKUP_SCHEDULE=0 3 * * *
BACKUP_SIZE=20Gi

GATEWAY_NAMESPACE=gateway
ENVOY_NAMESPACE=envoy-gateway-system
CERT_MANAGER_NAMESPACE=cert-manager
ARGOCD_NAMESPACE=argocd
OBSERVABILITY_NAMESPACE=monitoring
K8S_NAMESPACE=

GATEWAY_TLS=true
GATEWAY_DNS01=true
RATE_LIMIT_PER_MINUTE=3000

REPLICAS_MIN=2
REPLICAS_MAX=
CPU_TARGET=75
ROLLOUT_SURGE=
ROLLOUT_UNAVAILABLE=
AUTOSCALER_ENABLED=
METRICS_SERVER_ENABLED=
CLOUD_METRICS=

RELEASE_WAIT=900
RELEASE_POLL=15
RUN_CPU=100m
RUN_MEMORY=384Mi
RUN_MEMORY_LIMIT=1536Mi
RUN_TTL=86400
RUN_START=300
RUN_POLL=5
RUN_REACH=5
PROVE_WAIT=90

OBSERVABILITY_ENABLED=true
LOGS_ENABLED=true
LOG_RETENTION_DAYS=30
METRICS_RELEASE=metrics
METRICS_RETENTION=7d
METRICS_SIZE=20Gi
LOGS_RELEASE=logs
LOGS_SIZE=20Gi
LOGS_RETENTION_HOURS=168h
ALERT_CHAT_ID=
REDIS_EXPORTER_KEYS=

LOAD_IMAGE=grafana/k6:1.8.1
LOAD_PODS=4
LOAD_RATE=500
LOAD_DURATION=60s
LOAD_RAMP=30s
LOAD_VUS=200
LOAD_CPU=1

AUDIT_IMAGE=curlimages/curl:8.22.0
AWS_CLI_IMAGE=amazon/aws-cli:2.36.42
GCLOUD_IMAGE=google/cloud-sdk:584.0.0-alpine
DOCKER_NETWORK=

WATCH_TARGETS=
WATCH_CERT_DAYS=14
CI_GATE_ATTEMPTS=30

HELM_TIMEOUT=10m
ARGOCD_SYNC_STALL=1800
ARGOCD_SYNC_RETRIES=5
ARGOCD_NUDGE_TICKS=6
ROLLOUT_TIMEOUT=600s
POD_LOG_LINES=50
SERVER_ROLLOUT_TRIES=120
CI_BOT_NAME=infrax-bot
CI_BOT_EMAIL=infrax-bot@users.noreply.github.com

ARGOCD_VERSION=v3.5.2
ENVOY_GATEWAY_VERSION=1.9.1
CERT_MANAGER_VERSION=v1.21.1
METRICS_SERVER_VERSION=3.14.0
AUTOSCALER_VERSION=9.59.0
AUTOSCALER_IMAGE_TAG=v1.36.1
PROMETHEUS_STACK_VERSION=90.0.0
LOKI_VERSION=7.3.0
ALLOY_VERSION=1.12.1
REDIS_EXPORTER_VERSION=6.31.1
POSTGRES_EXPORTER_VERSION=8.2.0
MYSQL_EXPORTER_VERSION=2.15.0
CLOUDWATCH_EXPORTER_VERSION=0.28.2
HELM_VERSION=v4.3.0
TOFU_VERSION=1.12.6
KUBECONFORM_VERSION=v0.8.0
ACTIONLINT_VERSION=1.7.12
GITLEAKS_VERSION=8.30.1
TRIVY_VERSION=0.74.0
CVE_ALLOW=false
CVE_IGNORE=

LOCAL_KEYS=AWS_PROFILE SSH_KEY
SERVER_SKIP_KEYS=SSH_PASSWORD SSH_PRIVATE_KEY AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY GCP_CREDENTIALS

INFRAX_NAME=infrax
INFRAX_VERSION=0.2.6
INFRAX_REPO=comstrx/infrax
INFRAX_INSTALL_DIR=~/.local/bin
TARGET_DIR=target
SHELLCHECK_EXCLUDES=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
SHELLCHECK_SEVERITY=warning
NEUTRAL_EXEMPT=go node storage
FORGE_KEYS=TARGET_DIR NEUTRAL_EXEMPT

INPUT_TIMEOUT=300
TOOL_RETRIES=4
LOCK_DIR=/tmp
KUBE_DIR=~/.kube
TOOL_BIN_DIR=/usr/local/bin
IMAGE_TAG_LENGTH=12
LOCAL_STORAGE_CLASS=local-path
REPLICAS_MAX_SSH=3
REPLICAS_MAX_MANAGED=60
MATRIX_HOST=managed.invalid
LINT_DOMAIN=lint.example
LINT_EMAIL=lint@example.com

SSH_CONNECT_TIMEOUT=15
SSH_ALIVE_INTERVAL=30
SSH_ALIVE_COUNT=10
SERVER_WAIT=300
SERVER_POLL=10
SERVER_ROLLOUT_POLL=10
NODE_REGISTER_TRIES=60
NODE_REGISTER_POLL=2
NODE_READY_TIMEOUT=180s
PVC_TIMEOUT=300s
TOFU_LOCK_TIMEOUT=10m
CI_GATE_POLL=30
BACKUP_JOB_TRIES=180
BACKUP_JOB_POLL=10
AUDIT_PROBE_TRIES=45
AUDIT_PROBE_POLL=2

SERVER_ROOT=/opt
SERVER_ALLOWED_ROOTS=/opt /srv /home
K3S_INSTALL_URL=https://get.k3s.io
K3S_INSTALL_ARGS=server --disable traefik
K3S_KUBECONFIG=/etc/rancher/k3s/k3s.yaml
K3S_API_PORT=6443
INOTIFY_INSTANCES=1024
INOTIFY_WATCHES=1048576
INOTIFY_CONF=/etc/sysctl.d/99-inotify.conf

GITHUB_URL=https://github.com
GITHUB_API=https://api.github.com
CLOUDFLARE_API=https://api.cloudflare.com/client/v4
TELEGRAM_API=https://api.telegram.org
ARGOCD_MANIFESTS=https://raw.githubusercontent.com/argoproj/argo-cd
GCP_METADATA_URL=http://metadata.google.internal/computeMetadata/v1
PROMETHEUS_PORT=9090
LOKI_PORT=3100

APT_KEYRINGS=/etc/apt/keyrings
APT_SOURCES=/etc/apt/sources.list.d
CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
DOCKER_APT_URL=https://download.docker.com/linux
GCLOUD_APT_URL=https://packages.cloud.google.com/apt
GCLOUD_KEY_URL=https://packages.cloud.google.com/apt/doc/apt-key.gpg
K8S_RELEASE_URL=https://dl.k8s.io/release
HELM_INSTALLER_URL=https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
TOFU_INSTALLER_URL=https://get.opentofu.org/install-opentofu.sh
AWSCLI_URL=https://awscli.amazonaws.com
KUBECONFORM_RELEASES=https://github.com/yannh/kubeconform/releases/download
ACTIONLINT_RELEASES=https://github.com/rhysd/actionlint/releases/download
GITLEAKS_RELEASES=https://github.com/gitleaks/gitleaks/releases/download
TRIVY_RELEASES=https://github.com/aquasecurity/trivy/releases/download
__INFRAX_DEFAULTS__

}

infrax_manifest () {

    cat <<'__INFRAX_MANIFEST__'
# providers
GIT_TOKEN=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
GCP_CREDENTIALS=
CLOUDFLARE_API_TOKEN=

# platform
ARGOCD_PASSWORD=
GRAFANA_PASSWORD=
ALERT_BOT_TOKEN=

# modules
POSTGRESQL_PASSWORD=
MYSQL_PASSWORD=
REDIS_PASSWORD=
PGADMIN4_PASSWORD=
TOOLS_PASSWORD=
BACKUP_AWS_ACCESS_KEY_ID=
BACKUP_AWS_SECRET_ACCESS_KEY=

# ssh
SSH_PRIVATE_KEY=
SSH_PASSWORD=
__INFRAX_MANIFEST__

}

# @core cli

## the command line — flags, modules, dispatch, help

cli_modules () {

    infrax_code | sed -n 's/^# @module //p'

}
cli_section () {

    infrax_code | sed -n "/^# @module ${1}\$/,/^# @[a-z]/p"

}
cli_is_test () {

    declare -F "${1}" >/dev/null && [[ -n "$(infrax_code | sed -n '/^# @test /,/^# @entry/p' | grep -E "^${1} \(\)")" ]]

}
cli_has_module () {

    [[ " $(cli_modules | paste -sd ' ' -) " == *" ${1} "* ]]

}
module_doc () {

    cli_section "${1}" | sed -n '2,4{ s/^## //p; }' | head -1

}
commands_of () {

    local name="${1}" indent="${2}" doc="" line="" fn=""

    while IFS= read -r line; do

        if [[ "${line}" == "## "* ]]; then doc="${line#\#\# }"; continue; fi

        if [[ "${line}" =~ ^${name}_([a-z_]+)\ \(\) && -n "${doc}" ]]; then

            fn="$(tr '_' '-' <<< "${BASH_REMATCH[1]}")"
            printf "${indent}%-22s %s\n" "${fn}" "${doc}"

        fi

        doc=""

    done < <(cli_section "${name}")

}
command_help () {

    local name="${1}" command="${2}" fn="" section="" doc="" usage="" needs=""

    fn="${name}_${command//-/_}"
    section="$(cli_section "${name}" | sed -n "/^${fn} ()/,/^}/p")"

    [[ -n "${section}" ]] || { printf '❌ Unknown command: %s %s\n' "${name}" "${command}" >&2; exit 1; }

    doc="$(cli_section "${name}" | grep -B1 "^${fn} ()" | sed -n 's/^## //p' || true)"
    usage="$(grep -oE 'Usage: [^}"]*' <<< "${section}" | head -1 || true)"
    needs="$(grep -oE '\$\{[0-9]:\?[^}]*\}' <<< "${section}" | sed -E 's/^\$\{([0-9]):\?(Usage: )?([^}]*)\}$/\1: \3/' | paste -sd ';' - || true)"

    printf '%s %s %s — %s\n' "${INFRAX_NAME}" "${name}" "${command}" "${doc:-undocumented}"

    [[ -z "${usage}" ]] || printf '  %s\n' "${usage}"
    [[ -z "${needs}" || -n "${usage}" ]] || printf '  arguments — %s\n' "${needs}"

    exit 0

}
module_help () {

    cli_has_module "${1}" || { printf '❌ Unknown module: %s\n' "${1}" >&2; exit 1; }

    [[ -z "${2:-}" ]] || command_help "${1}" "${2}"

    printf '%s\n\n' "${INFRAX_NAME} ${1} — $(module_doc "${1}")"
    commands_of "${1}" "  "

    exit 0

}
usage () {

    local name=""

    printf '%s\n' \
        "${INFRAX_NAME} ${INFRAX_VERSION} — one manifest, one production platform" \
        "" \
        "Usage: ${INFRAX_NAME} [options] <module> <command> [args...]" \
        "" \
        "Options:" \
        "  -s, --stack <name>       the environment to act on (see STACKS)" \
        "  -c, --config <file>      load this env file — repeatable, the last one wins" \
        "  -r, --repo <dir>         the project repo to act on (default: the one around you)" \
        "  -y, --yes                auto-approve every confirmation" \
        "  -e, --env <KEY=VALUE>    override any config variable (repeatable)" \
        "  -l, --list               every module with every command" \
        "  -h, --help               this overview — '${INFRAX_NAME} help <module> [command]' goes deeper" \
        "  -V, --version            show version" \
        "" \
        "Config precedence: flags > process env > JSON_ENV > --config files > infrax.<stack>.env > infrax.env > built-in defaults" \
        "" \
        "Modules:"

    for name in $(cli_modules); do

        printf '  %-10s %s\n' "${name}" "$(module_doc "${name}")"

    done

    printf '%s\n' \
        "" \
        "Examples:" \
        "  ${INFRAX_NAME} -s light ci release                    converge, build, prove, push, scan, vendor, bump — argocd deploys" \
        "  ${INFRAX_NAME} -s standard -y server deploy           any linux over ssh becomes the platform" \
        "  ${INFRAX_NAME} -s light app run api -- php artisan about   one command on the live release of one service" \
        "  ${INFRAX_NAME} audit all                              every live production check in one sweep" \
        "  ${INFRAX_NAME} self update                            the latest release, checksum verified"

    exit "${1:-0}"

}
listing () {

    local name=""

    for name in $(cli_modules); do

        printf '%s\n' "  ${name} — $(module_doc "${name}")"
        commands_of "${name}" "    "
        printf '\n'

    done

    exit 0

}
flags () {

    while [[ $# -gt 0 ]]; do

        if (( ${#ARGS[@]} )); then

            ARGS+=( "${1}" )
            shift
            continue

        fi

        case "${1}" in

            -- )
                shift
                ARGS+=( "$@" )
                break ;;

            -s | --stack )
                [[ -n "${2:-}" ]] || { printf '❌ Missing stack name\n' >&2; exit 1; }
                export STACK="${2}" INFRAX_FLAGS="${INFRAX_FLAGS:-} STACK"
                shift 2 ;;

            -c | --config )
                [[ -f "${2:-}" ]] || { printf '❌ Config file not found: %s\n' "${2:-}" >&2; exit 1; }
                INFRAX_CONFIG="${INFRAX_CONFIG:+${INFRAX_CONFIG}$'\n'}$(realpath "${2}")"
                export INFRAX_CONFIG
                shift 2 ;;

            -r | --repo )
                [[ -d "${2:-}" ]] || { printf '❌ Repo directory not found: %s\n' "${2:-}" >&2; exit 1; }
                REPO_ROOT="$(realpath "${2}")"
                export REPO_ROOT
                shift 2 ;;

            -y | --yes )
                export INFRAX_YES=1
                shift ;;

            -e | --env )
                [[ "${2:-}" == *=* ]] || { printf '❌ Invalid override: %s\n' "${2:-}" >&2; exit 1; }
                export "${2?}"
                export INFRAX_FLAGS="${INFRAX_FLAGS:-} ${2%%=*}"
                shift 2 ;;

            -l | --list )
                listing ;;

            -h | --help )
                usage ;;

            -V | --version )
                printf '%s %s\n' "${INFRAX_NAME}" "${INFRAX_VERSION}"
                exit 0 ;;

            -* )
                printf '❌ Unknown option: %s\n' "${1}" >&2
                usage 1 ;;

            * )
                ARGS+=( "${1}" )
                shift ;;

        esac

    done

}
main () {

    local module="" command="" fn=""

    ARGS=()
    flags "$@"

    module="${ARGS[0]:-}"
    command="${ARGS[1]:-}"

    if [[ "${module}" == "help" ]]; then

        if [[ -n "${command}" ]]; then module_help "${command}" "${ARGS[2]:-}"; else usage; fi

    fi

    [[ -n "${module}" ]] || usage 1

    if cli_is_test "${module}"; then

        "${module}" "${ARGS[@]:1}"
        return

    fi

    cli_has_module "${module}" || die "Unknown module: ${module}"

    if [[ "${module}" == "self" ]]; then config_light; else config_load; fi

    if [[ -z "${command}" ]]; then

        commands_of "${module}" "  "
        exit 1

    fi

    fn="${module}_${command//-/_}"

    declare -F "${fn}" >/dev/null || die "Unknown function: ${module} ${command}"

    "${fn}" "${ARGS[@]:2}"

}

# @core config

## configuration — one resolution, every source in its rank

infrax_code () {

    sed '/^#__INFRAX_PAYLOAD__$/,$d' "${INFRAX_BIN}"

}
infrax_keys () {

    { infrax_defaults; infrax_manifest; } | sed -nE 's/^([A-Z][A-Z0-9_]*)=.*/\1/p' | sort -u

}
infrax_local_keys () {

    infrax_defaults | sed -n 's/^LOCAL_KEYS=//p'

}
env_pairs () {

    local line="" key=""

    while IFS= read -r line || [[ -n "${line}" ]]; do

        [[ -n "${line}" && "${line}" != \#* && "${line}" == *=* ]] || continue

        key="${line%%=*}"
        [[ "${key}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue

        printf '%s\n' "${line}"

    done

}
env_apply () {

    local keep="${1:-}" line="" key="" value="" pairs=() i=0

    mapfile -t pairs

    for (( i = ${#pairs[@]} - 1; i >= 0; i-- )); do

        line="${pairs[i]}"
        key="${line%%=*}"
        value="${line#*=}"

        [[ -n "${value}" || -n "${keep}" ]] || continue
        [[ -z "${!key:-}" && " ${INFRAX_FLAGS:-} " != *" ${key} "* ]] || continue

        export "${key}=${value}" INFRAX_LOADED="${INFRAX_LOADED:-} ${key}"

    done

}
env_load () {

    local file="${1:-}"

    [[ -f "${file}" ]] || die "Config file not found: ${file}"

    env_apply < <(env_pairs < "${file}")

}
env_files_load () {

    local configs=() i=0

    [[ -n "${INFRAX_CONFIG:-}" ]] || return 0

    mapfile -t configs <<< "${INFRAX_CONFIG}"

    for (( i = ${#configs[@]} - 1; i >= 0; i-- )); do

        [[ -z "${configs[i]}" ]] || env_load "${configs[i]}"

    done

}
env_admits () {

    local key="${1:?env_admits needs a key}" manifest="${2:-}"

    [[ "${manifest}" == *" ${key} "* || "${key}" =~ ^SERVICE_[A-Z0-9_]+$ ]]

}
env_json_load () {

    [[ -n "${JSON_ENV:-}" ]] || return 0

    ensure jq

    local pair="" key="" value="" manifest="" local_keys=""

    manifest=" $(infrax_keys | paste -sd ' ' -) "
    local_keys=" $(infrax_local_keys) "

    while IFS= read -r pair; do

        key="${pair%%=*}"

        env_admits "${key}" "${manifest}" || continue
        [[ "${local_keys}" != *" ${key} "* && -z "${!key:-}" ]] || continue

        value="$(base64 -d <<< "${pair#*=}")"
        [[ -n "${value}" ]] || continue

        export "${key}=${value}" INFRAX_MANIFEST="${INFRAX_MANIFEST:-} ${key}"

    done < <(jq -r 'to_entries[] | "\(.key)=\(.value|@base64)"' <<< "${JSON_ENV}")

    unset JSON_ENV

}
manifest_files () {

    local base="${REPO_ROOT}/infrax.env" stack="${STACK:-}"

    [[ -n "${stack}" || ! -f "${base}" ]] || stack="$(sed -n 's/^STACK=//p' "${base}" | tail -n 1)"
    [[ -n "${stack}" ]] || stack="$(infrax_defaults | sed -n 's/^STACK=//p')"

    printf '%s\n' "${REPO_ROOT}/infrax.${stack}.env" "${base}"

}
manifest_load () {

    local file=""

    while IFS= read -r file; do

        [[ ! -f "${file}" ]] || env_apply < <(env_pairs < "${file}")

    done < <(manifest_files)

}
config_preset () {

    case "${STACK}" in

        full  ) printf '%s\n' 'cluster=managed' 'provisioner=full'  'data=managed' 'identity=true'  'storage=object' 'edge=lb' 'registry=' 'rollout=surge' ;;
        light ) printf '%s\n' 'cluster=ssh'     'provisioner=light' 'data=cluster' 'identity=true'  'storage=object' 'edge='   'registry=' 'rollout=swap' ;;
        *     ) printf '%s\n' 'cluster=ssh'     'provisioner='      'data=cluster' 'identity=false' 'storage=volume' 'edge='   "registry=${GHCR_REGISTRY}" 'rollout=surge' ;;

    esac

}
config_derive () {

    local cluster="" provisioner="" data="" identity="" storage="" edge="" registry="" rollout="" surge=1 unavailable=0 addons="" \
          class="${LOCAL_STORAGE_CLASS}" managed=false section=http pull=false ceiling="${REPLICAS_MAX_SSH}" repo="" owner="" line="" key="" derived="" \
          keys="CLUSTER_SOURCE PROVISIONER DATA_MODE CLOUD_IDENTITY STORAGE_MODE EDGE_TYPE GIT_REPO REGISTRY REGISTRY_USER CLUSTER_NAME K8S_NAMESPACE BUCKET_SUFFIX TF_STATE_BUCKET BACKUP_BUCKET BACKUP_TARGET GATEWAY_SECTION VOLUME_CLASS REPLICAS_MAX ROLLOUT_SURGE ROLLOUT_UNAVAILABLE AUTOSCALER_ENABLED METRICS_SERVER_ENABLED CLOUD_METRICS REGISTRY_PULL KUBECONFIG SERVER_PATH"

    for key in ${keys}; do

        [[ -n "${!key:-}" ]] || derived+="${derived:+ }${key}"

    done

    while IFS= read -r line; do

        declare "${line}"

    done < <(config_preset)

    export CLUSTER_SOURCE="${CLUSTER_SOURCE:-${cluster}}"
    export PROVISIONER="${PROVISIONER:-${provisioner}}"
    export DATA_MODE="${DATA_MODE:-${data}}"
    export CLOUD_IDENTITY="${CLOUD_IDENTITY:-${identity}}"
    export STORAGE_MODE="${STORAGE_MODE:-${storage}}"
    export EDGE_TYPE="${EDGE_TYPE:-${edge}}"

    if [[ "${CLUSTER_SOURCE}" == "managed" ]]; then

        managed=true
        ceiling="${REPLICAS_MAX_MANAGED}"
        class="$(cloud volume_class)"
        addons=" $(cloud managed_addons) "

    fi

    [[ "${GATEWAY_TLS}" != "true" ]] || section=https
    [[ "${rollout}" != "swap" ]] || { surge=0; unavailable=1; }

    repo="${GIT_REPO:-$(printf '%s' "${GIT_REPO_URL%.git}" | sed -E 's#^.*[:/]([^/]+/[^/]+)$#\1#')}"
    owner="${repo%%/*}"

    export GIT_REPO="${repo}"
    export REGISTRY="${REGISTRY:-${registry}}"
    export REGISTRY_USER="${REGISTRY_USER:-${REGISTRY:+${owner}}}"

    [[ -z "${REGISTRY_USER}" ]] || pull=true
    [[ -n "${REGISTRY}" || "${CLOUD_IDENTITY}" != "true" || "${managed}" == "true" ]] || pull=true

    export CLUSTER_NAME="${CLUSTER_NAME:-${PROJECT}}"
    export K8S_NAMESPACE="${K8S_NAMESPACE:-${PROJECT}}"
    export BUCKET_SUFFIX="${BUCKET_SUFFIX:-$(model_suffix)}"
    export TF_STATE_BUCKET="${TF_STATE_BUCKET:-${PROJECT}-state-${BUCKET_SUFFIX}}"
    export BACKUP_BUCKET="${BACKUP_BUCKET:-${PROJECT}-backups-${BUCKET_SUFFIX}}"
    export BACKUP_TARGET="${BACKUP_TARGET:-${STORAGE_MODE}}"
    export GATEWAY_SECTION="${GATEWAY_SECTION:-${section}}"
    export VOLUME_CLASS="${VOLUME_CLASS:-${class}}"
    export REPLICAS_MAX="${REPLICAS_MAX:-${ceiling}}"
    export ROLLOUT_SURGE="${ROLLOUT_SURGE:-${surge}}"
    export ROLLOUT_UNAVAILABLE="${ROLLOUT_UNAVAILABLE:-${unavailable}}"
    export AUTOSCALER_ENABLED="${AUTOSCALER_ENABLED:-$( [[ "${addons}" == *" autoscaler "* ]] && printf true || printf false )}"
    export METRICS_SERVER_ENABLED="${METRICS_SERVER_ENABLED:-$( [[ "${addons}" == *" metrics-server "* ]] && printf true || printf false )}"
    export CLOUD_METRICS="${CLOUD_METRICS:-$( [[ "${DATA_MODE}" == "managed" ]] && printf true || printf false )}"
    export REGISTRY_PULL="${REGISTRY_PULL:-${pull}}"
    export KUBECONFIG="${KUBECONFIG:-$(path_expand "${KUBE_DIR}")/${PROJECT:-${INFRAX_NAME}}.yaml}"
    export SERVER_PATH="${SERVER_PATH:-${SERVER_ROOT}/${PROJECT}/${INFRAX_NAME}}"
    export INFRAX_DERIVED="${derived}"

}
config_override_keys () {

    local name=""

    compgen -v SERVICE_ || true

    for name in $(model_names runtime) $(model_names module); do

        compgen -v "$(model_key "${name}")_" || true

    done

}
config_render () {

    local dst="${1:?config_render needs a destination}" key="" value="" skip=""

    umask 077

    skip=" ${LOCAL_KEYS} ${SERVER_SKIP_KEYS} "

    : > "${dst}" || die "Cannot write: ${dst}"
    chmod 600 "${dst}"

    while IFS= read -r key; do

        [[ "${skip}" != *" ${key} "* ]] || continue

        value="${!key:-}"

        [[ -n "${value}" ]] || continue
        [[ "${value}" != *$'\n'* ]] || { warn "${key} spans lines — it cannot ride a flat env file, left behind"; continue; }

        printf '%s=%s\n' "${key}" "${value}" >> "${dst}"

    done < <({ infrax_keys; config_override_keys; } | sort -u)

}
config_reset () {

    local key=""

    for key in ${INFRAX_DERIVED:-} ${INFRAX_LOADED:-}; do

        [[ " ${INFRAX_FLAGS:-} ${INFRAX_MANIFEST:-} " == *" ${key} "* ]] || unset "${key}"

    done

    INFRAX_LOADED=""

}
config_ssh_key () {

    local raw="${SSH_PRIVATE_KEY:-}"

    [[ -n "${raw}" ]] || return 0
    [[ -z "${SSH_KEY:-}" || ! -f "${SSH_KEY}" ]] || return 0

    umask 077

    SSH_KEY="$(mktemp)"

    if [[ "${raw}" == -----BEGIN* ]]; then printf '%s\n' "${raw}" > "${SSH_KEY}"; else base64 -d <<< "${raw}" > "${SSH_KEY}" || die "SSH_PRIVATE_KEY is neither a key nor base64"; fi

    export SSH_KEY

}
config_roots () {

    REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd -P)}"
    BUILD_DIR="${BUILD_DIR:-${REPO_ROOT}/.${INFRAX_NAME}}"
    TEMPLATE_DIR="${TEMPLATE_DIR:-$(template_dir)}"

    export REPO_ROOT BUILD_DIR TEMPLATE_DIR

}
cloud () {

    local fn="${CLOUD:?Missing CLOUD — the provider this platform provisions on}_${1:?cloud needs a verb}"

    shift

    declare -F "${fn}" >/dev/null || die "Cloud '${CLOUD}' does not implement '${fn}' — teach module/${CLOUD}.sh"

    "${fn}" "$@"

}
config_load () {

    config_roots
    config_reset

    env_json_load
    env_files_load
    manifest_load
    env_apply keep < <(infrax_defaults | env_pairs)

    config_ssh_key

    export STACK="${STACK:?Missing STACK — the environment this run acts on}"
    export STACKS="${STACKS:?Missing STACKS — the stack names this platform recognises}"
    export CLOUD="${CLOUD:?Missing CLOUD — the provider this platform provisions on}"
    export DEPLOY_PATH="${DEPLOY_PATH:?Missing DEPLOY_PATH — the gitops path inside the repo, ArgoCD reads it}"

    [[ " ${STACKS} " == *" ${STACK} "* ]] || die "Unknown stack '${STACK}' — STACKS declares: ${STACKS}"
    [[ " ${CLOUDS} " == *" ${CLOUD} "* ]] || die "Unknown cloud '${CLOUD}' — CLOUDS declares: ${CLOUDS}"

    [[ -n "${AWS_PROFILE:-}" ]] || unset AWS_PROFILE
    [[ -z "${AWS_ACCESS_KEY_ID:-}" ]] || unset AWS_PROFILE

    template_ensure
    config_derive

}
config_light () {

    config_roots

    env_json_load
    env_files_load
    env_apply keep < <(infrax_defaults | env_pairs)

}

# @core fs

ensure_dir () {

    local dir="${1:-}"

    [[ -d "${dir}" ]] || mkdir -p "${dir}" || die "Cannot mkdir: ${dir}"

}
tmp_file () {

    mktemp || die "Cannot create temp file"

}
tmp_dir () {

    mktemp -d || die "Cannot create temp dir"

}
placeholders () {

    local file="${1:-}"

    grep -oE '\$\{[A-Za-z_][A-Za-z0-9_]*\}' "${file}" 2>/dev/null | sort -u | tr -d "\${}"

}
render_text () {

    local text="" key="" list=""

    ensure envsubst

    text="$(cat)"

    for key in $({ grep -oE '\$\{[A-Za-z_][A-Za-z0-9_]*\}' <<< "${text}" || true; } | sort -u | tr -d "\${}"); do

        [[ -n "${!key+x}" ]] || die "Render missing: ${key}"

        list+="\${${key}} "

    done

    envsubst "${list}" <<< "${text}"

}
render () {

    local src="${1:-}" dst="${2:-}"

    [[ -f "${src}" ]] || die "Missing template: ${src}"

    ensure_dir "$(dirname "${dst}")"

    render_text < "${src}" > "${dst}" || die "Cannot render: ${src}"

}
yaml_str () {

    ensure jq

    jq -Rn --arg value "${1:-}" '$value'

}
yaml_list () {

    local item="" out=""

    for item in "$@"; do

        out+="${out:+, }$(yaml_str "${item}")"

    done

    printf '[%s]' "${out}"

}
uri_encode () {

    ensure jq

    jq -rn --arg value "${1:-}" '$value | @uri'

}
argv_list () {

    local word="" out=""

    for word in "$@"; do

        out+="${out:+, }$(yaml_str "${word}")"

    done

    printf '[%s]' "${out}"

}
argv_json () {

    local text="${1:-}" words=()

    [[ "${text}" != \[* ]] || { printf '%s' "${text}"; return 0; }

    read -ra words <<< "${text}"

    argv_list "${words[@]}"

}
indent () {

    local width="${1:?indent needs a width}" pad=""

    printf -v pad '%*s' "${width}" ''

    sed "s/^/${pad}/"

}
path_expand () {

    printf '%s' "${1/#\~/${HOME}}"

}

# @core log

log () {

    printf '%s\n' "$*" >&2

}
info () {

    printf 'ℹ️  %s\n' "$*" >&2

}
warn () {

    printf '⚠️  %s\n' "$*" >&2

}
succ () {

    printf '✅ %s\n' "$*" >&2

}
err () {

    printf '❌ %s\n' "$*" >&2

}
step () {

    printf '🚀 %s\n' "$*" >&2

}
die () {

    err "$*"
    exit 1

}

# @core model

## the project model — services, modules, runtimes and bindings, every answer derived from the manifest and the templates

model_key () {

    local name="${1:?model_key needs a name}"

    name="${name^^}"

    printf '%s' "${name//-/_}"

}
model_ident () {

    local name="${1:?model_ident needs a name}"

    printf '%s' "${name//-/_}"

}
model_names () {

    local kind="${1:?model_names needs a kind}" entry=""

    for entry in "${TEMPLATE_DIR}/${kind}"/*/; do

        [[ -d "${entry}" ]] || continue

        entry="${entry%/}"
        printf '%s\n' "${entry##*/}"

    done

}
model_read () {

    local file="${1:?model_read needs a file}" key="${2:?model_read needs a key}"

    [[ -f "${file}" ]] || return 0

    sed -n "s/^${key}=//p" "${file}" | tail -n 1

}
model_keys () {

    local file="${1:?model_keys needs a file}"

    [[ -f "${file}" ]] || return 0

    sed -nE 's/^([A-Z][A-Z0-9_]*)=.*/\1/p' "${file}"

}
model_fqdn () {

    printf '%s%s.%s' "${HOST_PREFIX:-}" "${1:?model_fqdn needs a label}" "${BASE_DOMAIN:?Missing BASE_DOMAIN — every public name lives under it}"

}
model_suffix () {

    printf '%s/%s' "${BASE_DOMAIN:-}" "${PROJECT:-}" | sha256sum | cut -c1-6

}
model_bucket () {

    printf '%s-%s-%s' "${PROJECT:?Missing PROJECT}" "${1:?model_bucket needs a purpose}" "${BUCKET_SUFFIX}"

}
runtime_dir () {

    local runtime="${1:?runtime_dir needs a runtime}"

    [[ -f "${TEMPLATE_DIR}/runtime/${runtime}/profile.env" ]] \
        || die "Unknown runtime '${runtime}' — infrax runs: $(model_names runtime | paste -sd ' ' -)"

    printf '%s' "${TEMPLATE_DIR}/runtime/${runtime}"

}
runtime_get () {

    local runtime="${1:?runtime_get needs a runtime}" key="${2:?runtime_get needs a key}" override=""

    override="$(model_key "${runtime}")_${key}"

    if [[ -n "${!override:-}" ]]; then

        printf '%s' "${!override}"
        return 0

    fi

    model_read "$(runtime_dir "${runtime}")/profile.env" "${key}"

}
service_var () {

    printf 'SERVICE_%s_%s' "$(model_key "${1:?service_var needs a service}")" "${2:?service_var needs a key}"

}
service_runtime () {

    local service="${1:?service_runtime needs a service}" name=""

    name="$(service_var "${service}" RUNTIME)"

    [[ -n "${!name:-}" ]] || die "Service '${service}' declares no runtime — set ${name} to one of: $(model_names runtime | paste -sd ' ' -)"

    printf '%s' "${!name}"

}
service_get () {

    local service="${1:?service_get needs a service}" key="${2:?service_get needs a key}" name="" value=""

    name="$(service_var "${service}" "${key}")"
    value="${!name:-}"

    [[ -n "${value}" ]] || value="$(runtime_get "$(service_runtime "${service}")" "${key}")"

    if [[ -z "${value}" ]]; then

        case "${key}" in
            REPLICAS_MIN | REPLICAS_MAX | CPU_TARGET ) value="${!key:-}" ;;
        esac

    fi

    [[ "${value}" != "none" ]] || value=""

    printf '%s' "${value}"

}
service_path () {

    local service="${1:?service_path needs a service}" path=""

    path="$(service_get "${service}" PATH)"

    printf '%s' "${path:-${service}}"

}
service_processes () {

    local service="${1:?service_processes needs a service}" processes=""

    processes="$(service_get "${service}" PROCESSES)"

    printf '%s' "${processes:-web}"

}
service_hosts () {

    local service="${1:?service_hosts needs a service}" label="" host=""

    for label in $(service_get "${service}" HOST); do

        host="$(model_fqdn "${label}")"
        printf '%s\n' "${host}"

    done

}
service_host () {

    local hosts=()

    mapfile -t hosts < <(service_hosts "${1:?service_host needs a service}")

    printf '%s' "${hosts[0]:-}"

}
service_url () {

    local service="${1:?service_url needs a service}" host=""

    host="$(service_host "${service}")"

    if [[ -n "${host}" ]]; then

        printf 'https://%s' "${host}"
        return 0

    fi

    printf 'http://%s:%s' "${service}" "$(service_get "${service}" PORT)"

}
service_uses () {

    service_get "${1:?service_uses needs a service}" USES

}
service_calls () {

    service_get "${1:?service_calls needs a service}" CALLS

}
service_callers () {

    local service="${1:?service_callers needs a service}" other="" callee=""

    for other in ${SERVICES:-}; do

        for callee in $(service_calls "${other}"); do

            [[ "${callee}" != "${service}" ]] || printf '%s\n' "${other}"

        done

    done

}
service_bucket () {

    model_bucket "${1:?service_bucket needs a service}"

}
service_storage () {

    local service="${1:?service_storage needs a service}" module=""

    for module in $(service_uses "${service}"); do

        [[ "$(module_kind "${module}")" != "storage" ]] || { printf '%s' "${module}"; return 0; }

    done

}
module_dir () {

    local module="${1:?module_dir needs a module}"

    [[ -f "${TEMPLATE_DIR}/module/${module}/module.env" ]] \
        || die "Unknown module '${module}' — infrax carries: $(model_names module | paste -sd ' ' -)"

    printf '%s' "${TEMPLATE_DIR}/module/${module}"

}
module_get () {

    local module="${1:?module_get needs a module}" key="${2:?module_get needs a key}" override=""

    override="$(model_key "${module}")_${key}"

    if [[ -n "${!override:-}" ]]; then

        printf '%s' "${!override}"
        return 0

    fi

    model_read "$(module_dir "${module}")/module.env" "${key}"

}
module_kind () {

    module_get "${1:?module_kind needs a module}" KIND

}
module_mode () {

    local module="${1:?module_mode needs a module}" mode="" kind=""

    mode="$(module_get "${module}" MODE)"
    kind="$(module_kind "${module}")"

    if [[ -z "${mode}" ]]; then

        case "${kind}" in
            storage  ) mode="${STORAGE_MODE}" ;;
            database ) mode="cluster"; [[ "${DATA_MODE}" != "managed" || "$(module_get "${module}" MANAGED)" != "true" ]] || mode="managed" ;;
            *        ) mode="cluster" ;;
        esac

    fi

    [[ " $(module_get "${module}" MODES) " == *" ${mode} "* ]] \
        || die "Module '${module}' runs as: $(module_get "${module}" MODES) — '${mode}' is not one of them"

    printf '%s' "${mode}"

}
module_host () {

    printf '%s' "${1:?module_host needs a module}"

}
module_users () {

    local module="${1:?module_users needs a module}" service="" used=""

    for service in ${SERVICES:-}; do

        for used in $(service_uses "${service}"); do

            [[ "${used}" != "${module}" ]] || printf '%s\n' "${service}"

        done

    done

}
module_root_password () {

    secret_require "$(model_key "${1:?module_root_password needs a module}")_PASSWORD"

}
model_modules () {

    local kind="${1:-}" module=""

    for module in ${MODULES:-}; do

        [[ -z "${kind}" || " ${kind} " == *" $(module_kind "${module}") "* ]] && printf '%s\n' "${module}"

    done

    return 0

}
model_hosts () {

    local service="" module="" label="" host=""

    for service in ${SERVICES:-}; do

        service_hosts "${service}"

    done

    for module in $(model_modules tool); do

        for label in $(module_get "${module}" HOST); do

            host="$(model_fqdn "${label}")"
            printf '%s\n' "${host}"

        done

    done

    if [[ "${OBSERVABILITY_ENABLED}" == "true" && -n "${GRAFANA_HOST:-}" && -n "${SERVICES:-}" ]]; then

        host="$(model_fqdn "${GRAFANA_HOST}")"
        printf '%s\n' "${host}"

    fi

}
model_public () {

    local service="" module=""

    for service in ${SERVICES:-}; do

        [[ -z "$(service_get "${service}" HOST)" ]] || return 0

    done

    for module in $(model_modules tool); do

        [[ -z "$(module_get "${module}" HOST)" ]] || return 0

    done

    return 1

}
bind_password () {

    local module="${1:?bind_password needs a module}" service="${2:?bind_password needs a service}" root=""

    root="$(module_root_password "${module}")"

    printf 'infrax:%s:%s:%s:%s' "${PROJECT}" "${module}" "${service}" "${root}" | sha256sum | cut -c1-32

}
bind_file () {

    local module="${1:?bind_file needs a module}" style="${2:?bind_file needs a style}" mode="${3:?bind_file needs a mode}" dir="" name=""

    dir="$(module_dir "${module}")"

    for name in "bind.${style}.${mode}.env" "bind.${style}.env" "bind.url.${mode}.env" "bind.url.env"; do

        [[ -f "${dir}/${name}" ]] || continue

        printf '%s' "${dir}/${name}"
        return 0

    done

}
bind_facts () {

    local service="${1:?bind_facts needs a service}" module="${2:?bind_facts needs a module}" mode="${3:?bind_facts needs a mode}" primary="${4:-false}" url="" key="" value=""

    export BIND_SERVICE="${service}" BIND_HOST="" BIND_PORT="" BIND_USER="" BIND_DATABASE="" BIND_PASSWORD="" BIND_PASSWORD_URI=""
    export BIND_SSLMODE="" BIND_URL="" BIND_PRIMARY_URL="" BIND_PREFIX="" BIND_BUCKET="" BIND_REGION="" BIND_ENDPOINT="" BIND_SCHEME="" BIND_PATH=""

    case "$(module_kind "${module}")" in

        database )
            BIND_HOST="$(module_host "${module}")"
            BIND_PORT="$(module_get "${module}" PORT)"
            BIND_USER="$(model_ident "${service}")"
            BIND_DATABASE="${BIND_USER}"
            BIND_PASSWORD="$(bind_password "${module}" "${service}")"
            BIND_PASSWORD_URI="${BIND_PASSWORD}"
            BIND_SSLMODE="$(module_get "${module}" "SSLMODE_${mode^^}")" ;;

        cache )
            BIND_HOST="$(module_host "${module}")"
            BIND_PORT="$(module_get "${module}" PORT)"
            BIND_PASSWORD="$(module_root_password "${module}")"
            BIND_PASSWORD_URI="$(uri_encode "${BIND_PASSWORD}")"
            BIND_PREFIX="$(model_ident "${service}")_" ;;

        storage )
            BIND_BUCKET="$(service_bucket "${service}")"
            BIND_PATH="$(service_get "${service}" MOUNT)"

            while IFS='=' read -r key value; do

                [[ -n "${key}" ]] || continue
                export "BIND_${key}=${value}"

            done < <(cloud storage_facts) ;;

    esac

    url="$(model_read "$(module_dir "${module}")/module.env" URL | render_text)"

    export BIND_URL="${url}"

    [[ "${primary}" != "true" ]] || export BIND_PRIMARY_URL="${url}"

}
bind_module () {

    local service="${1}" module="${2}" style="${3}" primary="${4}" mode="" file=""

    mode="$(module_mode "${module}")"
    file="$(bind_file "${module}" "${style}" "${mode}")"

    [[ -n "${file}" ]] || return 0

    (

        bind_facts "${service}" "${module}" "${mode}" "${primary}"
        render_text < "${file}"
        printf '\n'

    )

}
bind_env () {

    local service="${1:?bind_env needs a service}" style="" module="" primary=""

    style="$(service_get "${service}" BIND)"

    for module in $(service_uses "${service}"); do

        if [[ "$(module_kind "${module}")" != "database" ]]; then

            bind_module "${service}" "${module}" "${style}" false

        elif [[ -z "${primary}" ]]; then

            primary="${module}"
            bind_module "${service}" "${module}" "${style}" true

        else

            bind_module "${service}" "${module}" url false

        fi

    done

}
model_tools_for () {

    local target="${1:?model_tools_for needs a module}" module=""

    for module in $(model_modules tool); do

        [[ "$(module_get "${module}" TARGET)" != "${target}" ]] || printf '%s\n' "${module}"

    done

}
model_reserved () {

    printf '%s ' root gateway observability log-shipper envoy-gateway cert-manager cluster-autoscaler metrics-server cloud-metrics \
        "${METRICS_RELEASE}" "${LOGS_RELEASE}" registry-refresher load

}
model_label () {

    [[ "${1:-}" =~ ^[a-z]([-a-z0-9]{0,38}[a-z0-9])?$ ]]

}
model_fail () {

    err "Manifest: $*"
    MODEL_FAULTS=$(( ${MODEL_FAULTS:-0} + 1 ))

}
model_verify_service () {

    local service="${1}" runtime="" key="" value="" process="" module="" callee="" label=""

    model_label "${service}" || model_fail "service '${service}' is not a lowercase dns label"
    [[ " $(model_reserved) " != *" ${service} "* ]] || model_fail "service '${service}' takes a name the platform reserves"
    [[ " ${MODULES:-} " != *" ${service} "* ]] || model_fail "service '${service}' shares its name with a module"

    key="$(service_var "${service}" RUNTIME)"
    runtime="${!key:-}"

    if [[ -z "${runtime}" || ! -f "${TEMPLATE_DIR}/runtime/${runtime}/profile.env" ]]; then

        model_fail "${key} must name one of: $(model_names runtime | paste -sd ' ' -)"
        return 0

    fi

    [[ -d "${REPO_ROOT}/$(service_path "${service}")" ]] || model_fail "service '${service}' builds from $(service_path "${service}")/, which does not exist"

    value="$(service_get "${service}" PORT)"
    [[ "${value}" =~ ^[0-9]+$ ]] || model_fail "service '${service}' needs a numeric PORT"

    for process in $(service_processes "${service}"); do

        model_label "${process}" || model_fail "service '${service}' runs a process named '${process}', which is not a dns label"
        [[ "${process}" == "web" || -n "$(service_get "${service}" "$(model_key "${process}")_COMMAND")" ]] \
            || model_fail "service '${service}' runs '${process}' without a command — set $(service_var "${service}" "$(model_key "${process}")_COMMAND")"

    done

    for module in $(service_uses "${service}"); do

        [[ " ${MODULES:-} " == *" ${module} "* ]] || { model_fail "service '${service}' uses '${module}', which MODULES does not declare"; continue; }
        [[ "$(module_kind "${module}")" != "tool" ]] || model_fail "service '${service}' uses the tool '${module}' — tools serve people, not services"

    done

    for callee in $(service_calls "${service}"); do

        [[ " ${SERVICES:-} " == *" ${callee} "* ]] || model_fail "service '${service}' calls '${callee}', which SERVICES does not declare"
        [[ "${callee}" != "${service}" ]] || model_fail "service '${service}' calls itself"

    done

    for label in $(service_get "${service}" HOST); do

        model_label "${label}" || model_fail "service '${service}' answers on '${label}', which is not a dns label"

    done

}
model_verify_module () {

    local module="${1}" target=""

    [[ -f "${TEMPLATE_DIR}/module/${module}/module.env" ]] || { model_fail "module '${module}' is not one infrax carries: $(model_names module | paste -sd ' ' -)"; return 0; }

    [[ " $(module_get "${module}" MODES) " == *" $(module_mode "${module}") "* ]] || model_fail "module '${module}' cannot run as $(module_mode "${module}")"

    target="$(module_get "${module}" TARGET)"

    [[ -z "${target}" || " ${MODULES:-} " == *" ${target} "* ]] || model_fail "tool '${module}' administers '${target}', which MODULES does not declare"

}
model_verify_keys () {

    local file="" key="" known="" service="" rest="" name=""

    known=" $(infrax_keys | paste -sd ' ' -) "

    for file in "${REPO_ROOT}"/infrax.env "${REPO_ROOT}"/infrax.*.env; do

        [[ -f "${file}" ]] || continue

        while IFS= read -r key; do

            [[ "${known}" != *" ${key} "* ]] || continue

            if [[ "${key}" == SERVICE_* ]]; then

                rest="${key#SERVICE_}"

                for service in ${SERVICES:-}; do

                    name="$(model_key "${service}")_"
                    [[ "${rest}" != "${name}"* ]] || { rest=""; break; }

                done

                [[ -z "${rest}" ]] || model_fail "$(basename "${file}"): ${key} names no declared service"
                continue

            fi

            for name in $(model_names runtime) $(model_names module); do

                [[ "${key}" != "$(model_key "${name}")_"* ]] || { key=""; break; }

            done

            [[ -z "${key}" ]] || model_fail "$(basename "${file}"): ${key} is not a key infrax reads"

        done < <(model_keys "${file}")

    done

}
## the manifest law — names, runtimes, modules, uses, calls and keys are what infrax can honour, or nothing runs
model_verify () {

    local service="" module=""

    MODEL_FAULTS=0

    [[ -n "${PROJECT:-}" ]] || model_fail "PROJECT is empty — every name infrax mints starts from it"
    [[ -z "${PROJECT:-}" ]] || model_label "${PROJECT}" || model_fail "PROJECT '${PROJECT}' is not a lowercase dns label"
    [[ -n "${SERVICES:-}" ]] || model_fail "SERVICES is empty — a platform runs at least one service"
    [[ -n "${BASE_DOMAIN:-}" ]] || ! model_public || model_fail "BASE_DOMAIN is empty and something answers publicly — every public name lives under it"

    for service in ${SERVICES:-}; do model_verify_service "${service}"; done
    for module in ${MODULES:-}; do model_verify_module "${module}"; done

    [[ "$(printf '%s\n' ${SERVICES:-} ${MODULES:-} | sort | uniq -d)" == "" ]] || model_fail "a name is declared twice across SERVICES and MODULES"

    model_verify_keys

    (( MODEL_FAULTS == 0 )) || die "The manifest carries ${MODEL_FAULTS} fault(s) — the lines above say which"

    succ "Manifest holds — $(wc -w <<< "${SERVICES}") service(s), $(wc -w <<< "${MODULES:-}") module(s)."

}
bind_identity () {

    local service="${1:?bind_identity needs a service}" module="" key="" password=""

    for module in $(service_uses "${service}"); do

        [[ "$(module_kind "${module}")" == "database" ]] || continue

        key="$(model_key "${module}")"
        password="$(bind_password "${module}" "${service}")"

        printf '%s_USER=%s\n' "${key}" "$(model_ident "${service}")"
        printf '%s_DATABASE=%s\n' "${key}" "$(model_ident "${service}")"
        printf '%s_PASSWORD=%s\n' "${key}" "${password}"

    done

}

# @core proc

run () {

    info "$*"
    "$@"

}
lock () {

    local name="${1:-${INFRAX_NAME}}"

    ensure flock

    exec 9>"${LOCK_DIR}/${name}.lock"
    flock -n 9 || die "Another '${name}' run is already in progress"

}

# @core secret

secret_keys () {

    infrax_manifest | sed -nE 's/^([A-Z][A-Z0-9_]*)=.*/\1/p'

}
secret_get () {

    local key="${1:?secret_get needs a key}"

    printf '%s' "${!key-}"

}
secret_name () {

    local key="${1:?secret_name needs a key}"

    [[ " $(secret_keys | paste -sd ' ' -) " == *" ${key} "* || "${key}" == SECRET_* || "${key}" =~ (PASSWORD|SECRET|TOKEN|_KEY|_ENV_FILE|CREDENTIALS)$ ]]

}
secret_require () {

    local key="${1:-}" value=""

    value="$(secret_get "${key}")"

    [[ -n "${value}" ]] || die "Missing secret: ${key}"

    printf '%s' "${value}"

}
secret_env_pairs () {

    local name="${1:?secret_env_pairs needs a variable}" raw="" line="" key="" value=""

    raw="$(secret_get "${name}")"
    [[ -n "${raw}" ]] || return 0

    while IFS= read -r line; do

        key="${line%%=*}"
        value="${line#*=}"

        [[ -n "${value}" ]] || continue
        [[ "${value}" =~ ^\"(.*)\"$ || "${value}" =~ ^\'(.*)\'$ ]] && value="${BASH_REMATCH[1]}"

        printf '%s=%s\n' "${key}" "${value}"

    done < <(base64 -d <<< "${raw}" 2>/dev/null | env_pairs || die "${name} is not base64")

}
secret_service_env () {

    local service="${1:?secret_service_env needs a service}" dst="${2:?secret_service_env needs a destination}" line="" key="" bound=""

    umask 077

    : > "${dst}" || die "Cannot write: ${dst}"
    chmod 600 "${dst}"

    bind_env "${service}" | env_pairs | grep -vE '^[A-Za-z_][A-Za-z0-9_]*=$' >> "${dst}" || true

    bound=" $(sed -n 's/=.*//p' "${dst}" | paste -sd ' ' -) "

    while IFS= read -r line; do

        key="${line%%=*}"

        if [[ "${bound}" == *" ${key} "* ]]; then warn "${service}: ${key} is bound by infrax — the environment file cannot override it"; continue; fi

        printf '%s\n' "${line}" >> "${dst}"

    done < <(secret_env_pairs "$(service_var "${service}" ENV_FILE)")

}

# @core sys

has () {

    command -v "${1:-}" >/dev/null 2>&1

}
as_root () {

    if [[ "$(id -u)" == "0" ]]; then "$@"; else sudo "$@"; fi

}
pkg_install () {

    [[ -n "${1:-}" ]] || die "pkg_install needs a package"

    has apt-get || die "Cannot install '$*': no apt on this system"

    as_root apt-get update -qq || die "Failed to update apt"
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "$@" || die "Failed to install: $*"

}
is_ci () {

    [[ -n "${CI:-}" || -n "${GITHUB_ACTIONS:-}" ]]

}
ensure () {

    local tool=""

    for tool in "$@"; do

        has "${tool}" && continue

        info "Installing: ${tool}"

        if declare -F "tool_${tool//-/_}" >/dev/null; then "tool_${tool//-/_}" >&2; else pkg_install "${tool}" >&2; fi

        has "${tool}" || die "Cannot install: ${tool}"

    done

}

# @core template

## the template payload — one bundle, one extraction per version, verified

template_dir () {

    if [[ -n "${INFRAX_DEV_TEMPLATE:-}" && -d "${INFRAX_DEV_TEMPLATE}" ]]; then

        printf '%s' "${INFRAX_DEV_TEMPLATE}"
        return 0

    fi

    printf '%s' "${BUILD_DIR}/template/${INFRAX_VERSION}-${INFRAX_TEMPLATE_SHA:0:12}"

}
template_payload () {

    sed -n '/^#__INFRAX_PAYLOAD__$/,$p' "${INFRAX_BIN}" | tail -n +2 | sed 's/^#//' | base64 -d

}
template_ensure () {

    local tmp="" archive="" sha=""

    [[ "${TEMPLATE_DIR}" != "${INFRAX_DEV_TEMPLATE:-}" ]] || return 0
    [[ ! -f "${TEMPLATE_DIR}/.sha256" ]] || return 0

    tmp="$(tmp_dir)"
    archive="${tmp}/template.tgz"

    template_payload > "${archive}" || die "The bundle carries no readable template payload"

    sha="$(sha256sum "${archive}" | cut -c1-64)"

    [[ "${sha}" == "${INFRAX_TEMPLATE_SHA}" ]] || die "Template payload is corrupt — expected ${INFRAX_TEMPLATE_SHA:0:12}, got ${sha:0:12}"

    tar xzf "${archive}" -C "${tmp}" || die "Cannot unpack the template payload"

    ensure_dir "$(dirname "${TEMPLATE_DIR}")"
    rm -rf "${TEMPLATE_DIR}"
    mv "${tmp}/template" "${TEMPLATE_DIR}" || die "Cannot place the templates: ${TEMPLATE_DIR}"

    printf '%s\n' "${sha}" > "${TEMPLATE_DIR}/.sha256"
    rm -rf "${tmp}"

}

# @core ui

input () {

    local prompt="${1:-}" fallback="${2:-}" value=""

    if is_ci || [[ ! -t 0 ]]; then

        [[ -n "${fallback}" ]] || die "Non-interactive run needs a default for: ${prompt}"

        printf '%s' "${fallback}"
        return 0

    fi

    read -r -t "${INPUT_TIMEOUT}" -p "${prompt} [${fallback}]: " value || die "Input timed out: ${prompt}"

    printf '%s' "${value:-${fallback}}"

}
confirm () {

    local prompt="${1:-Continue?}" value=""

    [[ -n "${INFRAX_YES:-}" ]] && return 0

    is_ci && die "Refusing '${prompt}' in CI without INFRAX_YES=1"

    read -r -t "${INPUT_TIMEOUT}" -p "${prompt} [y/N]: " value || die "Confirmation timed out"

    [[ "${value}" =~ ^[Yy]([Ee][Ss])?$ ]]

}

# @module app

## the services themselves — one-off commands inside the live release, wherever the cluster lives

app_service () {

    local service="${1:-}"

    [[ -n "${service}" && " ${SERVICES:-} " == *" ${service} "* ]] || die "Name one of this project's services: ${SERVICES:-none}"

    printf '%s' "${service}"

}
app_image () {

    local service="${1:?app_image needs a service}"

    kubectl -n "${K8S_NAMESPACE}" get "deploy/${service}-$(k8s_first_process "${service}")" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || true

}
app_reachable () {

    command -v kubectl >/dev/null 2>&1 && kubectl get --raw=/readyz --request-timeout="${RUN_REACH}s" >/dev/null 2>&1

}
## hand the verb to the bundle on the server when the cluster is out of reach from here
app_forward () {

    local verb="${1:?Missing verb}"

    shift

    [[ "${CLUSTER_SOURCE}" != "managed" ]] || die "No cluster reach — run: ${INFRAX_NAME} k8s kubeconfig"

    server_run "$(server_remote) app ${verb} $(printf '%q ' "$@")"

}
app_phase () {

    kubectl -n "${K8S_NAMESPACE}" get pod -l "job-name=${1}" -o jsonpath='{.items[*].status.phase}' 2>/dev/null || true

}
app_outcome () {

    kubectl -n "${K8S_NAMESPACE}" get "job/${1}" -o jsonpath='{.status.succeeded}/{.status.failed}' 2>/dev/null || true

}
app_settled () {

    [[ "${1}" != "/" ]]

}
app_verdict () {

    [[ "${1}" == 1/* ]]

}
## render the job that runs one command on a service's release — its image, env, secrets and storage
app_manifest () {

    local dst="${1:?Missing destination}" name="${2:?Missing job name}" service="${3:?Missing service}" image="${4:?Missing image}" storage=""

    shift 4

    RUN_COMMAND="$(argv_list "$@")"
    [[ $# -ne 1 || "${1}" != \[* ]] || RUN_COMMAND="${1}"

    RUN_NAME="${name}"
    RUN_SERVICE="${service}"
    RUN_IMAGE="${image}"
    RUN_USER="$(service_get "${service}" USER)"
    RUN_PORT="$(service_get "${service}" PORT)"
    RUN_PULL_SECRETS="[]"
    RUN_MOUNTS="[]"
    RUN_VOLUMES="[]"

    [[ "${REGISTRY_PULL}" != "true" ]] || RUN_PULL_SECRETS="[{name: pull-secret}]"

    storage="$(service_storage "${service}")"

    if [[ -n "${storage}" ]] && [[ "$(module_mode "${storage}")" == "volume" ]]; then

        RUN_MOUNTS="[{name: storage, mountPath: $(service_get "${service}" MOUNT)}]"
        RUN_VOLUMES="[{name: storage, persistentVolumeClaim: {claimName: ${service}-storage}}]"

    fi

    export RUN_COMMAND RUN_NAME RUN_SERVICE RUN_IMAGE RUN_USER RUN_PORT RUN_PULL_SECRETS RUN_MOUNTS RUN_VOLUMES

    render "${TEMPLATE_DIR}/k8s/run.yaml" "${dst}"

}
## run one command as a job on the live release of one service — its image, env and secrets; the job's exit code is yours
app_run () {

    local service="" name="" image="" file="" phase="" waited=0

    service="$(app_service "${1:-}")"

    shift
    [[ "${1:-}" != "--" ]] || shift

    (( $# )) || die "Usage: app run <service> -- <command...>"

    if ! app_reachable; then app_forward run "${service}" "$@"; return $?; fi

    ensure kubectl envsubst

    image="$(app_image "${service}")"

    [[ -n "${image}" ]] || die "No live release of '${service}' in '${K8S_NAMESPACE}' — is it deployed?"

    name="${service}-run-$(date +%s)"
    file="$(tmp_file)"

    app_manifest "${file}" "${name}" "${service}" "${image}" "$@"

    step "Running on ${service} ${image##*:} — $*"

    kubectl apply -f "${file}" >/dev/null || die "Cannot create job ${name}"

    phase="$(app_phase "${name}")"

    while [[ -z "${phase}" || "${phase}" == "Pending" ]]; do

        if (( waited >= RUN_START )); then

            kubectl -n "${K8S_NAMESPACE}" describe pod -l "job-name=${name}" | tail -n "${POD_LOG_LINES}"
            die "Job ${name} never started within ${RUN_START}s — the events above carry the reason"

        fi

        sleep "${RUN_POLL}"
        waited=$(( waited + RUN_POLL ))
        phase="$(app_phase "${name}")"

    done

    kubectl -n "${K8S_NAMESPACE}" logs -f "job/${name}" 2>/dev/null || true

    until app_settled "$(app_outcome "${name}")"; do sleep "${RUN_POLL}"; done

    app_verdict "$(app_outcome "${name}")" || die "Job ${name} failed — kubectl -n ${K8S_NAMESPACE} describe job/${name}"

    succ "Job ${name} succeeded."

}
## list the one-off runs still on the cluster — of one service, or all
app_runs () {

    local selector="app.kubernetes.io/component=run"

    if ! app_reachable; then app_forward runs "$@"; return $?; fi

    ensure kubectl

    [[ -z "${1:-}" ]] || selector+=",app.kubernetes.io/name=$(app_service "${1}")"

    kubectl -n "${K8S_NAMESPACE}" get jobs -l "${selector}" --no-headers

}

# @module argocd

## gitops — argocd installation and the app-of-apps

## install argocd at the pinned version
argocd_install () {

    ensure kubectl

    k8s_namespace "${ARGOCD_NAMESPACE}"

    run kubectl apply -n "${ARGOCD_NAMESPACE}" --server-side --force-conflicts \
        -f "${ARGOCD_MANIFESTS}/${ARGOCD_VERSION}/manifests/install.yaml"

    run kubectl -n "${ARGOCD_NAMESPACE}" patch configmap argocd-cm --patch-file "${TEMPLATE_DIR}/argocd/health.yaml"

    run kubectl -n "${ARGOCD_NAMESPACE}" rollout status deploy/argocd-server --timeout=300s

    succ "ArgoCD ${ARGOCD_VERSION} installed."

}
## print the current admin password
argocd_password () {

    ensure kubectl

    kubectl -n "${ARGOCD_NAMESPACE}" get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
    log ""

}
## move admin onto ARGOCD_PASSWORD and drop the bootstrap secret
argocd_rotate () {

    local hash="" password=""

    ensure kubectl htpasswd

    password="$(secret_require ARGOCD_PASSWORD)"
    hash="$(htpasswd -niBC 10 "" <<< "${password}" | tr -d ':\n')"
    hash="${hash/#\$2y/\$2a}"

    kubectl -n "${ARGOCD_NAMESPACE}" patch secret argocd-secret --type merge \
        -p "{\"stringData\":{\"admin.password\":\"${hash}\",\"admin.passwordMtime\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}" >/dev/null \
        || die "Cannot move the ArgoCD admin onto ARGOCD_PASSWORD"

    run kubectl -n "${ARGOCD_NAMESPACE}" delete secret argocd-initial-admin-secret --ignore-not-found

    succ "ArgoCD admin moved onto ARGOCD_PASSWORD — the bootstrap secret is gone."

}
## apply the app-of-apps — argocd owns the cluster from git
argocd_bootstrap () {

    local services=() stores=() tools=() hosts=()

    ensure kubectl

    if [[ "${AUTOSCALER_ENABLED}" == "true" && -z "${AUTOSCALER_ROLE_ARN}" ]]; then

        AUTOSCALER_ROLE_ARN="$(tofu_output autoscaler_role_arn 2>/dev/null)" || die "Missing AUTOSCALER_ROLE_ARN — apply the stack first"

    fi

    if [[ -n "${EDGE_TYPE}" && -n "${PROVISIONER}" && "${EDGE_FIXED_IPS}" == "true" && -z "${EDGE_EIPS}" ]]; then

        EDGE_EIPS="$(tofu_output edge_eips 2>/dev/null)" || die "Missing EDGE_EIPS — the edge holds fixed addresses, apply the stack first"

    fi

    export AUTOSCALER_ROLE_ARN EDGE_EIPS

    read -ra services <<< "${SERVICES}"
    mapfile -t stores < <(model_modules "database cache")
    mapfile -t tools < <(model_modules tool)
    mapfile -t hosts < <(model_hosts)

    EDGE_ANNOTATIONS="$(cloud edge_annotations)"
    IMAGE_TAG="$(helm_tag)"
    APPS_SERVICES="$(yaml_list "${services[@]}")"
    APPS_DATA="$(yaml_list "${stores[@]}")"
    APPS_TOOLS="$(yaml_list "${tools[@]}")"
    APPS_HOSTNAMES="$(yaml_list "${hosts[@]}")"
    CLOUD_REGION="$(cloud region)"
    GRAFANA_HOSTNAME=""

    [[ "${OBSERVABILITY_ENABLED}" != "true" || -z "${GRAFANA_HOST}" ]] || GRAFANA_HOSTNAME="$(model_fqdn "${GRAFANA_HOST}")"

    export EDGE_ANNOTATIONS IMAGE_TAG APPS_SERVICES APPS_DATA APPS_TOOLS APPS_HOSTNAMES CLOUD_REGION GRAFANA_HOSTNAME

    render "${TEMPLATE_DIR}/argocd/project.yaml" "${BUILD_DIR}/argocd/project.yaml"
    render "${TEMPLATE_DIR}/argocd/root.yaml" "${BUILD_DIR}/argocd/root.yaml"

    run kubectl apply -f "${BUILD_DIR}/argocd/project.yaml"

    run kubectl delete application root -n "${ARGOCD_NAMESPACE}" --cascade=orphan --ignore-not-found

    run kubectl apply -f "${BUILD_DIR}/argocd/root.yaml"

    succ "App-of-apps bootstrapped — ArgoCD now owns the cluster from git."

}
## apply the git repository credentials — a public repository needs none
argocd_repo () {

    local token=""

    ensure kubectl

    token="$(secret_get GIT_TOKEN)"

    [[ -n "${token}" ]] || { info "No GIT_TOKEN — ArgoCD reads ${GIT_REPO_URL} as a public repository."; return 0; }

    k8s_upsert kubectl create secret generic repo-creds \
        -n "${ARGOCD_NAMESPACE}" \
        --from-literal=type=git \
        --from-literal=url="${GIT_REPO_URL}" \
        --from-literal=username=git \
        --from-literal=password="${token}" >/dev/null

    kubectl label secret repo-creds -n "${ARGOCD_NAMESPACE}" \
        argocd.argoproj.io/secret-type=repository --overwrite >/dev/null

    succ "Repository credentials applied."

}
## true when an application gave up on its revision, or has held one operation longer than any sync should — a retrying operation pins argocd to the revision it started on, so the newest commit is never even looked at
argocd_stalled () {

    local app="${1:-root}" phase="" started="" age=0 terminate='{"status":{"operationState":{"phase":"Terminating"}}}'

    read -r phase started < <(kubectl -n "${ARGOCD_NAMESPACE}" get application "${app}" -o jsonpath='{.status.sync.status}/{.status.operationState.phase} {.status.operationState.startedAt}' 2>/dev/null)

    case "${phase}" in

        */Failed | */Error ) return 0 ;;
        */Running ) [[ -n "${started}" ]] || return 1 ;;
        * ) return 1 ;;

    esac

    age=$(( $(date +%s) - $(date -d "${started}" +%s) ))

    (( age > ARGOCD_SYNC_STALL )) || return 1

    warn "Sync of '${app}' has run ${age}s — terminating it so the newest revision can take over"

    kubectl -n "${ARGOCD_NAMESPACE}" patch application "${app}" --type merge -p "${terminate}" >/dev/null 2>&1 \
        || kubectl -n "${ARGOCD_NAMESPACE}" patch application "${app}" --subresource=status --type merge -p "${terminate}" >/dev/null 2>&1 \
        || true

}
## what argocd thinks of an application right now — sync, health, the revision it sits on, and why its last operation stopped
argocd_report () {

    local app="${1:-root}" report=""

    ensure kubectl

    report="$(kubectl -n "${ARGOCD_NAMESPACE}" get application "${app}" \
        -o jsonpath='{.metadata.name}: sync={.status.sync.status} health={.status.health.status} phase={.status.operationState.phase} revision={.status.sync.revision}{"\n"}  reason: {.status.operationState.message}{"\n"}{range .status.conditions[*]}  {.type}: {.message}{"\n"}{end}' 2>/dev/null || true)"

    [[ -n "${report}" ]] || return 0

    printf '%s\n' "${report}" >&2

}
## force-sync an application now
argocd_sync () {

    ensure kubectl

    run kubectl -n "${ARGOCD_NAMESPACE}" patch application "${1:-root}" \
        --type merge -p "{\"operation\":{\"initiatedBy\":{\"username\":\"${INFRAX_NAME}\"},\"sync\":{}}}"

}

# @module audit

## live production checks — read-only, loud verdicts

AUDIT_FAILED=0

audit_check () {

    local label="${1:?Missing label}" ok="${2:-}" detail="${3:-}"

    if [[ "${ok}" == "true" ]]; then

        succ "${label}${detail:+ — ${detail}}"

        return 0

    fi

    err "${label}${detail:+ — ${detail}}"
    AUDIT_FAILED=1

}
audit_probe () {

    local script="${1:?Missing script}" name="" phase="" left="${AUDIT_PROBE_TRIES}" out=""

    name="audit-$(date -u +%s)-${RANDOM}"

    kubectl -n "${OBSERVABILITY_NAMESPACE}" run "${name}" \
        --restart=Never --image="${AUDIT_IMAGE}" --command -- sh -c "${script}" >/dev/null 2>&1

    while (( left-- )); do

        phase="$(kubectl -n "${OBSERVABILITY_NAMESPACE}" get "pod/${name}" -o jsonpath='{.status.phase}' 2>/dev/null)"

        [[ "${phase}" != "Succeeded" && "${phase}" != "Failed" ]] || break

        sleep "${AUDIT_PROBE_POLL}"

    done

    out="$(kubectl -n "${OBSERVABILITY_NAMESPACE}" logs "${name}" 2>/dev/null | head -1 | tr -d '\r\n')"

    kubectl -n "${OBSERVABILITY_NAMESPACE}" delete "pod/${name}" --wait=false >/dev/null 2>&1

    printf '%s' "${out}"

}
audit_metric () {

    local query="${1:?Missing query}"

    audit_probe "curl -sG http://${METRICS_RELEASE}-kube-prometheus-st-prometheus:${PROMETHEUS_PORT}/api/v1/query --data-urlencode 'query=${query}' \
        | sed -n 's/.*\"value\":\[[0-9.]*,\"\([0-9.e+-]*\)\"\].*/\1/p' | head -1"

}
## argocd apps all synced + healthy
audit_apps () {

    local total="" healthy=""

    ensure kubectl

    total="$(kubectl get application -n "${ARGOCD_NAMESPACE}" --no-headers 2>/dev/null | wc -l)"
    healthy="$(kubectl get application -n "${ARGOCD_NAMESPACE}" --no-headers 2>/dev/null | grep -c "Synced.*Healthy")"

    audit_check "Every application reconciles from git" "$( [[ "${total}" -gt 0 && "${total}" == "${healthy}" ]] && echo true )" "${healthy}/${total} synced and healthy"

}
## prometheus targets all up
audit_targets () {

    local down=""

    down="$(audit_metric 'count(up == 0)')"

    audit_check "Everything the platform measures answers" "$( [[ -z "${down}" ]] && echo true )" "${down:-0} target(s) down"

}
## no alerts firing
audit_alerts () {

    local firing=""

    firing="$(audit_metric 'count(ALERTS{alertstate="firing", alertname!="Watchdog"})')"

    audit_check "Nothing is alerting" "$( [[ -z "${firing}" ]] && echo true )" "${firing:-0} alert(s) firing"

}
## alert rules loaded
audit_rules () {

    local rules=""

    rules="$(audit_metric 'count(count by (alertname) (ALERTS_FOR_STATE)) or vector(0)')"

    audit_check "Alert rules are loaded" "$( [[ -n "${rules}" ]] && (( ${rules%.*} > 0 )) && echo true )" "${rules:-no} rule(s) evaluating"

}
## a recent backup exists for every database module
audit_backup () {

    local module="" age=""

    for module in $(model_modules database); do

        [[ -n "$(module_users "${module}")" ]] || continue

        age="$(audit_metric "round((time() - max(kube_job_status_completion_time{namespace=\"${K8S_NAMESPACE}\", job_name=~\"${module}-backup-.+\"})) / 3600)")"

        audit_check "A recent backup of ${module} exists" "$( [[ -n "${age}" ]] && (( ${age%.*} < 36 )) && echo true )" "${age:-no} hour(s) old"

    done

}
## the edge serves the expected certificate
audit_serves_tls () {

    [[ -n "$(kubectl -n "${GATEWAY_NAMESPACE}" get gateway gateway \
        -o jsonpath='{.spec.listeners[?(@.protocol=="HTTPS")].name}' 2>/dev/null)" ]]

}
## cert validity window
audit_certificate () {

    local days=""

    audit_serves_tls || return 0

    days="$(audit_metric 'round(min(certmanager_certificate_expiration_timestamp_seconds - time()) / 86400)')"

    audit_check "The certificate has life left" "$( [[ -n "${days}" ]] && (( ${days%.*} > 14 )) && echo true )" "${days:-no} day(s) remaining"

}
## loki receives logs
audit_logs () {

    local lines=""

    [[ "${LOGS_ENABLED}" == "true" ]] || return 0

    lines="$(audit_probe "curl -sG http://${LOGS_RELEASE}-loki:${LOKI_PORT}/loki/api/v1/query \
        --data-urlencode 'query=sum(count_over_time({namespace=\"${K8S_NAMESPACE}\"}[10m]))' \
        | sed -n 's/.*\"value\":\[[0-9.]*,\"\([0-9.]*\)\"\].*/\1/p' | head -1")"

    audit_check "Logs are reaching the store" "$( [[ -n "${lines}" ]] && echo true )" "${lines:-0} line(s) in ten minutes"

}
## every public service answers its health path through the platform's own edge
audit_edge () {

    local address="" code="" scheme=http port=80 service="" host="" health=""

    ! audit_serves_tls || { scheme=https; port=443; }

    address="$(k8s_gateway_address clusterIP)"

    if [[ -z "${address}" ]]; then

        audit_check "The platform answers on its own address" "" "the gateway has no service"

        return 0

    fi

    for service in ${SERVICES:-}; do

        host="$(service_host "${service}")"

        [[ -n "${host}" ]] || continue

        health="$(service_get "${service}" HEALTH)"
        code="$(audit_probe "curl -sk -o /dev/null -w '%{http_code}' -m 15 --resolve ${host}:${port}:${address} ${scheme}://${host}${health:-/}")"

        audit_check "${service} answers through its own edge" "$( [[ "${code}" == "200" ]] && echo true )" "${scheme}://${host}${health:-/} → ${code:-no answer}"

    done

}
## run every audit in one sweep
audit_all () {

    ensure kubectl

    step "Auditing the '${STACK}' stack"

    audit_apps
    audit_targets
    audit_rules
    audit_alerts
    audit_edge
    audit_backup
    audit_certificate
    audit_logs

    (( AUDIT_FAILED == 0 )) || die "The stack is not in the shape it claims — the lines above say where"

    succ "Stack '${STACK}' audited — reconciled, measured, alerting, answering, backed up."

}
audit_targets_of () {

    local service="" host="" health=""

    if [[ -n "${WATCH_TARGETS}" ]]; then

        printf '%s\n' ${WATCH_TARGETS}
        return 0

    fi

    for service in ${SERVICES:-}; do

        host="$(service_host "${service}")"

        [[ -n "${host}" ]] || continue

        health="$(service_get "${service}" HEALTH)"
        printf '%s%s\n' "${host}" "${health}"

    done

}
## probe every public service from outside: its health path answers 200 and its certificate is not dying
audit_watch () {

    local target="" host="" code="" expiry="" left="" report=""

    for target in $(audit_targets_of); do

        host="${target%%/*}"
        code="$(curl -sS -o /dev/null -m 15 -w '%{http_code}' "https://${target}" || echo 000)"

        if [[ "${code}" != "200" ]]; then

            report+="🔴 ${target} answered ${code}"$'\n'
            continue

        fi

        expiry="$(echo | openssl s_client -connect "${host}:443" -servername "${host}" 2>/dev/null \
            | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"

        [[ -n "${expiry}" ]] || continue

        left=$(( ( $(date -d "${expiry}" +%s) - $(date +%s) ) / 86400 ))

        (( left > WATCH_CERT_DAYS )) || report+="🟠 ${host} certificate expires in ${left} days"$'\n'

    done

    if [[ -z "${report}" ]]; then

        succ "Every watched target answers."
        return 0

    fi

    log "${report}"
    audit_alarm "${report}"

    return 1

}
audit_alarm () {

    local token=""

    token="$(secret_get ALERT_BOT_TOKEN)"

    [[ -n "${token}" && -n "${ALERT_CHAT_ID}" ]] || return 0

    curl -sS -o /dev/null -X POST "${TELEGRAM_API}/bot${token}/sendMessage" \
        --data-urlencode "chat_id=${ALERT_CHAT_ID}" \
        --data-urlencode "text=${1:?audit_alarm needs a message}"

}

# @module aws

## the aws provider — every aws byte lives here, dispatched through `cloud <verb>`

aws_auth () {

    ensure aws

}
## show the caller identity and region
aws_whoami () {

    ensure aws

    run aws sts get-caller-identity --output table
    info "Region: ${AWS_REGION}"

}
aws_region () {

    printf '%s' "${AWS_REGION}"

}
aws_required_secrets () {

    printf '%s' "AWS_REGION AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY"

}
aws_managed_addons () {

    printf '%s' "autoscaler metrics-server"

}
aws_volume_class () {

    printf 'gp2'

}
## create a hardened s3 bucket: versioning, encryption, public block, optional lifecycle
aws_bucket () {

    local name="${1:?Missing bucket name}" region="${2:-${AWS_REGION}}" expire="${3:-}"

    ensure aws

    if aws s3api head-bucket --bucket "${name}" 2>/dev/null; then

        info "Bucket exists: ${name}"

    else

        step "Creating bucket: ${name}"

        if [[ "${region}" == "us-east-1" ]]; then

            aws s3api create-bucket --bucket "${name}" --region "${region}" >/dev/null \
                || die "Cannot create bucket: ${name}"

        else

            aws s3api create-bucket --bucket "${name}" --region "${region}" \
                --create-bucket-configuration "LocationConstraint=${region}" >/dev/null \
                || die "Cannot create bucket: ${name}"

        fi

    fi

    aws s3api put-bucket-versioning --bucket "${name}" \
        --versioning-configuration Status=Enabled

    aws s3api put-bucket-encryption --bucket "${name}" \
        --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

    aws s3api put-public-access-block --bucket "${name}" \
        --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

    [[ -z "${expire}" ]] || aws s3api put-bucket-lifecycle-configuration --bucket "${name}" \
        --lifecycle-configuration "{\"Rules\":[{\"ID\":\"hygiene\",\"Status\":\"Enabled\",\"Filter\":{},\"Expiration\":{\"Days\":${expire}},\"NoncurrentVersionExpiration\":{\"NoncurrentDays\":${expire}},\"AbortIncompleteMultipartUpload\":{\"DaysAfterInitiation\":7}}]}"

    succ "Bucket ready: ${name}"

}
aws_state_bucket () {

    aws_bucket "${TF_STATE_BUCKET}" "${TF_STATE_REGION:-${AWS_REGION}}"

}
aws_backup_bucket () {

    aws_bucket "${BACKUP_BUCKET}" "${AWS_REGION}" "${BACKUP_KEEP_DAYS}"

}
## drop a state lock no run can hold anymore — a killed run leaves one behind, every later run would wait then die
aws_stale_lock () {

    local key="${PROJECT}/${STACK}.tfstate.tflock" born="" age=0

    ensure aws jq

    born="$(aws s3 cp "s3://${TF_STATE_BUCKET}/${key}" - 2>/dev/null | jq -r '.Created // empty' 2>/dev/null)" || true

    [[ -n "${born}" ]] || return 0

    age=$(( $(date +%s) - $(date -d "${born}" +%s) ))

    (( age > TOFU_LOCK_STALE )) || die "The '${STACK}' state is locked by a run ${age}s old — let it finish, or free it: ${INFRAX_NAME} tofu unlock"

    warn "Dropping a ${age}s-old state lock — no run lives that long"

    aws_unlock

}
aws_unlock () {

    ensure aws

    run aws s3 rm "s3://${TF_STATE_BUCKET}/${PROJECT}/${STACK}.tfstate.tflock"

}
aws_tofu_prereqs () {

    aws_state_bucket
    aws_backup_bucket
    aws_stale_lock

}
aws_backend_flags () {

    printf '%s\n' \
        "-backend-config=bucket=${TF_STATE_BUCKET}" \
        "-backend-config=key=${PROJECT}/${STACK}.tfstate" \
        "-backend-config=region=${TF_STATE_REGION:-${AWS_REGION}}" \
        "-backend-config=encrypt=true" \
        "-backend-config=use_lockfile=true"

}
aws_db_unguard () {

    local module="${1:?aws_db_unguard needs a module}" identifier="${PROJECT}-${1}"

    ensure aws

    aws rds describe-db-instances --db-instance-identifier "${identifier}" >/dev/null 2>&1 || return 0

    step "Lowering the deletion guard of ${module} — this destroy names it on purpose"

    run aws rds modify-db-instance --db-instance-identifier "${identifier}" \
        --no-deletion-protection --apply-immediately >/dev/null \
        || die "Cannot lower deletion protection on '${identifier}' — the destroy would die against it"

}
## the account these credentials act in — asked once, remembered under the build dir
aws_account () {

    local file="${BUILD_DIR}/aws/account" account=""

    if [[ -s "${file}" ]]; then

        cat "${file}"
        return 0

    fi

    ensure aws

    account="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || return 1

    ensure_dir "$(dirname "${file}")"
    printf '%s' "${account}" > "${file}"
    printf '%s' "${account}"

}
aws_registry () {

    local account=""

    if [[ -n "${ECR_REGISTRY}" ]]; then

        printf '%s' "${ECR_REGISTRY}"
        return 0

    fi

    account="$(aws_account)" || return 0

    printf '%s.dkr.ecr.%s.amazonaws.com' "${account}" "${AWS_REGION:?Missing AWS_REGION}"

}
aws_registry_login () {

    ensure aws docker

    aws ecr get-login-password --region "${AWS_REGION}" \
        | docker login --username AWS --password-stdin "${1:?Missing registry}" \
        || die "ECR login failed"

}
aws_registry_refresher () {

    local registry=""

    ensure kubectl

    registry="$(ci_registry)"

    REGISTRY_HOST="${registry%%/*}"
    export REGISTRY_HOST

    render "${TEMPLATE_DIR}/aws/registry-refresher.yaml" "${BUILD_DIR}/k8s/registry-refresher.yaml"

    run kubectl apply -f "${BUILD_DIR}/k8s/registry-refresher.yaml"

    succ "ECR pull-secret refresher scheduled — 6h cadence against the 12h token."

}
aws_registry_user () {

    printf 'AWS'

}
aws_registry_token () {

    ensure aws

    aws ecr get-login-password --region "${AWS_REGION}"

}
aws_edge_annotations () {

    [[ -n "${EDGE_TYPE}" ]] || { printf '{}'; return 0; }

    printf '{"service.beta.kubernetes.io/aws-load-balancer-type":"nlb","service.beta.kubernetes.io/aws-load-balancer-scheme":"internet-facing","service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled":"true"%s}' \
        "${EDGE_EIPS:+,\"service.beta.kubernetes.io/aws-load-balancer-eip-allocations\":\"${EDGE_EIPS}\"}"

}
aws_storage_facts () {

    printf '%s\n' "REGION=${AWS_REGION}" "ENDPOINT=${STORAGE_ENDPOINT}" "SCHEME=s3"

}
aws_database_address () {

    local module="${1:?aws_database_address needs a module}" address=""

    address="$(module_get "${module}" ADDRESS)"

    [[ -n "${address}" ]] || address="$(tofu_output_json database_addresses 2>/dev/null | jq -r --arg module "${module}" '.[$module] // empty')" || true

    [[ -n "${address}" ]] || die "The managed ${module} has no address yet — apply the stack first"

    printf '%s' "${address}"

}
aws_account_annotations () {

    printf '{}'

}
aws_backup_uploader () {

    printf '%s\n' \
        "IMAGE=${AWS_CLI_IMAGE}" \
        'COMMAND=["sh", "-c", "aws s3 cp --recursive --only-show-errors \"$WORK\" \"s3://$BUCKET/$PREFIX/\""]' \
        "ENV={\"BUCKET\": \"${BACKUP_BUCKET}\", \"AWS_DEFAULT_REGION\": \"${AWS_REGION}\"}"

}
aws_backup_fetcher () {

    local object="${1:?Missing object}" file="${2:?Missing file}"

    printf '%s\n' \
        "IMAGE=${AWS_CLI_IMAGE}" \
        'COMMAND=["sh", "-c", "mkdir -p \"$(dirname \"$FILE\")\" && aws s3 cp --only-show-errors \"s3://$BUCKET/$OBJECT\" \"$FILE\""]' \
        "ENV=[{\"name\": \"BUCKET\", \"value\": \"${BACKUP_BUCKET}\"}, {\"name\": \"OBJECT\", \"value\": \"${object}\"}, {\"name\": \"FILE\", \"value\": \"${file}\"}, {\"name\": \"AWS_DEFAULT_REGION\", \"value\": \"${AWS_REGION}\"}, {\"name\": \"HOME\", \"value\": \"/tmp\"}]"

}
aws_backup_list () {

    ensure aws

    run aws s3 ls "s3://${BACKUP_BUCKET}/${1:?Missing prefix}" --recursive --human-readable

}
aws_backup_pull () {

    ensure aws

    run aws s3 cp --only-show-errors "s3://${BACKUP_BUCKET}/${1:?Missing object}" "${2:?Missing destination}"

}
aws_metrics_file () {

    printf '%s' "${TEMPLATE_DIR}/aws/metrics.yaml"

}
aws_kubeconfig () {

    ensure aws kubectl

    ensure_dir "$(dirname "${KUBECONFIG}")"

    run aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${AWS_REGION}" --kubeconfig "${KUBECONFIG}"

}
aws_hcl_buckets () {

    local service="" storage="" out=""

    for service in ${SERVICES:-}; do

        storage="$(service_storage "${service}")"

        [[ -n "${storage}" ]] || continue
        [[ "$(module_mode "${storage}")" == "object" ]] || continue

        out+="\"$(service_bucket "${service}")\" = { service = \"${service}\", public = $( [[ "$(service_get "${service}" PUBLIC)" == "true" ]] && printf true || printf false ) }, "

    done

    printf '{ %s}' "${out}"

}
aws_hcl_databases () {

    local module="" out=""

    for module in $(tofu_managed); do

        out+="${module} = { engine = \"$(module_get "${module}" ENGINE)\", version = \"$(module_get "${module}" ENGINE_VERSION)\", port = $(module_get "${module}" PORT), user = \"$(module_get "${module}" ROOT_USER)\" }, "

    done

    printf '{ %s}' "${out}"

}
aws_hcl_backups () {

    local module="" out=""

    for module in $(model_modules database); do

        [[ -z "$(module_users "${module}")" ]] || out+="\"${module}-backup\", "

    done

    printf '[%s]' "${out%, }"

}
aws_hcl_repositories () {

    local service="" out=""

    for service in ${SERVICES:-}; do

        out+="\"${PROJECT}/${service}\", "

    done

    printf '[%s]' "${out%, }"

}
aws_tofu_vars () {

    printf 'name             = "%s"\n' "${PROJECT}"
    printf 'region           = "%s"\n' "${AWS_REGION}"
    printf 'vpc_cidr         = "%s"\n' "${VPC_CIDR}"
    printf 'az_count         = %s\n'   "${AZ_COUNT}"
    printf 'repositories     = %s\n'   "$(aws_hcl_repositories)"
    printf 'keep_images      = %s\n'   "${REGISTRY_KEEP_IMAGES}"
    printf 'buckets          = %s\n'   "$(aws_hcl_buckets)"
    printf 'backup_bucket    = "%s"\n' "${BACKUP_BUCKET}"

    if [[ "${CLUSTER_SOURCE}" != "managed" ]]; then

        printf 'ec2_type       = "%s"\n' "${EC2_TYPE}"
        printf 'ec2_disk_gb    = %s\n'   "${EC2_DISK_GB}"
        printf 'ec2_ubuntu     = "%s"\n' "${EC2_UBUNTU}"
        printf 'admin_cidrs    = %s\n'   "$(tofu_hcl_list "${ADMIN_CIDRS}")"
        printf 'ssh_public_key = "%s"\n' "${SSH_PUBLIC_KEY}"

        return 0

    fi

    printf 'cluster_name       = "%s"\n' "${CLUSTER_NAME}"
    printf 'k8s_version        = "%s"\n' "${K8S_VERSION}"
    printf 'node_type          = "%s"\n' "${EKS_NODE_TYPE}"
    printf 'node_disk_gb       = %s\n'   "${NODE_DISK_GB}"
    printf 'node_min           = %s\n'   "${NODE_MIN}"
    printf 'node_desired       = %s\n'   "${NODE_DESIRED}"
    printf 'node_max           = %s\n'   "${NODE_MAX}"
    printf 'node_max_pods      = %s\n'   "${NODE_MAX_PODS}"
    printf 'databases          = %s\n'   "$(aws_hcl_databases)"
    printf 'db_instance_class  = "%s"\n' "${DB_INSTANCE_CLASS}"
    printf 'db_disk_gb         = %s\n'   "${DB_DISK_GB}"
    printf 'db_max_disk_gb     = %s\n'   "${DB_MAX_DISK_GB}"
    printf 'db_backup_days     = %s\n'   "${DB_BACKUP_DAYS}"
    printf 'db_multi_az        = %s\n'   "${DB_MULTI_AZ}"
    printf 'db_replicas        = %s\n'   "${DB_REPLICAS}"
    printf 'db_apply_now       = %s\n'   "${DB_APPLY_NOW}"
    printf 'db_alarm_cpu       = %s\n'   "${DB_ALARM_CPU}"
    printf 'db_alarm_free_gb   = %s\n'   "${DB_ALARM_FREE_GB}"
    printf 'k8s_namespace      = "%s"\n' "${K8S_NAMESPACE}"
    printf 'backup_accounts    = %s\n'   "$(aws_hcl_backups)"
    printf 'edge_fixed_ips     = %s\n'   "${EDGE_FIXED_IPS}"
    printf 'log_retention_days = %s\n'   "${LOG_RETENTION_DAYS}"
    printf 'alarm_email        = "%s"\n' "${ALARM_EMAIL}"

}

# @module backup

## database backups — take, list, pull, restore (never over the live database)

backup_module () {

    local module="${1:-}"

    [[ -n "${module}" && " $(model_modules database | paste -sd ' ' -) " == *" ${module} "* ]] \
        || die "Name one of this project's databases: $(model_modules database | paste -sd ' ' -)"

    printf '%s' "${module}"

}
backup_wait () {

    local name="${1:?Missing job name}" left="${BACKUP_JOB_TRIES}"

    step "Waiting for ${name}"

    while (( left-- )); do

        [[ -z "$(kubectl -n "${K8S_NAMESPACE}" get "job/${name}" -o jsonpath='{.status.conditions[*].type}' 2>/dev/null)" ]] || break

        sleep "${BACKUP_JOB_POLL}"

    done

    kubectl -n "${K8S_NAMESPACE}" logs "job/${name}" --all-containers --tail=-1 2>/dev/null || true

    [[ "$(kubectl -n "${K8S_NAMESPACE}" get "job/${name}" -o jsonpath='{.status.succeeded}')" == "1" ]] \
        || die "Job '${name}' failed — the pod log above says why"

}
## take a backup right now — of one database module, or of every one
backup_now () {

    local module="" modules=() name=""

    ensure kubectl

    if [[ -n "${1:-}" ]]; then modules=( "$(backup_module "${1}")" ); else mapfile -t modules < <(model_modules database); fi

    for module in "${modules[@]}"; do

        name="${module}-backup-manual-$(date -u +%s)"

        run kubectl -n "${K8S_NAMESPACE}" create job "${name}" --from="cronjob/${module}-backup" >/dev/null \
            || die "Cannot schedule '${name}' — is the ${module} backup cronjob deployed?"

        backup_wait "${name}"

    done

    succ "Backup complete — '${INFRAX_NAME} backup list <module>' shows it."

}
## list the stored backups of one database module
backup_list () {

    local module=""

    module="$(backup_module "${1:-}")"

    if [[ "${BACKUP_TARGET}" == "object" ]]; then

        cloud backup_list "${PROJECT}/${module}/"
        return 0

    fi

    ensure kubectl

    kubectl run "${module}-backup-list-$(date -u +%s)" -n "${K8S_NAMESPACE}" --rm --attach --quiet --restart=Never \
        --image="$(module_get "${module}" IMAGE)" \
        --labels="app.kubernetes.io/name=${module}-backup" \
        --overrides="{\"spec\":{\"securityContext\":{\"runAsNonRoot\":true,\"runAsUser\":$(module_get "${module}" USER)},\"volumes\":[{\"name\":\"backups\",\"persistentVolumeClaim\":{\"claimName\":\"${module}-backups\"}}],\"containers\":[{\"name\":\"list\",\"image\":\"$(module_get "${module}" IMAGE)\",\"command\":[\"sh\",\"-c\",\"find /backups -type f | sort\"],\"volumeMounts\":[{\"name\":\"backups\",\"mountPath\":\"/backups\"}]}]}}"

}
## download one stored backup to this machine — <module> <database> <stamp>
backup_pull () {

    local module="" database="${2:?Usage: backup pull <module> <database> <stamp>}" stamp="${3:?Missing stamp}" file=""

    module="$(backup_module "${1:-}")"

    [[ "${BACKUP_TARGET}" == "object" ]] || die "Backups of '${STACK}' live on a cluster volume — '${INFRAX_NAME} backup list ${module}' shows them in place"

    file="${database}/${stamp}.$(module_get "${module}" DUMP)"

    ensure_dir "${BUILD_DIR}/backups/${module}/${database}"

    cloud backup_pull "${PROJECT}/${module}/${file}" "${BUILD_DIR}/backups/${module}/${file}"

    succ "Pulled → ${BUILD_DIR}/backups/${module}/${file}"

}
## restore a stamp into a SIDE database — <module> <database> <stamp> [target]; promote deliberately, never over the live one
backup_restore () {

    local module="" database="${2:?Usage: backup restore <module> <database> <stamp> [target]}" stamp="${3:?Missing stamp}" target="" key="" value="" file=""

    module="$(backup_module "${1:-}")"
    target="${4:-${database}_restore}"

    [[ "${target}" != "${database}" ]] || die "Refusing to restore over '${database}' — promotion is a deliberate act"

    confirm "Restore ${module} '${database}' ${stamp} into the side database '${target}'?"

    file="$(tmp_file)"

    RESTORE_NAME="${module}-restore-$(date -u +%s)"
    RESTORE_MODULE="${module}"
    RESTORE_USER="$(module_get "${module}" USER)"
    RESTORE_IMAGE="$(module_get "${module}" IMAGE)"
    RESTORE_PORT="$(module_get "${module}" PORT)"
    RESTORE_SOURCE="${database}"
    RESTORE_TARGET="${target}"
    RESTORE_STAMP="${stamp}"
    RESTORE_FILE="${database}/${stamp}.$(module_get "${module}" DUMP)"
    RESTORE_FETCH_IMAGE="${RESTORE_IMAGE}"
    RESTORE_FETCH_COMMAND='["true"]'
    RESTORE_FETCH_ENV="[]"
    RESTORE_WORK="persistentVolumeClaim: {claimName: ${module}-backups}"

    if [[ "${BACKUP_TARGET}" == "object" ]]; then

        RESTORE_WORK="emptyDir: {}"

        while IFS='=' read -r key value; do

            case "${key}" in
                IMAGE   ) RESTORE_FETCH_IMAGE="${value}" ;;
                COMMAND ) RESTORE_FETCH_COMMAND="${value}" ;;
                ENV     ) RESTORE_FETCH_ENV="${value}" ;;
            esac

        done < <(cloud backup_fetcher "${PROJECT}/${module}/${RESTORE_FILE}" "/work/${RESTORE_FILE}")

    fi

    export RESTORE_NAME RESTORE_MODULE RESTORE_USER RESTORE_IMAGE RESTORE_PORT RESTORE_SOURCE RESTORE_TARGET RESTORE_STAMP RESTORE_FILE \
        RESTORE_FETCH_IMAGE RESTORE_FETCH_COMMAND RESTORE_FETCH_ENV RESTORE_WORK

    render "${TEMPLATE_DIR}/k8s/restore.yaml" "${file}"

    ensure kubectl

    run kubectl apply -f "${file}" >/dev/null

    rm -f "${file}"

    backup_wait "${RESTORE_NAME}"

    succ "Restored ${module} '${database}' ${stamp} into '${target}' — verify it, then promote deliberately."

}

# @module ci

## the release line and the verify wall

ci_tag () {

    if [[ -n "${IMAGE_TAG_OVERRIDE:-}" ]]; then

        printf '%s' "${IMAGE_TAG_OVERRIDE}"
        return 0

    fi

    printf '%s' "${GITHUB_SHA:-$(git -C "${REPO_ROOT}" rev-parse HEAD)}" | cut -c1-"${IMAGE_TAG_LENGTH}"

}
ci_registry () {

    local registry="${REGISTRY:-}"

    [[ -n "${registry}" ]] || registry="$(cloud registry)"

    [[ -n "${registry}" ]] || die "Missing REGISTRY — set it, or give credentials for a cloud that hosts one"

    printf '%s' "${registry}"

}
ci_image () {

    local registry=""

    registry="$(ci_registry)"

    printf '%s/%s/%s' "${registry}" "${PROJECT:?Missing PROJECT}" "${1:?ci_image needs a service}"

}
ci_pick () {

    local service=""

    CI_TARGETS=()

    if (( $# == 0 )); then

        read -ra CI_TARGETS <<< "${SERVICES:?Missing SERVICES}"
        return 0

    fi

    for service in "$@"; do

        app_service "${service}" >/dev/null
        CI_TARGETS+=( "${service}" )

    done

}
## print one resolved setting — the value the release line acts on (secrets refused)
ci_setting () {

    local key="${1:?Missing setting name}"

    ! secret_name "${key}" || die "Refusing to print '${key}' — it is a secret"

    printf '%s\n' "${!key:-}"

}
ci_login () {

    local registry=""

    ensure docker

    registry="$(ci_registry)"

    if [[ -n "${REGISTRY_USER}" ]]; then

        secret_require GIT_TOKEN \
            | docker login --username "${REGISTRY_USER}" --password-stdin "${registry%%/*}" \
            || die "Registry login failed"

        return 0

    fi

    cloud registry_login "${registry%%/*}"

}
ci_dockerfile () {

    local service="${1}" file="" dir=""

    file="$(service_get "${service}" DOCKERFILE)"

    if [[ -n "${file}" ]]; then

        printf '%s' "${REPO_ROOT}/${file}"
        return 0

    fi

    dir="$(runtime_dir "$(service_runtime "${service}")")"

    printf '%s' "${dir}/Dockerfile"

}
ci_build_args () {

    local service="${1}" key="" value=""

    for key in $(service_get "${service}" BUILD_ARGS); do

        value="$(service_get "${service}" "${key}")"
        printf '%s\n' --build-arg "${key}=${value}"

    done

}
## build the image of every service (or the named ones) for this stack
ci_build () {

    local service="" image="" tag="" dockerfile="" context="" args=()

    ensure docker

    tag="$(ci_tag)"

    ci_pick "$@"

    for service in "${CI_TARGETS[@]}"; do

        image="$(ci_image "${service}")"
        dockerfile="$(ci_dockerfile "${service}")"
        context="${REPO_ROOT}/$(service_path "${service}")"

        mapfile -t args < <(ci_build_args "${service}")

        step "Building ${service} → ${image}:${tag}"

        run docker build \
            -f "${dockerfile}" \
            "${args[@]}" \
            --label "org.opencontainers.image.source=${GIT_REPO_URL%.git}" \
            --label "org.opencontainers.image.revision=${tag}" \
            --label "io.infrax.service=${service}" \
            -t "${image}:${tag}" \
            ${DOCKER_NETWORK:+--network=${DOCKER_NETWORK}} \
            "${context}"

    done

}
ci_answers () {

    local address="${1}" health="${2}" code=""

    if [[ -n "${health}" ]]; then

        code="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "http://${address}${health}" || true)"
        [[ "${code}" == "200" ]]
        return

    fi

    ( : > "/dev/tcp/${address%:*}/${address##*:}" ) 2>/dev/null

}
## boot every built image and prove it before it ships — its runtime's own checks, then its health path answering
ci_prove () {

    local service="" image="" port="" health="" prove="" dir="" id="" address="" pair="" waited=0 flags=() pairs=()

    ensure docker curl

    ci_pick "$@"

    for service in "${CI_TARGETS[@]}"; do

        image="$(ci_image "${service}"):$(ci_tag)"
        port="$(service_get "${service}" PORT)"
        health="$(service_get "${service}" HEALTH)"
        dir="$(runtime_dir "$(service_runtime "${service}")")"
        prove="${dir}/prove.sh"
        flags=( -e "PORT=${port}" )

        read -ra pairs <<< "$(service_get "${service}" PROVE_ENV)"

        for pair in "${pairs[@]}"; do

            flags+=( -e "${pair}" )

        done

        if [[ -f "${prove}" ]]; then

            docker run --rm --entrypoint sh "${image}" -c "$(cat "${prove}")" || die "${service}: the image does not carry what its runtime needs"

        fi

        id="$(docker run -d --rm "${flags[@]}" -p "127.0.0.1::${port}" "${image}")" || die "${service}: ${image} does not start"
        address="$(docker port "${id}" "${port}/tcp" | sed -n '1p')"
        waited=0

        until ci_answers "${address}" "${health}"; do

            if (( waited >= PROVE_WAIT )); then

                docker logs "${id}" 2>&1 | tail -n "${POD_LOG_LINES}" >&2
                docker rm -f "${id}" >/dev/null 2>&1 || true

                die "${service}: ${image} never answered ${health:-its port} within ${PROVE_WAIT}s"

            fi

            sleep 2
            waited=$(( waited + 2 ))

        done

        docker rm -f "${id}" >/dev/null 2>&1 || true

        succ "${service}: proven — it boots and answers ${health:-on its port} after ${waited}s."

    done

}
ci_shipped () {

    docker manifest inspect "${1}" >/dev/null 2>&1

}
## push every image — an immutable tag already in the registry is reused, never fought
ci_push () {

    local service="" ref="" tag=""

    tag="$(ci_tag)"

    ci_login
    ci_pick "$@"

    for service in "${CI_TARGETS[@]}"; do

        ref="$(ci_image "${service}"):${tag}"

        if ci_shipped "${ref}"; then info "Already in the registry — ${ref##*/} is immutable and reused"; continue; fi

        run docker push "${ref}"

    done

}
ci_accept () {

    local finding="${1:?Missing finding}"

    [[ "${CVE_ALLOW}" == "true" ]] \
        || die "${finding} — review them, then re-release with CVE_ALLOW=true to accept"

    warn "${finding} accepted via CVE_ALLOW."

}
## count the fixable CRITICAL findings of one image with trivy — every one is printed, the ones CVE_IGNORE names are accepted
ci_trivy () {

    local image="${1:?Usage: ci trivy <image>}" report="" ignore=""

    ensure trivy jq

    report="$(trivy image --scanners vuln --severity CRITICAL --ignore-unfixed --format json --quiet "${image}")"
    ignore="$(jq -cn --arg list "${CVE_IGNORE:-}" '$list | gsub(","; " ") | split(" ") | map(select(length > 0))')"

    jq -r --argjson ignore "${ignore}" '.Results[]? | .Target as $target | .Vulnerabilities[]?
        | "  \(.VulnerabilityID)  \(.PkgName) \(.InstalledVersion) → \(.FixedVersion)  (\($target))\(if (.VulnerabilityID | IN($ignore[])) then "  — accepted by CVE_IGNORE" else "" end)"' <<< "${report}" >&2

    jq --argjson ignore "${ignore}" '[.Results[]? | (.Vulnerabilities // [])[] | select(.VulnerabilityID | IN($ignore[]) | not)] | length' <<< "${report}"

}
## the CVE gate — every image scanned by trivy against one rule, wherever it lives: a fixable CRITICAL blocks unless accepted
ci_scan () {

    local service="" tag="" critical="" image=""

    tag="$(ci_tag)"

    ci_pick "$@"

    for service in "${CI_TARGETS[@]}"; do

        image="$(ci_image "${service}"):${tag}"

        step "Scanning ${image}"

        critical="$(ci_trivy "${image}")"

        [[ "${critical}" =~ ^[0-9]+$ ]] || critical=0

        if (( critical > 0 )); then

            ci_accept "${service}: ${critical} CRITICAL finding(s) on ${tag}"
            continue

        fi

        succ "${service}: scan clean — zero fixable CRITICAL findings."

    done

}
## derive the stack values from the manifest, write the new image tag, commit what argocd reads
ci_bump () {

    local tag=""

    tag="$(ci_tag)"

    helm_seed
    helm_bump "${tag}"

    is_ci || return 0

    git -C "${REPO_ROOT}" config user.name "${CI_BOT_NAME}"
    git -C "${REPO_ROOT}" config user.email "${CI_BOT_EMAIL}"
    git -C "${REPO_ROOT}" add "$(helm_deploy_dir)"

    if git -C "${REPO_ROOT}" diff --cached --quiet; then

        info "Values already carry this topology — nothing to bump."
        return 0

    fi

    git -C "${REPO_ROOT}" commit --quiet -m "chore(${INFRAX_NAME}): ${STACK} topology for ${tag}" || die "GitOps bump commit failed"

    if ! git -C "${REPO_ROOT}" push --quiet; then

        warn "GitOps bump raced another push — rebasing onto the remote"

        git -C "${REPO_ROOT}" pull --rebase --quiet || die "GitOps bump rebase failed — the release is NOT live"
        git -C "${REPO_ROOT}" push --quiet || die "GitOps bump push failed — the release is NOT live"

    fi

    succ "Stack values committed — the image tag itself rides the application, not the file."

}
## refuse a release the manifest cannot carry — before a single byte is built
ci_preflight () {

    model_verify
    secrets_check

    succ "Preflight clear — the manifest carries this release."

}
## wait until every public service answers its health path on its own name
ci_deployed () {

    local service="" host="" health="" code="" waited=0

    if ! dns_managed; then

        warn "This stack does not own its names — the release is live on the cluster; point its hosts at the edge yourself."
        return 0

    fi

    for service in ${SERVICES}; do

        host="$(service_host "${service}")"

        [[ -n "${host}" ]] || continue

        health="$(service_get "${service}" HEALTH)"
        waited=0
        code=""

        step "Waiting for https://${host}${health} to answer"

        while (( waited < RELEASE_WAIT )); do

            code="$(curl -sS -o /dev/null -m 15 -w '%{http_code}' "https://${host}${health}" 2>/dev/null || true)"

            [[ "${code}" != "200" ]] || break

            sleep "${RELEASE_POLL}"
            waited=$(( waited + RELEASE_POLL ))

        done

        [[ "${code}" == "200" ]] || die "${service} does not answer on https://${host}${health} after ${RELEASE_WAIT}s (last: ${code:-nothing})"

        succ "${service} is live on ${host} after ${waited}s."

    done

}
## tell the alert channel how the release ended — success|failure, called by the workflow when the job settles
ci_outcome () {

    local status="${1:?ci outcome needs the job status}" tag="" run=""

    tag="$(ci_tag)"
    run="${GITHUB_SERVER_URL:-${GITHUB_URL}}/${GITHUB_REPOSITORY:-${GIT_REPO}}/actions/runs/${GITHUB_RUN_ID:-}"

    case "${status}" in
        success) audit_alarm "🚀 ${PROJECT} ${tag} is live on '${STACK}' — ${SERVICES}" ;;
        *)       audit_alarm "🔴 ${PROJECT} release ${tag} on '${STACK}' ${status} — ${run}" ;;
    esac

    succ "Outcome ${status} reported."

}
## the ONE entry point: converge cloud → build → prove → push → scan → vendor → bump → converge cluster + names → wait for the edge
ci_release () {

    ci_preflight
    tofu_ensure
    ci_build
    ci_prove
    ci_push
    ci_scan
    helm_vendor
    ci_bump
    k8s_ensure
    dns_ensure
    ci_deployed

    succ "Release $(ci_tag) delivered to '${STACK}' — ${SERVICES}."

}
ci_rendered () {

    local file="${1}" kind="${2}" name="${3}"

    awk -v kind="${kind}" -v name="${name}" '
        /^---/ { k = ""; n = "" }
        /^kind: / { k = $2 }
        /^  name: / && n == "" { n = $2 }
        k == kind && n == name { found = 1 }
        END { exit found ? 0 : 1 }
    ' "${file}"

}
ci_matrix_stack () {

    local stack="${1}" root="" rendered="" name="" chart="" host="" args=() hosts=() services=() stores=() tools=()

    root="${BUILD_DIR}/matrix/${stack}"
    rendered="${root}/rendered.yaml"
    args=( -s "${stack}" -y -e "INFRAX_YES=1" )

    rm -rf "${root}"
    ensure_dir "${root}"

    for name in $(model_modules database); do

        args+=( -e "$(model_key "${name}")_ADDRESS=${MATRIX_HOST}" )

    done

    "${INFRAX_BIN}" "${args[@]}" helm seed "${root}" >/dev/null || die "Matrix seed failed for '${stack}'"
    "${INFRAX_BIN}" "${args[@]}" helm lint "${root}" >/dev/null || die "Matrix lint failed for '${stack}'"

    : > "${rendered}"

    for name in ${SERVICES} $(model_modules "database cache tool"); do

        chart="$(helm_chart_of "${name}")"

        helm template "${name}" "$(helm_charts)/${chart}" -f "${root}/helm/values/${name}.${stack}.yaml" -n "${K8S_NAMESPACE}" >> "${rendered}" \
            || die "Matrix render failed for '${name}' on '${stack}'"

    done

    kubeconform -strict -summary -ignore-missing-schemas -kubernetes-version "${K8S_VERSION}.0" "${rendered}" >/dev/null \
        || die "Matrix schema check failed for '${stack}'"

    for name in ${SERVICES}; do

        ci_rendered "${rendered}" Deployment "${name}-$(k8s_first_process "${name}")" || die "Matrix: '${stack}' renders no workload for ${name}"
        ci_rendered "${rendered}" NetworkPolicy "${name}" || die "Matrix: '${stack}' leaves ${name} without a network policy"
        ci_rendered "${rendered}" ServiceAccount "${name}" || die "Matrix: '${stack}' gives ${name} no identity"

        for chart in $(service_uses "${name}"); do

            [[ "$(module_kind "${chart}")" != "database" ]] || ci_rendered "${rendered}" Job "${name}-provision-${chart}" \
                || die "Matrix: '${stack}' never provisions ${name}'s own ${chart} database"

        done

        [[ -z "$(service_get "${name}" MIGRATE)" ]] || ci_rendered "${rendered}" Job "${name}-migrate" || die "Matrix: '${stack}' drops the migration of ${name}"

        mapfile -t hosts < <(service_hosts "${name}")

        (( ${#hosts[@]} == 0 )) || ci_rendered "${rendered}" HTTPRoute "${name}" || die "Matrix: '${stack}' answers for ${name} on no route"

    done

    for name in $(model_modules "database cache"); do

        if [[ "$(awk '/^mode: /{print $2; exit}' "${root}/helm/values/${name}.${stack}.yaml")" == "managed" ]]; then

            grep -q "externalName: ${MATRIX_HOST}" "${rendered}" || die "Matrix: '${stack}' runs ${name} managed but never names its address"

        else

            ci_rendered "${rendered}" StatefulSet "${name}" || die "Matrix: '${stack}' lost the StatefulSet named ${name} — state keeps its name for life"

        fi

    done

    ! grep -rlE '^  tag: "?(latest)?"?$' "$(helm_values_dir)"/*."${stack}".yaml 2>/dev/null \
        || die "Deploy truth carries a floating tag on '${stack}' — every service ships an immutable git sha"

    for name in "$(helm_values_dir)"/*."${stack}".yaml; do

        [[ -f "${name}" ]] || continue

        diff <(grep '^  repository: ' "${name}") <(grep '^  repository: ' "${root}/helm/values/${name##*/}") >/dev/null \
            || die "Matrix: '${stack}' is committed against a registry this project does not own (${name##*/})"

    done

    mapfile -t hosts < <(model_hosts)

    for host in "${hosts[@]}"; do

        [[ "${host}" == "${HOST_PREFIX:-}"*".${BASE_DOMAIN}" ]] || die "Matrix: '${stack}' answers on ${host}, outside ${HOST_PREFIX:-}*.${BASE_DOMAIN}"

    done

    read -ra services <<< "${SERVICES}"
    mapfile -t stores < <(model_modules "database cache")
    mapfile -t tools < <(model_modules tool)

    rm -rf "${root}/apps"
    cp -R "${TEMPLATE_DIR}/argocd/apps" "${root}/apps"
    [[ ! -d "${root}/argocd/apps/files" ]] || cp -R "${root}/argocd/apps/files" "${root}/apps/files"

    helm template apps "${root}/apps" --set stack="${stack}" --set imageTag=probe \
        --set-json "services=$(yaml_list "${services[@]}")" --set-json "data=$(yaml_list "${stores[@]}")" --set-json "tools=$(yaml_list "${tools[@]}")" \
        > "${root}/apps.yaml" || die "Matrix: '${stack}' app-of-apps does not render"

    for name in "${services[@]}" "${stores[@]}" "${tools[@]}"; do

        ci_rendered "${root}/apps.yaml" Application "${name}" || die "Matrix: '${stack}' app-of-apps forgets ${name}"

    done

    grep -q 'value: "probe"' "${root}/apps.yaml" || die "Matrix: '${stack}' drops the release tag on its way to the services"

    succ "Matrix '${stack}' — ${#services[@]} service(s), ${#stores[@]} data module(s), ${#tools[@]} tool(s) render, validate and keep their contract."

}
## law: every stack renders a coherent platform — workloads, identities, policies, state names, routes, apps
ci_matrix () {

    local stack=""

    ensure helm kubeconform

    ensure_dir "${BUILD_DIR}/matrix"

    for stack in ${STACKS}; do

        ci_matrix_stack "${stack}"

    done

    ci_certs
    ci_edge
    ci_dashboards

    succ "Render matrix proven — every stack keeps the contract its manifest implies."

}
## law: the certificate covers exactly the names the routes answer on
ci_certs () {

    local gateway="${BUILD_DIR}/matrix/gateway.yaml" hosts=() routed="" certified=""

    ensure helm

    mapfile -t hosts < <(model_hosts)

    (( ${#hosts[@]} )) || { info "No public name — the certificate law has nothing to hold."; return 0; }

    run helm template gateway "$(helm_charts)/gateway" \
        --set tlsEnabled=true --set dns01=true --set sslEmail="${SSL_EMAIL:-${LINT_EMAIL}}" \
        --set-json "hostnames=$(yaml_list "${hosts[@]}")" > "${gateway}" \
        || die "Gateway render failed"

    certified="$(awk '/dnsNames:/{on=1; next} on && /^    - /{gsub(/^    - |"/, ""); print; next} {on=0}' "${gateway}" | sort -u | paste -sd ' ' -)"
    routed="$(printf '%s\n' "${hosts[@]}" | sort -u | paste -sd ' ' -)"

    [[ "${certified}" == "${routed}" ]] || die "TLS gap: routes answer on [${routed}] but the certificate covers [${certified}]"

    succ "TLS contract proven — every routed name is a certified name, and nothing else is."

}
## law: edge wiring renders any annotations and the cloud mints exactly its own
ci_edge () {

    local rendered=""

    ensure helm

    rendered="$(helm template gateway "$(helm_charts)/gateway" --set sslEmail="${LINT_EMAIL}" --set-json "hostnames=[\"${LINT_DOMAIN}\"]" \
        --set edgeType=lb --set-string 'edgeAnnotations.fixed/addresses=probe-a\,probe-b')" \
        || die "Edge render failed"

    grep -q 'fixed/addresses: "probe-a,probe-b"' <<< "${rendered}" \
        || die "Edge: the balancer forgets the annotations it was given"

    rendered="$(EDGE_TYPE=lb EDGE_EIPS='' cloud edge_annotations)"

    jq -e . <<< "${rendered}" >/dev/null || die "Edge: the ${CLOUD} annotations are not a json object"

    succ "Edge contract proven — the chart renders any annotations, ${CLOUD} mints a clean object."

}
## law: grafana dashboards parse
ci_dashboards () {

    local file=""

    ensure helm python3

    python3 -c 'import yaml' 2>/dev/null || pkg_install python3-yaml

    file="${BUILD_DIR}/matrix/dashboards.yaml"

    helm template observability "$(helm_charts)/observability" \
        --set host="${LINT_DOMAIN}" --set appNamespace="${K8S_NAMESPACE}" \
        --set metricsRelease="${METRICS_RELEASE}" > "${file}" \
        || die "Observability render failed"

    python3 -c "
import sys, yaml, json
maps = [d for d in yaml.safe_load_all(open('${file}')) if d and d.get('kind') == 'ConfigMap']
assert maps, 'no dashboard shipped'
for m in maps:
    for name, body in m['data'].items():
        json.loads(body)
" || die "A dashboard this bundle ships is not valid json"

    succ "Dashboards proven — every panel this bundle ships parses."

}
ci_github () {

    local method="${1:?Missing method}" path="${2:?Missing path}" body="${3:-}" token=""

    token="$(secret_require GIT_TOKEN)"

    curl -sS -o /dev/null -w '%{http_code}' -X "${method}" "${GITHUB_API}/repos/${GIT_REPO}${path}" \
        -H "Authorization: Bearer ${token}" \
        -H "Accept: application/vnd.github+json" \
        ${body:+--data "${body}"}

}
## arm or disarm the external github watcher for this stack
ci_guard () {

    local state="${1:-on}" code=""

    ensure curl

    if [[ "${state}" == "off" ]]; then

        code="$(ci_github PUT "/actions/workflows/watch.yml/disable")"

        [[ "${code}" == 2* ]] || die "Cannot disable the watcher (HTTP ${code})"

        succ "External guard disarmed — nothing probes from GitHub anymore."

        return 0

    fi

    code="$(ci_github PUT "/actions/workflows/watch.yml/enable")"

    [[ "${code}" == 2* ]] || die "Cannot enable the watcher (HTTP ${code})"

    [[ -n "$(secret_get ALERT_BOT_TOKEN)" ]] || warn "ALERT_BOT_TOKEN repo secret is yours to set once — without it the guard sees but cannot speak"

    succ "External guard armed — GitHub probes every public service every ten minutes."

}
ci_probe () {

    printf '%s\n' "${GIT_TOKEN:+manifest}" "${EC2_TYPE:+knob}" "${SERVICE_PROBE_RUNTIME:+service}" "${FOREIGN_KEY:+foreign}" | paste -sd ' ' -

}
## law: the repo secrets reach the release line — manifest keys, knobs and service keys load, foreign keys never do
ci_loader () {

    local seen=""

    seen="$(JSON_ENV='{"GIT_TOKEN":"probe","EC2_TYPE":"probe","SERVICE_PROBE_RUNTIME":"go","FOREIGN_KEY":"probe"}' "${INFRAX_BIN}" -y ci probe)"

    [[ "${seen}" == "manifest knob service " ]] || die "The secrets loader is wrong — it saw [${seen}], expected [manifest knob service ]"

    succ "Secrets loader proven — manifest keys, knobs and service keys load, foreign keys stay out."

}
## law: every rendered template resolves — names computed at render time are read from the scripts themselves
ci_templates () {

    local file="" key="" computed=""

    computed=" $(infrax_code | grep -oE '\b[A-Z][A-Z0-9_]*=' | tr -d = | sort -u | paste -sd ' ' -) "

    for file in "${TEMPLATE_DIR}"/argocd/project.yaml "${TEMPLATE_DIR}"/argocd/root.yaml "${TEMPLATE_DIR}"/*/*.yaml "${TEMPLATE_DIR}"/k8s/*.yaml \
        "${TEMPLATE_DIR}"/helm/values/*.tpl "${TEMPLATE_DIR}"/module/*/values.tpl "${TEMPLATE_DIR}"/module/*/app.yaml "${TEMPLATE_DIR}"/module/*/*.env \
        "${TEMPLATE_DIR}"/runtime/*/env; do

        [[ -f "${file}" && "${file}" != */helm/*/templates/* && "${file}" != */argocd/apps/* ]] || continue

        for key in $(placeholders "${file}"); do

            [[ -n "${!key+x}" || "${computed}" == *" ${key} "* ]] || die "Template ${file#"${TEMPLATE_DIR}"/} names ${key} — nothing defines it"

        done

    done

    succ "Templates resolve — every placeholder has a source."

}
## law: workflow files lint clean
ci_workflows () {

    local workflows=()

    ensure actionlint

    mapfile -t workflows < <(find "${REPO_ROOT}/.github/workflows" -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null | sort)

    (( ${#workflows[@]} )) || { info "No workflows to lint."; return 0; }

    run actionlint "${workflows[@]}"

    succ "Workflows lint clean."

}
## law: no secret material in tracked files
ci_leaks () {

    local config="" path=""

    ensure gitleaks

    config="$(tmp_file)"

    cat > "${config}" <<'TOML'
[extend]
useDefault = true

[allowlist]
paths = ['''\.infrax/''', '''\.terraform/''']
regexes = ['''^[A-Z][A-Z0-9_]*=$''']
TOML

    for path in "${REPO_ROOT}/.github" "$(helm_deploy_dir)" "${REPO_ROOT}"/infrax*.env "${REPO_ROOT}/.env.example" "${REPO_ROOT}/.secret.example"; do

        [[ -e "${path}" ]] || continue

        run gitleaks dir "${path}" --no-banner --redact -c "${config}"

    done

    rm -f "${config}"

    succ "No secret material in the workflows, the gitops path, the manifest or the examples."

}
## the wall: shellcheck, the manifest law, the render matrix, the loader, templates, workflows, leaks, tofu
ci_verify () {

    local file="" code="" failed=0

    ensure shellcheck helm tofu

    code="$(tmp_file)"
    infrax_code > "${code}"

    while IFS= read -r file; do

        shellcheck -s bash -x -S "${SHELLCHECK_SEVERITY}" -e "${SHELLCHECK_EXCLUDES}" "${file}" || failed=1

    done < <(find "${TEMPLATE_DIR}" -name '*.sh' ! -path '*/module/*/scripts/*'; printf '%s\n' "${code}")

    rm -f "${code}"

    (( failed == 0 )) || die "Shell lint failed"

    model_verify
    ci_matrix
    ci_loader
    ci_templates
    ci_workflows
    ci_leaks
    secrets_example
    tofu_fmt -check
    tofu_validate

    succ "${INFRAX_NAME} verification passed."

}
## refuse to proceed unless the CI run for this commit is green (waits out an in-flight one)
ci_gate () {

    local attempt="" verdict=""

    ensure gh

    for attempt in $(seq 1 "${CI_GATE_ATTEMPTS}"); do

        verdict="$(gh run list --repo "${GITHUB_REPOSITORY:-${GIT_REPO}}" --workflow=CI --commit "$(git -C "${REPO_ROOT}" rev-parse HEAD)" \
            --json status,conclusion --jq '.[0] | .status + "/" + (.conclusion // "")')"

        case "${verdict}" in

            completed/success ) succ "CI is green for this commit."; return 0 ;;
            completed/*       ) die "CI concluded '${verdict}' — refused" ;;
            ""                ) die "No CI run found for this commit — refused" ;;
            *                 ) info "CI is '${verdict}' — waiting (${attempt}/${CI_GATE_ATTEMPTS})"; sleep "${CI_GATE_POLL}" ;;

        esac

    done

    die "CI never concluded — refused"

}

# @module dns

## managed names — point every public name at the stack edge, and never touch a name this stack does not own

dns_call () {

    local method="${1:?Missing method}" path="${2:?Missing path}" body="${3:-}" token=""

    token="$(secret_require CLOUDFLARE_API_TOKEN)"

    curl -sS -X "${method}" "${CLOUDFLARE_API}${path}" \
        -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" \
        ${body:+--data "${body}"}

}
## the zone this stack answers in — CLOUDFLARE_DOMAIN_ID when the manifest names it, looked up by BASE_DOMAIN otherwise
dns_zone () {

    [[ "${DNS_PROVIDER}" == "cloudflare" ]] || die "DNS_PROVIDER '${DNS_PROVIDER}' is not one infrax speaks — cloudflare"

    if [[ -z "${CLOUDFLARE_DOMAIN_ID}" ]]; then

        ensure curl jq

        CLOUDFLARE_DOMAIN_ID="$(dns_call GET "/zones?name=${BASE_DOMAIN}" | jq -r '.result[0].id // empty')"

        [[ -n "${CLOUDFLARE_DOMAIN_ID}" ]] || die "No zone answers for ${BASE_DOMAIN} — the token cannot see it, or the zone is not there"

        export CLOUDFLARE_DOMAIN_ID

    fi

    printf '%s' "${CLOUDFLARE_DOMAIN_ID}"

}
dns_api () {

    local method="${1:?Missing method}" path="${2:?Missing path}" body="${3:-}" zone=""

    zone="$(dns_zone)"

    dns_call "${method}" "/zones/${zone}${path}" "${body}"

}
## true when this stack owns its names
dns_managed () {

    [[ -n "${DNS_PROVIDER}" ]]

}
## the names this stack owns — every public host, nothing else
dns_names () {

    model_hosts | sort -u

}
## the ownership law: a name is ours only when this stack answers on it, inside our prefix, under our domain
dns_owns () {

    local name="${1:?dns_owns needs a name}"

    [[ "${name}" == *".${BASE_DOMAIN}" && "${name}" == "${HOST_PREFIX:-}"* ]] || return 1
    [[ " $(dns_names | paste -sd ' ' -) " == *" ${name} "* ]]

}
## resolve the current edge address
dns_edge () {

    local address=""

    if [[ -n "${EDGE_TYPE}" ]]; then

        ensure kubectl

        address="$(k8s_gateway_address hostname)"

        if [[ -n "${address}" ]]; then printf 'CNAME %s' "${address}"; return 0; fi

        address="$(k8s_gateway_address ip)"

        if [[ -n "${address}" ]]; then printf 'A %s' "${address}"; return 0; fi

        warn "The gateway has no load balancer address yet — run '${INFRAX_NAME} dns sync' once it does"

        return 1

    fi

    address="$(server_host)"

    printf 'A %s' "${address}"

}
## upsert one record this stack owns
dns_record () {

    local name="${1:?Missing name}" type="${2:?Missing type}" content="${3:?Missing content}" id="" body=""

    ensure curl jq

    dns_owns "${name}" || die "Refusing to write ${name} — this stack does not own it (prefix '${HOST_PREFIX:-}', domain '${BASE_DOMAIN}')"

    id="$(dns_api GET "/dns_records?name=${name}" | jq -r '.result[0].id // empty')"

    body="$(jq -nc --arg type "${type}" --arg name "${name}" --arg content "${content}" \
        '{type: $type, name: $name, content: $content, proxied: false, ttl: 60}')"

    if [[ -n "${id}" ]]; then

        dns_api PUT "/dns_records/${id}" "${body}" | jq -e '.success' >/dev/null || die "Cannot update record: ${name}"

        info "${name} → ${type} ${content}"

        return 0

    fi

    dns_api POST "/dns_records" "${body}" | jq -e '.success' >/dev/null || die "Cannot create record: ${name}"

    info "${name} → ${type} ${content} (new)"

}
## point every name this stack owns at the current edge
dns_sync () {

    local edge="" type="" content="" name=""

    dns_managed || die "Missing DNS_PROVIDER — no stack owns names without one"

    edge="$(dns_edge)"
    type="${edge%% *}"
    content="${edge#* }"

    for name in $(dns_names); do

        dns_record "${name}" "${type}" "${content}"

    done

    succ "DNS points at this stack — every name it owns resolves to its edge."

}
## converge the edge names when this stack owns any — silent otherwise
dns_ensure () {

    dns_managed || { info "No DNS provider for this stack — names stay as they are."; return 0; }
    dns_edge >/dev/null 2>&1 || { warn "The edge has no address yet — names stay as they are until it does."; return 0; }

    dns_sync

}
## show the live records this stack owns
dns_show () {

    local owned=""

    ensure curl jq

    owned="$(dns_names | paste -sd ' ' -)"

    dns_api GET "/dns_records?per_page=500" \
        | jq -r --arg owned " ${owned} " '.result[] | select($owned | contains(" " + .name + " ")) | "\(.type)\t\(.name)\t\(.content)\tproxied=\(.proxied)"'

}
## remove every record this stack owns (confirmed) — for a stack that is going away
dns_purge () {

    local name="" id=""

    ensure curl jq

    confirm "Delete every DNS record the '${STACK}' stack owns?"

    for name in $(dns_names); do

        dns_owns "${name}" || continue

        id="$(dns_api GET "/dns_records?name=${name}" | jq -r '.result[0].id // empty')"

        [[ -n "${id}" ]] || continue

        dns_api DELETE "/dns_records/${id}" | jq -e '.success' >/dev/null || die "Cannot delete record: ${name}"

        info "${name} removed"

    done

    succ "Every name this stack owned is released."

}

# @module gcp

## the gcp provider — every gcp byte lives here, dispatched through `cloud <verb>`

GCP_KEY_FILE=""

gcp_release_key () {

    [[ -z "${GCP_KEY_FILE}" ]] || rm -f "${GCP_KEY_FILE}"

}
gcp_auth () {

    local raw="${GCP_CREDENTIALS:-}"

    ensure gcloud

    [[ -n "${raw}" && -z "${GCP_KEY_FILE}" ]] || return 0

    umask 077

    GCP_KEY_FILE="$(mktemp)"

    if [[ "${raw}" == \{* ]]; then printf '%s' "${raw}" > "${GCP_KEY_FILE}"; else base64 -d <<< "${raw}" > "${GCP_KEY_FILE}" || die "GCP_CREDENTIALS is neither json nor base64"; fi

    trap gcp_release_key EXIT

    export GOOGLE_APPLICATION_CREDENTIALS="${GCP_KEY_FILE}" CLOUDSDK_CORE_PROJECT="${GCP_PROJECT}"

    gcloud auth activate-service-account --key-file="${GCP_KEY_FILE}" --quiet >/dev/null 2>&1 || die "GCP_CREDENTIALS does not authenticate"

}
## show the active account, project and region
gcp_whoami () {

    gcp_auth

    run gcloud auth list --filter=status:ACTIVE --format='value(account)'
    info "Project: ${GCP_PROJECT} · Region: ${GCP_REGION}"

}
gcp_region () {

    printf '%s' "${GCP_REGION}"

}
gcp_required_secrets () {

    printf '%s' "GCP_PROJECT GCP_REGION GCP_CREDENTIALS"

}
gcp_managed_addons () {

    printf ''

}
gcp_volume_class () {

    printf 'standard-rwo'

}
gcp_account_id () {

    local id=""

    id="$(printf '%s-%s' "${PROJECT}" "${1:?gcp_account_id needs a name}" | cut -c1-30)"

    printf '%s' "${id%-}"

}
## create a hardened gcs bucket: uniform access, public prevention, versioning, optional lifecycle
gcp_bucket () {

    local name="${1:?Missing bucket name}" expire="${2:-}" file=""

    gcp_auth

    if gcloud storage buckets describe "gs://${name}" >/dev/null 2>&1; then

        info "Bucket exists: ${name}"

    else

        step "Creating bucket: ${name}"

        gcloud storage buckets create "gs://${name}" --location="${GCP_REGION}" --uniform-bucket-level-access \
            --public-access-prevention --quiet >/dev/null || die "Cannot create bucket: ${name}"

    fi

    gcloud storage buckets update "gs://${name}" --versioning --quiet >/dev/null

    if [[ -n "${expire}" ]]; then

        file="$(tmp_file)"

        printf '{"rule":[{"action":{"type":"Delete"},"condition":{"age":%s}},{"action":{"type":"Delete"},"condition":{"daysSinceNoncurrentTime":%s}}]}' "${expire}" "${expire}" > "${file}"

        gcloud storage buckets update "gs://${name}" --lifecycle-file="${file}" --quiet >/dev/null

        rm -f "${file}"

    fi

    succ "Bucket ready: ${name}"

}
gcp_tofu_prereqs () {

    gcp_bucket "${TF_STATE_BUCKET}"
    gcp_bucket "${BACKUP_BUCKET}" "${BACKUP_KEEP_DAYS}"
    gcp_stale_lock

}
gcp_backend_flags () {

    printf '%s\n' \
        "-backend-config=bucket=${TF_STATE_BUCKET}" \
        "-backend-config=prefix=${PROJECT}/${STACK}"

}
gcp_stale_lock () {

    local lock="gs://${TF_STATE_BUCKET}/${PROJECT}/${STACK}/default.tflock" born="" age=0

    born="$(gcloud storage objects describe "${lock}" --format='value(creation_time)' 2>/dev/null)" || true

    [[ -n "${born}" ]] || return 0

    age=$(( $(date +%s) - $(date -d "${born}" +%s) ))

    (( age > TOFU_LOCK_STALE )) || die "The '${STACK}' state is locked by a run ${age}s old — let it finish, or free it: ${INFRAX_NAME} tofu unlock"

    warn "Dropping a ${age}s-old state lock — no run lives that long"

    gcp_unlock

}
gcp_unlock () {

    gcp_auth

    run gcloud storage rm "gs://${TF_STATE_BUCKET}/${PROJECT}/${STACK}/default.tflock" --quiet

}
gcp_db_unguard () {

    local module="${1:?gcp_db_unguard needs a module}" instance="${PROJECT}-${1}"

    gcp_auth

    gcloud sql instances describe "${instance}" >/dev/null 2>&1 || return 0

    step "Lowering the deletion guard of ${module} — this destroy names it on purpose"

    run gcloud sql instances patch "${instance}" --no-deletion-protection --quiet >/dev/null \
        || die "Cannot lower deletion protection on '${instance}' — the destroy would die against it"

}
gcp_registry () {

    printf '%s-docker.pkg.dev/%s' "${GCP_REGION:?Missing GCP_REGION}" "${GCP_PROJECT:?Missing GCP_PROJECT}"

}
gcp_registry_login () {

    gcp_auth
    ensure docker

    gcloud auth print-access-token | docker login --username oauth2accesstoken --password-stdin "https://${1:?Missing registry}" \
        || die "Artifact Registry login failed"

}
gcp_registry_refresher () {

    local registry=""

    ensure kubectl

    registry="$(ci_registry)"

    REGISTRY_HOST="${registry%%/*}"
    export REGISTRY_HOST

    render "${TEMPLATE_DIR}/gcp/registry-refresher.yaml" "${BUILD_DIR}/k8s/registry-refresher.yaml"

    run kubectl apply -f "${BUILD_DIR}/k8s/registry-refresher.yaml"

    succ "Artifact Registry pull-secret refresher scheduled — the node identity mints the token."

}
gcp_registry_user () {

    printf 'oauth2accesstoken'

}
gcp_registry_token () {

    gcp_auth

    gcloud auth print-access-token

}
gcp_edge_annotations () {

    [[ -n "${EDGE_TYPE}" && -n "${EDGE_EIPS}" ]] || { printf '{}'; return 0; }

    printf '{"networking.gke.io/load-balancer-ip-addresses":"%s"}' "${EDGE_EIPS}"

}
gcp_storage_facts () {

    printf '%s\n' "REGION=${GCP_REGION}" "ENDPOINT=${STORAGE_ENDPOINT:-https://storage.googleapis.com}" "SCHEME=gs"

}
gcp_database_address () {

    local module="${1:?gcp_database_address needs a module}" address=""

    address="$(module_get "${module}" ADDRESS)"

    [[ -n "${address}" ]] || address="$(tofu_output_json database_addresses 2>/dev/null | jq -r --arg module "${module}" '.[$module] // empty')" || true

    [[ -n "${address}" ]] || die "The managed ${module} has no address yet — apply the stack first"

    printf '%s' "${address}"

}
gcp_account_annotations () {

    local name="${1:?gcp_account_annotations needs a name}" storage=""

    [[ "${CLUSTER_SOURCE}" == "managed" ]] || { printf '{}'; return 0; }

    if [[ "${name}" != *-backup ]]; then

        storage="$(service_storage "${name}")"

        [[ -n "${storage}" ]] || { printf '{}'; return 0; }

    fi

    printf '{"iam.gke.io/gcp-service-account": "%s@%s.iam.gserviceaccount.com"}' "$(gcp_account_id "${name}")" "${GCP_PROJECT}"

}
gcp_backup_uploader () {

    printf '%s\n' \
        "IMAGE=${GCLOUD_IMAGE}" \
        'COMMAND=["sh", "-c", "gcloud storage cp -r --no-user-output-enabled \"$WORK\"/* \"gs://$BUCKET/$PREFIX/\""]' \
        "ENV={\"BUCKET\": \"${BACKUP_BUCKET}\", \"CLOUDSDK_CONFIG\": \"/tmp/gcloud\"}"

}
gcp_backup_fetcher () {

    local object="${1:?Missing object}" file="${2:?Missing file}"

    printf '%s\n' \
        "IMAGE=${GCLOUD_IMAGE}" \
        'COMMAND=["sh", "-c", "mkdir -p \"$(dirname \"$FILE\")\" && gcloud storage cp --no-user-output-enabled \"gs://$BUCKET/$OBJECT\" \"$FILE\""]' \
        "ENV=[{\"name\": \"BUCKET\", \"value\": \"${BACKUP_BUCKET}\"}, {\"name\": \"OBJECT\", \"value\": \"${object}\"}, {\"name\": \"FILE\", \"value\": \"${file}\"}, {\"name\": \"CLOUDSDK_CONFIG\", \"value\": \"/tmp/gcloud\"}, {\"name\": \"HOME\", \"value\": \"/tmp\"}]"

}
gcp_backup_list () {

    gcp_auth

    run gcloud storage ls -l -r "gs://${BACKUP_BUCKET}/${1:?Missing prefix}"

}
gcp_backup_pull () {

    gcp_auth

    run gcloud storage cp "gs://${BACKUP_BUCKET}/${1:?Missing object}" "${2:?Missing destination}"

}
gcp_metrics_file () {

    printf ''

}
gcp_kubeconfig () {

    gcp_auth
    ensure kubectl

    ensure_dir "$(dirname "${KUBECONFIG}")"

    KUBECONFIG="${KUBECONFIG}" run gcloud container clusters get-credentials "${CLUSTER_NAME}" --region "${GCP_REGION}" --project "${GCP_PROJECT}"

}
gcp_hcl_buckets () {

    local service="" storage="" out=""

    for service in ${SERVICES:-}; do

        storage="$(service_storage "${service}")"

        [[ -n "${storage}" ]] || continue
        [[ "$(module_mode "${storage}")" == "object" ]] || continue

        out+="\"$(service_bucket "${service}")\" = { service = \"${service}\", account = \"$(gcp_account_id "${service}")\", public = $( [[ "$(service_get "${service}" PUBLIC)" == "true" ]] && printf true || printf false ) }, "

    done

    printf '{ %s}' "${out}"

}
gcp_hcl_databases () {

    local module="" version="" out=""

    for module in $(tofu_managed); do

        version="$(module_get "${module}" ENGINE_VERSION)"
        version="${version%.*}"

        [[ "$(module_get "${module}" ENGINE)" != "postgres" ]] || version="${version%%.*}"

        out+="${module} = { version = \"$(module_get "${module}" ENGINE | tr '[:lower:]' '[:upper:]')_${version//./_}\", user = \"$(module_get "${module}" ROOT_USER)\" }, "

    done

    printf '{ %s}' "${out}"

}
gcp_hcl_backups () {

    local module="" out=""

    for module in $(model_modules database); do

        [[ -z "$(module_users "${module}")" ]] || out+="\"${module}-backup\" = \"$(gcp_account_id "${module}-backup")\", "

    done

    printf '{ %s}' "${out}"

}
gcp_tofu_vars () {

    printf 'name          = "%s"\n' "${PROJECT}"
    printf 'project       = "%s"\n' "${GCP_PROJECT}"
    printf 'region        = "%s"\n' "${GCP_REGION}"
    printf 'zone          = "%s"\n' "${GCP_ZONE:-${GCP_REGION}-a}"
    printf 'vpc_cidr      = "%s"\n' "${VPC_CIDR}"
    printf 'repository    = "%s"\n' "${PROJECT}"
    printf 'keep_images   = %s\n'   "${REGISTRY_KEEP_IMAGES}"
    printf 'buckets       = %s\n'   "$(gcp_hcl_buckets)"
    printf 'backup_bucket = "%s"\n' "${BACKUP_BUCKET}"
    printf 'admin_cidrs   = %s\n'   "$(tofu_hcl_list "${ADMIN_CIDRS}")"

    if [[ "${CLUSTER_SOURCE}" != "managed" ]]; then

        printf 'machine_type   = "%s"\n' "${GCE_TYPE}"
        printf 'disk_gb        = %s\n'   "${GCE_DISK_GB}"
        printf 'image          = "%s"\n' "${GCE_IMAGE}"
        printf 'ssh_user       = "%s"\n' "${SSH_USER}"
        printf 'ssh_public_key = "%s"\n' "${SSH_PUBLIC_KEY}"

        return 0

    fi

    printf 'cluster_name    = "%s"\n' "${CLUSTER_NAME}"
    printf 'node_type       = "%s"\n' "${GKE_NODE_TYPE}"
    printf 'node_disk_gb    = %s\n'   "${NODE_DISK_GB}"
    printf 'node_min        = %s\n'   "${NODE_MIN}"
    printf 'node_max        = %s\n'   "${NODE_MAX}"
    printf 'databases       = %s\n'   "$(gcp_hcl_databases)"
    printf 'db_tier         = "%s"\n' "${CLOUDSQL_TIER}"
    printf 'db_disk_gb      = %s\n'   "${DB_DISK_GB}"
    printf 'db_backup_days  = %s\n'   "${DB_BACKUP_DAYS}"
    printf 'db_multi_az     = %s\n'   "${DB_MULTI_AZ}"
    printf 'k8s_namespace   = "%s"\n' "${K8S_NAMESPACE}"
    printf 'backup_accounts = %s\n'   "$(gcp_hcl_backups)"

}

# @module helm

## chart shaping — the values of every service and module, the vendored charts, direct installs

helm_charts () {

    printf '%s' "${TEMPLATE_DIR}/helm"

}
helm_deploy_dir () {

    printf '%s' "${REPO_ROOT}/${DEPLOY_PATH}"

}
helm_values_dir () {

    printf '%s/helm/values' "${1:-$(helm_deploy_dir)}"

}
helm_values () {

    printf '%s/%s.%s.yaml' "$(helm_values_dir "${2:-}")" "${1:?helm_values needs a name}" "${STACK}"

}
helm_files_dir () {

    printf '%s/argocd/apps/files/%s' "${1:-$(helm_deploy_dir)}" "${STACK}"

}
helm_chart_of () {

    local name="${1:?helm_chart_of needs a name}"

    if [[ " ${SERVICES:-} " == *" ${name} "* ]]; then

        printf 'service'
        return 0

    fi

    [[ " ${MODULES:-} " == *" ${name} "* ]] || die "'${name}' is neither a service nor a module of this project"

    case "$(module_kind "${name}")" in
        tool    ) printf 'tool' ;;
        storage ) die "'${name}' is a binding — it runs no workload of its own" ;;
        *       ) printf 'data' ;;
    esac

}
## vendor the charts argocd reads and the bundle itself into the gitops path — regenerated by every release, never hand-edited
helm_vendor () {

    local deploy="" chart=""

    deploy="$(helm_deploy_dir)"

    ensure_dir "${deploy}/argocd/apps"
    ensure_dir "${deploy}/helm"

    find "${deploy}/argocd/apps" -mindepth 1 -maxdepth 1 ! -name files -exec rm -rf {} +
    cp -R "${TEMPLATE_DIR}/argocd/apps/." "${deploy}/argocd/apps/" || die "Cannot vendor the app-of-apps chart"

    for chart in service data tool gateway observability; do

        rm -rf "${deploy}/helm/${chart}"
        cp -R "$(helm_charts)/${chart}" "${deploy}/helm/${chart}" || die "Cannot vendor the ${chart} chart"

    done

    install -m 0755 "${INFRAX_BIN}" "${deploy}/${INFRAX_NAME}.sh" || die "Cannot vendor the bundle"
    ( cd "${deploy}" && sha256sum "${INFRAX_NAME}.sh" > SHA256SUMS ) || die "Cannot stamp the vendored bundle"

    succ "Charts and the ${INFRAX_NAME} ${INFRAX_VERSION} bundle vendored into ${DEPLOY_PATH} — argocd and CI read this exact tool from the repo."

}
helm_tag () {

    local service="" file="" tag=""

    read -r service _ <<< "${SERVICES:?Missing SERVICES — the release tag rides the services}"

    file="$(helm_values "${service}")"

    [[ ! -f "${file}" ]] || tag="$(sed -n '/^  tag: /{s/^  tag: *"\{0,1\}\([^"]*\)"\{0,1\}$/\1/p;q}' "${file}")"

    [[ -n "${tag}" ]] || die "Stack values carry no image tag: ${file}"

    printf '%s' "${tag}"

}
seed_metrics_namespace () {

    [[ "${OBSERVABILITY_ENABLED}" != "true" ]] || printf '%s' "${OBSERVABILITY_NAMESPACE}"

}
seed_env () {

    local service="${1}" file="" callee="" line="" url="" out=""

    file="$(runtime_dir "$(service_runtime "${service}")")/env"
    url="$(service_url "${service}")"

    while IFS= read -r line; do

        out+=$'\n'"  ${line%%=*}: $(yaml_str "${line#*=}")"

    done < <(

        [[ ! -f "${file}" ]] || ( export SERVICE_NAME="${service}" SERVICE_URL="${url}"; render_text < "${file}"; printf '\n' ) | env_pairs

        for callee in $(service_calls "${service}"); do

            printf '%s=http://%s:%s\n' "$(service_var "${callee}" URL)" "${callee}" "$(service_get "${callee}" PORT)"

        done

    )

    [[ -n "${out}" ]] || out=" {}"

    printf '%s' "${out}"

}
seed_processes () {

    local service="${1}" process="" key="" port="" command="" route="" replicas="" grace="" cpu="" memory="" limit="" out=""

    for process in $(service_processes "${service}"); do

        key="$(model_key "${process}")"
        command="$(service_get "${service}" "${key}_COMMAND")"
        port="$(service_get "${service}" "${key}_PORT")"
        route="$(service_get "${service}" "${key}_ROUTE")"
        replicas="$(service_get "${service}" "${key}_REPLICAS")"
        grace="$(service_get "${service}" "${key}_GRACE")"
        cpu="$(service_get "${service}" "${key}_CPU")"
        memory="$(service_get "${service}" "${key}_MEMORY")"
        limit="$(service_get "${service}" "${key}_MEMORY_LIMIT")"

        [[ "${process}" != "web" || -n "${port}" ]] || port="$(service_get "${service}" PORT)"
        [[ -n "${cpu}" ]] || cpu="$(service_get "${service}" WEB_CPU)"
        [[ -n "${memory}" ]] || memory="$(service_get "${service}" WEB_MEMORY)"
        [[ -n "${limit}" ]] || limit="$(service_get "${service}" WEB_MEMORY_LIMIT)"

        out+=$'\n'"  ${process}:"
        out+=$'\n'"    command: $(argv_json "${command}")"
        out+=$'\n'"    port: ${port:-0}"
        out+=$'\n'"    route: $(yaml_str "${route}")"
        out+=$'\n'"    replicas: ${replicas:-1}"
        out+=$'\n'"    grace: ${grace:-30}"
        out+=$'\n'"    resources:"
        out+=$'\n'"      requests: { cpu: ${cpu}, memory: ${memory} }"
        out+=$'\n'"      limits: { memory: ${limit} }"

    done

    printf '%s' "${out}"

}
seed_provision () {

    local service="${1}" module="" out=""

    for module in $(service_uses "${service}"); do

        [[ "$(module_kind "${module}")" == "database" ]] || continue

        out+="${out:+, }{\"module\": $(yaml_str "${module}"), \"key\": $(yaml_str "$(model_key "${module}")"), \"image\": $(yaml_str "$(module_get "${module}" IMAGE)")"
        out+=", \"user\": $(module_get "${module}" USER), \"host\": $(yaml_str "$(module_host "${module}")"), \"port\": $(module_get "${module}" PORT)"
        out+=", \"extensions\": $(yaml_str "$(module_get "${module}" EXTENSIONS)")}"

    done

    printf '[%s]' "${out}"

}
seed_service () {

    local service="${1}" file="${2}" tag="" storage="" hosts=() callers=()

    [[ ! -f "${file}" ]] || tag="$(sed -n '/^  tag: /{s/^  tag: *"\{0,1\}\([^"]*\)"\{0,1\}$/\1/p;q}' "${file}")"

    mapfile -t hosts < <(service_hosts "${service}")
    mapfile -t callers < <(service_callers "${service}")

    storage="$(service_storage "${service}")"

    SEED_NAME="${service}"
    SEED_RUNTIME="$(service_runtime "${service}")"
    SEED_IMAGE="$(ci_image "${service}")"
    SEED_TAG="${tag:-latest}"
    SEED_PULL_SECRETS="[]"
    SEED_USER="$(service_get "${service}" USER)"
    SEED_PORT="$(service_get "${service}" PORT)"
    SEED_PROBE="$(service_get "${service}" PROBE)"
    SEED_HEALTH="$(service_get "${service}" HEALTH)"
    SEED_ENV="$(seed_env "${service}")"
    SEED_PROCESSES="$(seed_processes "${service}")"
    SEED_REPLICAS_MIN="$(service_get "${service}" REPLICAS_MIN)"
    SEED_REPLICAS_MAX="$(service_get "${service}" REPLICAS_MAX)"
    SEED_CPU_TARGET="$(service_get "${service}" CPU_TARGET)"
    SEED_SURGE="${ROLLOUT_SURGE}"
    SEED_UNAVAILABLE="${ROLLOUT_UNAVAILABLE}"
    SEED_VOLUME=false
    SEED_VOLUME_CLASS="${VOLUME_CLASS}"
    SEED_VOLUME_SIZE="${STORAGE_SIZE}"
    SEED_MOUNT="$(service_get "${service}" MOUNT)"
    SEED_ROUTE=false
    SEED_HOSTS="$(yaml_list "${hosts[@]}")"
    SEED_GATEWAY_NAMESPACE="${GATEWAY_NAMESPACE}"
    SEED_SECTION="${GATEWAY_SECTION}"
    SEED_PROXY_NAMESPACE="${ENVOY_NAMESPACE}"
    SEED_METRICS_NAMESPACE="$(seed_metrics_namespace)"
    SEED_CALLERS="$(yaml_list "${callers[@]}")"
    SEED_MIGRATE="$(argv_json "$(service_get "${service}" MIGRATE)")"
    SEED_PROVISION="$(seed_provision "${service}")"
    SEED_METRICS=""
    SEED_ACCOUNT="$(cloud account_annotations "${service}")"

    [[ "${REGISTRY_PULL}" != "true" ]] || SEED_PULL_SECRETS="[pull-secret]"
    [[ -z "${storage}" ]] || [[ "$(module_mode "${storage}")" != "volume" ]] || SEED_VOLUME=true
    (( ${#hosts[@]} == 0 )) || SEED_ROUTE=true
    [[ -z "${SEED_METRICS_NAMESPACE}" ]] || SEED_METRICS="$(service_get "${service}" METRICS)"

    export SEED_NAME SEED_RUNTIME SEED_IMAGE SEED_TAG SEED_PULL_SECRETS SEED_USER SEED_PORT SEED_PROBE SEED_HEALTH SEED_ENV SEED_PROCESSES \
        SEED_REPLICAS_MIN SEED_REPLICAS_MAX SEED_CPU_TARGET SEED_SURGE SEED_UNAVAILABLE SEED_VOLUME SEED_VOLUME_CLASS SEED_VOLUME_SIZE SEED_MOUNT \
        SEED_ROUTE SEED_HOSTS SEED_GATEWAY_NAMESPACE SEED_SECTION SEED_PROXY_NAMESPACE SEED_METRICS_NAMESPACE SEED_CALLERS SEED_MIGRATE \
        SEED_PROVISION SEED_METRICS SEED_ACCOUNT

    render "$(helm_charts)/values/service.tpl" "${file}"

}
seed_files () {

    local dir="${1}" mode="${2}" file="" body="" out=""

    for file in "${dir}"/*; do

        [[ -f "${file}" ]] || continue

        if [[ "${mode}" == "render" ]]; then body="$(render_text < "${file}" | indent 4)"; else body="$(indent 4 < "${file}")"; fi

        out+=$'\n'"  ${file##*/}: |"$'\n'"${body}"

    done

    [[ -n "${out}" ]] || out=" {}"

    printf '%s' "${out}"

}
seed_uploader () {

    local key="" value=""

    SEED_UPLOADER_IMAGE="${SEED_IMAGE}"
    SEED_UPLOADER_COMMAND='["sh", "-c", "find \"$WORK\" -type f -mtime +\"$KEEP_DAYS\" -delete"]'
    SEED_UPLOADER_ENV="{}"

    [[ "${BACKUP_TARGET}" == "object" ]] || return 0

    while IFS='=' read -r key value; do

        case "${key}" in
            IMAGE   ) SEED_UPLOADER_IMAGE="${value}" ;;
            COMMAND ) SEED_UPLOADER_COMMAND="${value}" ;;
            ENV     ) SEED_UPLOADER_ENV="${value}" ;;
        esac

    done < <(cloud backup_uploader)

}
seed_app () {

    local module="${1}" files="${2}" template="" mode=""

    template="$(module_dir "${module}")/app.yaml"
    mode="$(module_mode "${module}")"

    [[ -f "${template}" && "${OBSERVABILITY_ENABLED}" == "true" ]] || return 0

    SEED_PROJECT="${PROJECT}"
    SEED_NAMESPACE="${K8S_NAMESPACE}"
    SEED_SSLMODE="$(module_get "${module}" "SSLMODE_${mode^^}")"

    export SEED_PROJECT SEED_NAMESPACE SEED_SSLMODE

    render "${template}" "${files}/${module}.yaml"

}
seed_data () {

    local module="${1}" file="${2}" files="${3}" dir="" service="" users=() tools=() databases=()

    dir="$(module_dir "${module}")"

    mapfile -t users < <(module_users "${module}")
    mapfile -t tools < <(model_tools_for "${module}")

    for service in "${users[@]}"; do

        databases+=( "$(model_ident "${service}")" )

    done

    SEED_NAME="${module}"
    SEED_MODE="$(module_mode "${module}")"
    SEED_IMAGE="$(module_get "${module}" IMAGE)"
    SEED_PORT="$(module_get "${module}" PORT)"
    SEED_USER="$(module_get "${module}" USER)"
    SEED_ROOT_USER="$(module_get "${module}" ROOT_USER)"
    SEED_ADDRESS=""
    SEED_CPU="$(module_get "${module}" CPU)"
    SEED_MEMORY="$(module_get "${module}" MEMORY)"
    SEED_MEMORY_LIMIT="$(module_get "${module}" MEMORY_LIMIT)"
    SEED_SIZE="$(module_get "${module}" SIZE)"
    SEED_VOLUME_CLASS="${VOLUME_CLASS}"
    SEED_CLIENTS="$(yaml_list "${users[@]}" "${tools[@]}")"
    SEED_METRICS_NAMESPACE="$(seed_metrics_namespace)"
    SEED_BACKUP=false
    SEED_BACKUP_SCHEDULE="${BACKUP_SCHEDULE}"
    SEED_BACKUP_TARGET="${BACKUP_TARGET}"
    SEED_DATABASES="$(yaml_list "${databases[@]}")"
    SEED_BACKUP_PREFIX="${PROJECT}/${module}"
    SEED_BACKUP_ACCOUNT="$(cloud account_annotations "${module}-backup")"
    SEED_BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS}"
    SEED_BACKUP_SIZE="${BACKUP_SIZE}"

    [[ "${SEED_MODE}" != "managed" ]] || SEED_ADDRESS="$(cloud database_address "${module}")"
    [[ ! -f "${dir}/scripts/backup.sh" ]] || (( ${#databases[@]} == 0 )) || SEED_BACKUP=true

    seed_uploader

    export SEED_NAME SEED_MODE SEED_IMAGE SEED_PORT SEED_USER SEED_ROOT_USER SEED_ADDRESS SEED_CPU SEED_MEMORY SEED_MEMORY_LIMIT SEED_SIZE \
        SEED_VOLUME_CLASS SEED_CLIENTS SEED_METRICS_NAMESPACE SEED_BACKUP SEED_BACKUP_SCHEDULE SEED_BACKUP_TARGET SEED_DATABASES \
        SEED_BACKUP_PREFIX SEED_BACKUP_ACCOUNT SEED_BACKUP_KEEP_DAYS SEED_BACKUP_SIZE SEED_UPLOADER_IMAGE SEED_UPLOADER_COMMAND SEED_UPLOADER_ENV

    SEED_SCRIPTS="$(seed_files "${dir}/scripts" raw)"
    SEED_INIT="$(seed_files "${dir}/init" render)"

    export SEED_SCRIPTS SEED_INIT

    render "${dir}/values.tpl" "${file}"

    seed_app "${module}" "${files}"

}
seed_tool () {

    local module="${1}" file="${2}" target="" label="" host="" hosts=() cidrs=() caps=()

    target="$(module_get "${module}" TARGET)"

    for label in $(module_get "${module}" HOST); do

        host="$(model_fqdn "${label}")"
        hosts+=( "${host}" )

    done

    read -ra cidrs <<< "${ADMIN_CIDRS//,/ }"
    read -ra caps <<< "$(module_get "${module}" CAPS)"

    SEED_NAME="${module}"
    SEED_IMAGE="$(module_get "${module}" IMAGE)"
    SEED_PORT="$(module_get "${module}" PORT)"
    SEED_USER="$(module_get "${module}" USER)"
    SEED_CAPS="$(yaml_list "${caps[@]}")"
    SEED_HEALTH="$(module_get "${module}" HEALTH)"
    SEED_TARGET="${target}"
    SEED_TARGET_PORT="$(module_get "${target}" PORT)"
    SEED_TARGET_USER="$(module_get "${target}" ROOT_USER)"
    SEED_PROJECT="${PROJECT}"
    SEED_EMAIL="${SSL_EMAIL:-admin@${BASE_DOMAIN:-${LINT_DOMAIN}}}"
    SEED_URL=""
    SEED_ROUTE=false
    SEED_HOSTS="$(yaml_list "${hosts[@]}")"
    SEED_AUTH='""'
    SEED_CIDRS="$(yaml_list "${cidrs[@]}")"
    SEED_GATEWAY_NAMESPACE="${GATEWAY_NAMESPACE}"
    SEED_SECTION="${GATEWAY_SECTION}"
    SEED_PROXY_NAMESPACE="${ENVOY_NAMESPACE}"
    SEED_CPU="$(module_get "${module}" CPU)"
    SEED_MEMORY="$(module_get "${module}" MEMORY)"
    SEED_MEMORY_LIMIT="$(module_get "${module}" MEMORY_LIMIT)"

    if (( ${#hosts[@]} )); then

        SEED_ROUTE=true
        SEED_AUTH="$(k8s_tools_auth)"
        SEED_URL="https://${hosts[0]}/"

    fi

    export SEED_NAME SEED_IMAGE SEED_PORT SEED_USER SEED_CAPS SEED_HEALTH SEED_TARGET SEED_TARGET_PORT SEED_TARGET_USER SEED_PROJECT SEED_EMAIL \
        SEED_URL SEED_ROUTE SEED_HOSTS SEED_AUTH SEED_CIDRS SEED_GATEWAY_NAMESPACE SEED_SECTION SEED_PROXY_NAMESPACE SEED_CPU SEED_MEMORY SEED_MEMORY_LIMIT

    render "$(module_dir "${module}")/values.tpl" "${file}"

}
seed_cloud () {

    local files="${1}" template=""

    template="$(cloud metrics_file)"

    [[ -n "${template}" && "${CLOUD_METRICS}" == "true" && "${OBSERVABILITY_ENABLED}" == "true" ]] || return 0

    render "${template}" "${files}/cloud-metrics.yaml"

}
## derive every service, module and app file of this stack from the manifest — overwrites hand edits, commit the result
helm_seed () {

    local root="${1:-$(helm_deploy_dir)}" dir="" files="" service="" module=""

    model_verify

    dir="$(helm_values_dir "${root}")"
    files="$(helm_files_dir "${root}")"

    ensure_dir "${dir}"
    rm -rf "${files}"
    ensure_dir "${files}"

    for service in ${SERVICES}; do seed_service "${service}" "${dir}/${service}.${STACK}.yaml"; done
    for module in $(model_modules "database cache"); do seed_data "${module}" "${dir}/${module}.${STACK}.yaml" "${files}"; done
    for module in $(model_modules tool); do seed_tool "${module}" "${dir}/${module}.${STACK}.yaml"; done

    seed_cloud "${files}"

    succ "Seeded '${STACK}' — ${SERVICES}${MODULES:+ · ${MODULES}}; topology only, the release decides the image tag."

}
## write the image tag into every service this stack carries
helm_bump () {

    local tag="${1:?Missing image tag}" service=""

    for service in ${SERVICES}; do

        sed -i "s|^  tag: .*|  tag: \"${tag}\"|" "$(helm_values "${service}")" || die "Cannot bump the tag of ${service}"

    done

    succ "Image tag → ${tag}"

}
## lint every chart against every values file this stack carries
helm_lint () {

    local root="${1:-}" name="" chart=""

    ensure helm

    for name in ${SERVICES:-} $(model_modules "database cache tool"); do

        chart="$(helm_chart_of "${name}")"
        run helm lint --quiet "$(helm_charts)/${chart}" -f "$(helm_values "${name}" "${root}")"

    done

    run helm lint --quiet "$(helm_charts)/gateway" --set-json "hostnames=[\"${LINT_DOMAIN}\"]" --set sslEmail="${LINT_EMAIL}"
    run helm lint --quiet "$(helm_charts)/observability" --set host="${LINT_DOMAIN}"
    run helm lint --quiet "${TEMPLATE_DIR}/argocd/apps" --set stack="${STACK}"

    succ "Helm charts lint clean."

}
## render the chart of one service or module to stdout
helm_template () {

    local name="${1:?Usage: helm template <service|module> [values-root]}" root="${2:-}" chart=""

    ensure helm

    chart="$(helm_chart_of "${name}")"

    helm template "${name}" "$(helm_charts)/${chart}" -f "$(helm_values "${name}" "${root}")" -n "${K8S_NAMESPACE}"

}
## install one service or module directly, bypassing argocd (confirmed)
helm_deploy () {

    local name="${1:?Usage: helm deploy <service|module>}" chart=""

    ensure helm

    chart="$(helm_chart_of "${name}")"

    confirm "Deploy '${name}' directly with helm (bypassing ArgoCD)?"

    run helm upgrade --install "${name}" "$(helm_charts)/${chart}" \
        -f "$(helm_values "${name}")" \
        -n "${K8S_NAMESPACE}" --create-namespace \
        --wait --timeout "${HELM_TIMEOUT}"

}
## diff one rendered chart against the cluster
helm_diff () {

    ensure helm kubectl

    helm_template "$@" | kubectl diff -f - || true

}
## remove one direct helm release (confirmed)
helm_uninstall () {

    local name="${1:?Usage: helm uninstall <service|module>}"

    ensure helm

    confirm "Uninstall release '${name}' from '${K8S_NAMESPACE}'?"

    run helm uninstall "${name}" -n "${K8S_NAMESPACE}"

}

# @module k8s

## cluster plumbing — secrets, pull access, the gitops handover, the converge

k8s_upsert () {

    "$@" --dry-run=client -o yaml | kubectl apply -f -

}
k8s_tools_auth () {

    printf 'tools-auth'

}
## print or fetch the kubeconfig for this stack
k8s_kubeconfig () {

    if [[ "${CLUSTER_SOURCE}" == "managed" ]]; then

        cloud kubeconfig
        return 0

    fi

    server_kubeconfig

}
k8s_namespace () {

    ensure kubectl

    k8s_upsert kubectl create namespace "${1:-${K8S_NAMESPACE}}" >/dev/null

}
k8s_secret () {

    local name="${1:?k8s_secret needs a name}" file="${2:?k8s_secret needs a file}" before="" checksum=""

    before="$(kubectl -n "${K8S_NAMESPACE}" get secret "${name}" -o jsonpath='{.metadata.annotations.infrax\.io/checksum}' 2>/dev/null || true)"
    checksum="$(sha256sum "${file}" | cut -d' ' -f1)"

    k8s_upsert kubectl create secret generic "${name}" --from-env-file="${file}" -n "${K8S_NAMESPACE}" >/dev/null
    kubectl -n "${K8S_NAMESPACE}" annotate secret "${name}" "infrax.io/checksum=${checksum}" --overwrite >/dev/null

    [[ -n "${before}" && "${before}" != "${checksum}" ]]

}
k8s_secret_service () {

    local service="${1:?k8s_secret_service needs a service}" env="" bind="" deploy=""

    env="$(tmp_file)"
    bind="$(tmp_file)"

    secret_service_env "${service}" "${env}"
    printf 'INFRAX_PROJECT=%s\n' "${PROJECT}" >> "${env}"
    bind_identity "${service}" > "${bind}"

    if k8s_secret "${service}-secrets" "${env}"; then

        for deploy in $(kubectl -n "${K8S_NAMESPACE}" get deploy -l "app.kubernetes.io/name=${service}" -o name 2>/dev/null); do

            run kubectl -n "${K8S_NAMESPACE}" rollout restart "${deploy}"

        done

    fi

    [[ ! -s "${bind}" ]] || k8s_secret "${service}-bind" "${bind}" || true

    rm -f "${env}" "${bind}"

}
k8s_secret_module () {

    local module="${1:?k8s_secret_module needs a module}" file="" password="" user=""

    password="$(module_root_password "${module}")"
    user="$(module_get "${module}" ROOT_USER)"
    file="$(tmp_file)"

    printf 'ROOT_PASSWORD=%s\n' "${password}" > "${file}"
    [[ -z "${user}" ]] || printf 'ROOT_USER=%s\n' "${user}" >> "${file}"

    k8s_secret "${module}-secrets" "${file}" || true

    rm -f "${file}"

}
k8s_secret_tool () {

    local module="${1:?k8s_secret_tool needs a module}" file="" password=""

    [[ "$(module_get "${module}" ROOT_LOGIN)" == "true" ]] || return 0

    password="$(secret_require "$(model_key "${module}")_PASSWORD")"
    file="$(tmp_file)"

    printf 'PASSWORD=%s\n' "${password}" > "${file}"

    k8s_secret "${module}-secrets" "${file}" || true

    rm -f "${file}"

}
k8s_secret_gate () {

    local module="" exposed="" password="" file=""

    for module in $(model_modules tool); do

        [[ -z "$(module_get "${module}" HOST)" ]] || exposed=1

    done

    [[ -n "${exposed}" ]] || return 0

    ensure htpasswd

    password="$(secret_require TOOLS_PASSWORD)"
    file="$(tmp_file)"

    htpasswd -nis admin <<< "${password}" > "${file}" || die "Cannot hash the tools gate"

    k8s_upsert kubectl create secret generic "$(k8s_tools_auth)" --from-file=.htpasswd="${file}" -n "${K8S_NAMESPACE}" >/dev/null

    rm -f "${file}"

}
k8s_secret_backup () {

    local id="" key="" file=""

    id="$(secret_get BACKUP_AWS_ACCESS_KEY_ID)"
    key="$(secret_get BACKUP_AWS_SECRET_ACCESS_KEY)"

    [[ -n "${id}" && -n "${key}" ]] || return 0

    file="$(tmp_file)"

    printf '%s\n' "AWS_ACCESS_KEY_ID=${id}" "AWS_SECRET_ACCESS_KEY=${key}" > "${file}"

    k8s_secret backup-credentials "${file}" || true

    rm -f "${file}"

}
## apply every secret the platform reads — each service's, each module's, the gates — a service restarts only when its own changed
k8s_secrets () {

    local service="" module="" token="" scratch=""

    ensure kubectl

    k8s_namespace "${K8S_NAMESPACE}"

    for module in $(model_modules "database cache"); do k8s_secret_module "${module}"; done
    for module in $(model_modules tool); do k8s_secret_tool "${module}"; done
    for service in ${SERVICES}; do k8s_secret_service "${service}"; done

    k8s_secret_gate
    k8s_secret_backup

    token="$(secret_get CLOUDFLARE_API_TOKEN)"
    scratch="$(tmp_file)"
    chmod 600 "${scratch}"

    if [[ -n "${token}" ]]; then

        k8s_namespace "${CERT_MANAGER_NAMESPACE}"

        printf '%s' "${token}" > "${scratch}"

        k8s_upsert kubectl create secret generic cloudflare-token \
            --from-file=token="${scratch}" \
            -n "${CERT_MANAGER_NAMESPACE}" >/dev/null

    fi

    k8s_watcher_secrets "${scratch}"

    rm -f "${scratch}"

    succ "Secrets applied into '${K8S_NAMESPACE}' — every service, module and gate holds only its own."

}
k8s_watcher_secrets () {

    local scratch="${1:?Missing scratch file}" password="" token=""

    [[ "${OBSERVABILITY_ENABLED}" == "true" ]] || return 0

    password="$(secret_get GRAFANA_PASSWORD)"
    token="$(secret_get ALERT_BOT_TOKEN)"

    [[ -n "${password}" || -n "${ALERT_CHAT_ID}" ]] || return 0

    k8s_namespace "${OBSERVABILITY_NAMESPACE}"

    if [[ -n "${password}" ]]; then

        printf '%s' "${password}" > "${scratch}"

        k8s_upsert kubectl create secret generic grafana-admin \
            --from-literal=username=admin \
            --from-file=password="${scratch}" \
            -n "${OBSERVABILITY_NAMESPACE}" >/dev/null

    fi

    if [[ -n "${ALERT_CHAT_ID}" ]]; then

        [[ -n "${token}" ]] || warn "ALERT_BOT_TOKEN is empty — alertmanager will start, but nothing will reach the chat"

        printf '%s' "${token}" > "${scratch}"

        k8s_upsert kubectl create secret generic alert-sink \
            --from-file=token="${scratch}" \
            -n "${OBSERVABILITY_NAMESPACE}" >/dev/null

    fi

}
k8s_module_rotate () {

    local module="${1:?k8s_module_rotate needs a module}" script="" password=""

    script="$(module_dir "${module}")/scripts/rotate.sh"

    [[ -f "${script}" && "$(module_mode "${module}")" == "cluster" ]] || return 0

    password="$(module_root_password "${module}")"

    { printf '%s\n' "${password}"; cat "${script}"; } \
        | kubectl -n "${K8S_NAMESPACE}" exec -i "statefulset/${module}" -- sh -c 'read -r NEW_PASSWORD; export NEW_PASSWORD; exec sh -s' \
        || die "Cannot move '${module}' onto its new root password — the services would restart onto one it never took"

}
## rotate every secret and move each module and service onto it
k8s_rotate () {

    local module=""

    ensure kubectl

    for module in $(model_modules "database cache"); do k8s_module_rotate "${module}"; done

    k8s_secrets

    for module in $(model_modules "database cache"); do

        [[ "$(module_mode "${module}")" != "cluster" ]] || run kubectl -n "${K8S_NAMESPACE}" rollout restart "statefulset/${module}"

    done

    run kubectl -n "${K8S_NAMESPACE}" rollout restart deployment -l "app.kubernetes.io/managed-by=Helm"

    succ "Secrets rotated — every module took its new root and every workload restarted onto its own."

}
## apply the registry pull secret
k8s_pull_secret () {

    local password="" registry="" user=""

    ensure kubectl

    registry="$(ci_registry)"

    k8s_namespace "${K8S_NAMESPACE}"

    if [[ -n "${REGISTRY_USER}" ]]; then

        password="$(secret_require GIT_TOKEN)"
        user="${REGISTRY_USER}"

    else

        password="$(cloud registry_token)" || die "Cannot fetch a registry token"
        user="$(cloud registry_user)"

    fi

    [[ -n "${password}" && "${password}" != *[[:space:]]* ]] || die "The registry token is not a token — something wrote on stdout while minting it"

    k8s_upsert kubectl create secret docker-registry pull-secret \
        --docker-server="${registry%%/*}" \
        --docker-username="${user}" \
        --docker-password="${password}" \
        -n "${K8S_NAMESPACE}" >/dev/null

    succ "Pull secret applied for ${registry%%/*}."

}
## ONE verb, all stacks: secrets → pull access → argocd owns the cluster from git
k8s_bootstrap () {

    k8s_secrets

    if [[ "${REGISTRY_PULL}" == "true" ]]; then

        k8s_pull_secret

        [[ -n "${REGISTRY_USER}" ]] || cloud registry_refresher

    fi

    argocd_install
    argocd_repo
    argocd_bootstrap

    [[ -z "$(secret_get ARGOCD_PASSWORD)" ]] || argocd_rotate

    if dns_managed; then

        dns_sync || warn "DNS was not pointed at this stack — run '${INFRAX_NAME} dns sync' when its edge has an address"

    fi

    succ "Cluster → GitOps platform — ArgoCD owns it from git."

}
k8s_first_process () {

    local first=""

    read -r first _ <<< "$(service_processes "${1:?k8s_first_process needs a service}")"

    printf '%s' "${first}"

}
## block until argocd has every service on this release and every workload is ready
k8s_verify () {

    local left="${SERVER_ROLLOUT_TRIES}" tag="" service="" pending="" app="" tick=0 workload="" live=""

    ensure kubectl

    tag="$(helm_tag)"

    step "Waiting for ArgoCD to roll ${SERVICES} onto ${tag}"

    while (( left-- )); do

        pending=""

        for service in ${SERVICES}; do

            live="$(kubectl -n "${K8S_NAMESPACE}" get "deploy/${service}-$(k8s_first_process "${service}")" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || true)"

            [[ "${live}" == *":${tag}" ]] || pending+=" ${service}"

        done

        [[ -n "${pending}" ]] || break

        if (( tick++ % ARGOCD_NUDGE_TICKS == 0 )); then

            for app in root ${pending}; do

                argocd_report "${app}"
                ! argocd_stalled "${app}" || argocd_sync "${app}"

            done

            k8s_unhealthy

        fi

        sleep "${SERVER_ROLLOUT_POLL}"

    done

    if [[ -n "${pending}" ]]; then

        argocd_report root
        k8s_status
        k8s_unhealthy

        die "ArgoCD never moved${pending} onto ${tag} — the report above carries the reason"

    fi

    for workload in $(kubectl -n "${K8S_NAMESPACE}" get deploy,statefulset -l "app.kubernetes.io/managed-by=Helm" -o name 2>/dev/null); do

        run kubectl -n "${K8S_NAMESPACE}" rollout status "${workload}" --timeout="${ROLLOUT_TIMEOUT}" && continue

        k8s_unhealthy

        die "'${workload}' never became ready on ${tag} — the report above carries the reason"

    done

    succ "Release ${tag} rolled out — every service and module this stack runs is live on it."

}
## converge the cluster onto this release — ssh boxes through the server, managed clusters directly
k8s_ensure () {

    if [[ "${CLUSTER_SOURCE}" != "managed" ]]; then

        server_ensure
        return 0

    fi

    k8s_kubeconfig

    if kubectl get namespace "${ARGOCD_NAMESPACE}" >/dev/null 2>&1; then

        k8s_secrets

        [[ "${REGISTRY_PULL}" != "true" ]] || k8s_pull_secret

        argocd_bootstrap

    else

        k8s_bootstrap

    fi

    k8s_verify

}
## pods, services and routes at a glance
k8s_status () {

    ensure kubectl

    run kubectl get pods,svc,httproute -n "${K8S_NAMESPACE}"

}
## every pod that is not ready, the reason it is not, and the last words it said
k8s_unhealthy () {

    local pod="" died=""

    ensure kubectl jq

    while IFS= read -r pod; do

        warn "${pod} is not ready"

        kubectl -n "${K8S_NAMESPACE}" get "${pod}" -o jsonpath='{range .status.containerStatuses[*]}  {.name}: restarts={.restartCount} now={.state.waiting.reason}{.state.terminated.reason}{.state.running.startedAt} last={.lastState.terminated.reason}/{.lastState.terminated.exitCode}{"\n"}{end}' >&2 2>/dev/null || true

        died="$(kubectl -n "${K8S_NAMESPACE}" get "${pod}" -o jsonpath='{.status.containerStatuses[*].lastState.terminated.reason}' 2>/dev/null)"

        [[ -n "${died}" ]] || continue

        kubectl -n "${K8S_NAMESPACE}" logs "${pod}" --all-containers --tail="${POD_LOG_LINES}" --previous >&2 2>/dev/null || true

    done < <(kubectl -n "${K8S_NAMESPACE}" get pods -o json 2>/dev/null \
        | jq -r '.items[] | select(.status.phase != "Succeeded") | select(.status.phase == "Pending" or ([.status.containerStatuses[]? | .ready] | all | not)) | "pod/" + .metadata.name')

    return 0

}
## tail the logs of one service process — web unless named
k8s_logs () {

    local service="${1:?Usage: k8s logs <service> [process] [lines]}"

    ensure kubectl

    run kubectl logs -n "${K8S_NAMESPACE}" -l "app.kubernetes.io/name=${service},app.kubernetes.io/component=${2:-web}" --tail="${3:-100}" -f

}
## reach one service or module from this machine on its own port
k8s_forward () {

    local name="${1:?Usage: k8s forward <service|module> [local-port]}" port=""

    ensure kubectl

    if [[ " ${SERVICES:-} " == *" ${name} "* ]]; then port="$(service_get "${name}" PORT)"; else port="$(module_get "${name}" PORT)"; fi

    info "localhost:${2:-${port}} → ${name}:${port} — Ctrl-C to stop"

    kubectl -n "${K8S_NAMESPACE}" port-forward "svc/${name}" "${2:-${port}}:${port}"

}
k8s_gateway_selector () {

    printf 'gateway.envoyproxy.io/owning-gateway-name=gateway'

}
k8s_gateway_service () {

    kubectl -n "${ENVOY_NAMESPACE}" get svc -l "$(k8s_gateway_selector)" -o name 2>/dev/null | head -1 || true

}
k8s_gateway_address () {

    local field=""

    case "${1:?Missing field: hostname|ip|clusterIP}" in
        hostname  ) field='{.items[0].status.loadBalancer.ingress[0].hostname}' ;;
        ip        ) field='{.items[0].status.loadBalancer.ingress[0].ip}' ;;
        clusterIP ) field='{.items[0].spec.clusterIP}' ;;
        *         ) die "Unknown gateway address field: ${1}" ;;
    esac

    kubectl -n "${ENVOY_NAMESPACE}" get svc -l "$(k8s_gateway_selector)" -o jsonpath="${field}" 2>/dev/null

}

# @module load

## load testing with k6 inside the cluster — any public service, any paths

load_target () {

    local service="${1}" host=""

    app_service "${service}" >/dev/null

    host="$(service_host "${service}")"

    [[ -n "${host}" ]] || die "'${service}' answers on no public host — load reaches a service through its edge"

    LOAD_TARGET_HOST="${host}"
    LOAD_TARGET_IP="$(k8s_gateway_address clusterIP)"

    [[ -n "${LOAD_TARGET_IP}" ]] || die "No envoy gateway service — is the gateway app synced?"

    export LOAD_TARGET_HOST LOAD_TARGET_IP

}
## fire the load at one public service — <service> [path,path…], at LOAD_RATE across LOAD_PODS
load_run () {

    local service="${1:?Usage: load run <service> [path,path…]}" file=""

    ensure kubectl envsubst

    load_target "${service}"

    LOAD_PATHS="${2:-$(service_get "${service}" HEALTH)}"
    LOAD_RATE_PER_POD=$(( LOAD_RATE / LOAD_PODS ))

    (( LOAD_RATE_PER_POD > 0 )) || die "LOAD_RATE must be at least LOAD_PODS"

    export LOAD_PATHS LOAD_RATE_PER_POD

    kubectl -n "${K8S_NAMESPACE}" delete job load --ignore-not-found >/dev/null

    k8s_upsert kubectl -n "${K8S_NAMESPACE}" create configmap load-script \
        --from-file=load.js="${TEMPLATE_DIR}/k8s/load.js" >/dev/null

    file="$(tmp_file)"

    render "${TEMPLATE_DIR}/k8s/load.yaml" "${file}"
    run kubectl apply -f "${file}"

    rm -f "${file}"

    succ "Load running on ${LOAD_TARGET_HOST} — ${LOAD_RATE} rps across ${LOAD_PODS} pod(s)."

}
## watch the run live
load_watch () {

    ensure kubectl

    kubectl -n "${K8S_NAMESPACE}" get pods -l job-name=load --no-headers
    kubectl -n "${K8S_NAMESPACE}" get hpa --no-headers
    kubectl get nodes --no-headers

}
## summarise the last run
load_report () {

    ensure kubectl

    kubectl -n "${K8S_NAMESPACE}" logs job/load --tail=-1 | sed -n '/TOTAL RESULTS/,$p'

}
## remove every load artifact
load_clean () {

    ensure kubectl

    kubectl -n "${K8S_NAMESPACE}" delete job load --ignore-not-found
    kubectl -n "${K8S_NAMESPACE}" delete configmap load-script --ignore-not-found

    succ "Load artifacts removed."

}

# @module secrets

## secret resolution diagnostics — never prints values

## the root password a module holds, if it holds one — every store does, a tool only when its module.env says ROOT_LOGIN=true
secrets_password_of () {

    local module="${1:?secrets_password_of needs a module}"

    case "$(module_kind "${module}")" in
        database | cache ) printf '%s_PASSWORD\n' "$(model_key "${module}")" ;;
        tool             ) [[ "$(module_get "${module}" ROOT_LOGIN)" != "true" ]] || printf '%s_PASSWORD\n' "$(model_key "${module}")" ;;
    esac

}
secrets_passwords () {

    local module=""

    for module in ${MODULES:-}; do

        secrets_password_of "${module}"

        [[ "$(module_kind "${module}")" != "tool" || -z "$(module_get "${module}" HOST)" ]] || printf 'TOOLS_PASSWORD\n'

    done

}
## the keys this stack cannot release without — grown by what the stack provisions, reaches, runs and exposes
secrets_required () {

    local keys="PROJECT GIT_REPO_URL"

    if [[ -n "${PROVISIONER}" ]]; then keys+=" $(cloud required_secrets)"; else keys+=" SSH_HOST"; fi

    [[ "${CLUSTER_SOURCE}" != "ssh" ]] || keys+=" SSH_PRIVATE_KEY"
    [[ "${CLUSTER_SOURCE}" != "ssh" || -z "${PROVISIONER}" ]] || keys+=" SSH_PUBLIC_KEY"
    [[ -z "${REGISTRY_USER}" ]] || keys+=" GIT_TOKEN"
    [[ "${GATEWAY_TLS}" != "true" || "${GATEWAY_DNS01}" != "true" ]] || ! model_public || keys+=" CLOUDFLARE_API_TOKEN"
    [[ -z "${DNS_PROVIDER}" ]] || keys+=" CLOUDFLARE_API_TOKEN"
    ! model_public || keys+=" BASE_DOMAIN"

    keys+=" $(secrets_passwords | sort -u | paste -sd ' ' -)"

    printf ' %s ' "${keys}"

}
## which expected secrets resolve and which are missing — a missing required one refuses the release
secrets_check () {

    local key="" value="" missing=0 broken=0 required=""

    required="$(secrets_required)"

    info "Manifest for '${STACK}' — provisioner: ${PROVISIONER:-none} · cluster: ${CLUSTER_SOURCE} · cloud: ${CLOUD}"

    while IFS= read -r key; do

        [[ -n "${key}" ]] || continue

        value="$(secret_get "${key}")"

        if [[ -n "${value}" ]]; then

            succ "${key}"

        elif [[ "${required}" == *" ${key} "* ]]; then

            err "${key} — REQUIRED, missing"
            broken=1

        else

            warn "${key} — missing"
            missing=1

        fi

    done < <({ tr ' ' '\n' <<< "${required}"; secret_keys; } | sort -u)

    (( broken == 0 )) || die "Required secrets are missing — the platform cannot run without them."

    if (( missing == 0 )); then succ "All secrets resolve."; else warn "Optional secrets are missing — their features stay dark until filled."; fi

    secrets_drift

}
## every service environment must carry what its runtime demands, and must not smuggle placeholders or bound keys
secrets_drift () {

    local service="" line="" key="" value="" demanded="" seen="" loose=0 lacking=0

    for service in ${SERVICES:-}; do

        seen=" "

        while IFS= read -r line; do

            key="${line%%=*}"
            value="${line#*=}"
            seen+="${key} "

            [[ ! "${value}" =~ \$\{([A-Za-z_][A-Za-z0-9_]*)\} ]] \
                || { err "${service}: ${key} names \${${BASH_REMATCH[1]}} — this becomes a kubernetes secret, and kubernetes expands nothing"; loose=$(( loose + 1 )); }

        done < <(secret_env_pairs "$(service_var "${service}" ENV_FILE)")

        for demanded in $(service_get "${service}" SECRETS); do

            [[ "${seen}" == *" ${demanded} "* ]] || { err "${service}: its runtime needs ${demanded} in $(service_var "${service}" ENV_FILE)"; lacking=$(( lacking + 1 )); }

        done

    done

    (( loose == 0 )) || die "Service environments ship ${loose} placeholder(s) the pods would receive as literal text"
    (( lacking == 0 )) || die "Service environments lack ${lacking} key(s) their runtimes cannot boot without"

    succ "Every service environment carries what its runtime demands."

}
## the key names one service receives — its bindings and its own environment, never values
secrets_env () {

    local service="${1:?Usage: secrets env <service>}" file="" n=0 key=""

    file="$(tmp_file)"

    secret_service_env "${service}" "${file}"

    while IFS= read -r key; do printf '  %s\n' "${key%%=*}"; n=$(( n + 1 )); done < "${file}"

    rm -f "${file}"

    succ "${n} keys ride into ${service}."

}
## mint every missing password this stack needs into a secret file — random, never printed
secrets_mint () {

    local file="${1:?Usage: secrets mint <file>}" key="" minted=0

    umask 077
    touch "${file}"
    chmod 600 "${file}"

    for key in $(secrets_passwords | sort -u) GRAFANA_PASSWORD ARGOCD_PASSWORD; do

        [[ -z "$(secret_get "${key}")" ]] || continue
        ! grep -qE "^${key}=." "${file}" || continue

        printf '%s=%s\n' "${key}" "$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')" >> "${file}"
        minted=$(( minted + 1 ))

    done

    succ "${minted} password(s) minted into ${file}."

}
## law: the two examples are disjoint, and every key they name is read by the platform
secrets_example () {

    local key="" code="" shared="" unread="" module="" passwords=""

    code="$(infrax_code | sed '/^# @test /,$d' | sed '/^infrax_manifest () {/,/^}/d' | sed '/^infrax_defaults () {/,/^}/d')"
    passwords=" $(for module in $(model_names module); do secrets_password_of "${module}"; done | paste -sd ' ' -) "
    shared="$(comm -12 <(infrax_defaults | sed -nE 's/^([A-Z][A-Z0-9_]*)=.*/\1/p' | sort) <(secret_keys | sort) | paste -sd ' ' -)"

    [[ -z "${shared}" ]] || die "A key lives in both examples — pick one home: ${shared}"

    while IFS= read -r key; do

        [[ " ${FORGE_KEYS} " != *" ${key} "* && "${passwords}" != *" ${key} "* ]] || continue

        grep -qE "\b${key}\b" <<< "${code}" || grep -rqE "\b${key}\b" "${TEMPLATE_DIR}" || unread+=" ${key}"

    done < <(infrax_keys)

    [[ -z "${unread}" ]] || die "The examples name keys nobody reads:${unread}"

    succ "Examples are disjoint and every key they name is read by the platform."

}
## the full list of keys this platform expects from outside
secrets_keys () {

    secret_keys

}

# @module self

## the bundle itself — version, location, update

## the running version and the template stamp it carries
self_version () {

    printf '%s %s\ntemplates %s\n' "${INFRAX_NAME}" "${INFRAX_VERSION}" "${INFRAX_TEMPLATE_SHA:0:12}"

}
## where the running bundle lives and where its templates unpack
self_where () {

    printf '%s\n%s\n' "${INFRAX_BIN}" "${TEMPLATE_DIR}"

}
## every key the bundle reads — names only, defaults then secrets
self_keys () {

    infrax_defaults | sed -nE 's/^([A-Z][A-Z0-9_]*)=.*/\1/p'
    secret_keys

}
## replace this bundle with a released one — latest, or a tag — verified against its SHA256SUMS
self_update () {

    local tag="${1:-latest}" base="" dir="" version=""

    ensure curl

    [[ -n "${INFRAX_REPO}" ]] || die "INFRAX_REPO is empty — nowhere to update from"

    if [[ "${tag}" == "latest" ]]; then base="${GITHUB_URL}/${INFRAX_REPO}/releases/latest/download"; else base="${GITHUB_URL}/${INFRAX_REPO}/releases/download/${tag}"; fi

    dir="$(tmp_dir)"

    curl -fsSL "${base}/${INFRAX_NAME}.sh" -o "${dir}/${INFRAX_NAME}.sh" || die "Cannot download ${tag} from ${INFRAX_REPO}"
    curl -fsSL "${base}/SHA256SUMS" -o "${dir}/SHA256SUMS" || die "Cannot download the checksums of ${tag}"

    ( cd "${dir}" && sha256sum --check --quiet SHA256SUMS ) || die "Checksum mismatch — refusing ${tag}"

    bash -n "${dir}/${INFRAX_NAME}.sh" || die "The downloaded bundle does not parse"

    version="$(sed -n 's/^INFRAX_VERSION="\(.*\)"$/\1/p' "${dir}/${INFRAX_NAME}.sh")"

    if [[ -w "${INFRAX_BIN}" ]]; then install -m 0755 "${dir}/${INFRAX_NAME}.sh" "${INFRAX_BIN}"; else as_root install -m 0755 "${dir}/${INFRAX_NAME}.sh" "${INFRAX_BIN}"; fi

    rm -rf "${dir}"

    succ "${INFRAX_NAME} ${INFRAX_VERSION} → ${version} at ${INFRAX_BIN}"

}

# @module server

## any linux over ssh — the standard road: credentials in, platform out

server_host () {

    if [[ -z "${SSH_HOST}" ]]; then

        SSH_HOST="$(tofu_output server_ip 2>/dev/null)" || true
        export SSH_HOST

    fi

    [[ -n "${SSH_HOST}" ]] || die "Missing SSH_HOST — set it in your config or apply a stack that builds a server"

    printf '%s' "${SSH_HOST}"

}
server_path () {

    local path="${SERVER_PATH}" root="" ok=0

    for root in ${SERVER_ALLOWED_ROOTS}; do

        [[ "${path}" != "${root}"/*/* ]] || ok=1

    done

    (( ok )) || die "Refusing SERVER_PATH '${path}' — use a dedicated directory two levels under one of: ${SERVER_ALLOWED_ROOTS}"

    printf '%s' "${path}"

}
server_session () {

    local tool="${1:?Missing tool}" flag="${2:?Missing port flag}" password="" options=()

    shift 2

    password="$(secret_get SSH_PASSWORD)"

    if [[ -n "${SSH_HOST_KEY}" ]]; then

        ensure_dir "${BUILD_DIR}"
        printf '%s\n' "${SSH_HOST_KEY}" > "${BUILD_DIR}/known_hosts"

        options=( -o StrictHostKeyChecking=yes -o UserKnownHostsFile="${BUILD_DIR}/known_hosts" "${flag}" "${SSH_PORT}" )

    else

        options=( -o StrictHostKeyChecking=accept-new "${flag}" "${SSH_PORT}" )

    fi

    options+=( -o ConnectTimeout="${SSH_CONNECT_TIMEOUT}" -o ServerAliveInterval="${SSH_ALIVE_INTERVAL}" -o ServerAliveCountMax="${SSH_ALIVE_COUNT}" )
    [[ -z "${SSH_KEY}" ]] || options+=( -i "${SSH_KEY}" )

    if [[ -n "${password}" ]]; then

        ensure sshpass

        SSHPASS="${password}" sshpass -e "${tool}" "${options[@]}" "$@"

    else

        "${tool}" "${options[@]}" "$@"

    fi

}
## block until the server accepts ssh — a freshly built box needs a minute to boot
server_wait () {

    local waited=0 host=""

    host="$(server_host)"

    while (( waited < SERVER_WAIT )); do

        server_run true >/dev/null 2>&1 && return 0
        sleep "${SERVER_POLL}"
        waited=$(( waited + SERVER_POLL ))

    done

    die "Server ${host} never accepted ssh within ${SERVER_WAIT}s"

}
## true when the platform already runs on the server — the converge check
server_ready () {

    server_run "sudo k3s kubectl get namespace '${ARGOCD_NAMESPACE}' >/dev/null 2>&1" 2>/dev/null

}
server_remote () {

    printf "cd '%s' && ./%s --config .env -s %s -y%s" "$(server_path)" "${INFRAX_NAME}" "${STACK}" "$(server_overrides)"

}
## push the current config and re-apply every secret — pods restart only when their own changed
server_refresh () {

    local remote=""

    remote="$(server_remote)"

    server_wait
    server_push
    server_run "${remote} k8s secrets && ${remote} argocd bootstrap && ${remote} k8s verify"

    succ "Server config refreshed — secrets reconciled, the app-of-apps re-applied, this release rolled out."

}
## converge the server: bootstrap it when the platform is not there yet, otherwise refresh its config
server_ensure () {

    if server_ready; then

        server_refresh
        return 0

    fi

    server_deploy

}
## run a command on the server over ssh
server_run () {

    server_session ssh -p "${SSH_USER}@$(server_host)" "$@"

}
## copy a local file onto the server
server_copy () {

    local source="${1:?Usage: server copy <source> <destination>}" destination="${2:?Missing destination}"

    server_session scp -P -r "${source}" "${SSH_USER}@$(server_host):${destination}"

}
server_installer () {

    local pin="INSTALL_K3S_VERSION=${K3S_VERSION}"

    [[ -n "${K3S_VERSION}" ]] || pin="INSTALL_K3S_CHANNEL=v${K8S_VERSION:?Missing K8S_VERSION — the channel the installer pins to}"

    printf 'printf "fs.inotify.max_user_instances = %s\\nfs.inotify.max_user_watches = %s\\n" | sudo tee %s >/dev/null && sudo sysctl -q --system; command -v curl >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y curl; } || { sudo apt-get update -qq && sudo apt-get install -y curl; }; curl -sfL %s | %q sh -s - %s%s' \
        "${INOTIFY_INSTANCES}" "${INOTIFY_WATCHES}" "${INOTIFY_CONF}" "${K3S_INSTALL_URL}" "${pin}" "${K3S_INSTALL_ARGS}" "${1:+ --tls-san $1}"

}
## install k3s on the server (confirmed)
server_setup () {

    local host=""

    host="$(server_host)"

    confirm "Install k3s on '${SSH_USER}@${host}'?"

    server_run "$(server_installer "${host}")"

    succ "k3s ready on ${host}."

}
## sync this bundle, the resolved config and the stack values to the server — the box reads the image tag from the same files CI bumped
server_push () {

    local config="" path="" values="" file=""

    path="$(server_path)"
    config="$(tmp_file)"
    values="${DEPLOY_PATH}/helm/values"

    [[ -f "$(helm_values "${SERVICES%% *}")" ]] || die "Missing stack values under ${values} — a release seeds them"

    config_render "${config}"

    server_run "rm -rf '${path:?}' 2>/dev/null || sudo rm -rf '${path:?}'; mkdir -p '${path}' 2>/dev/null || { sudo mkdir -p '${path}' && sudo chown -R \$(id -un): '${path}'; }; mkdir -p '${path}/${values}'"

    server_copy "${INFRAX_BIN}" "${path}/${INFRAX_NAME}"
    server_copy "${config}" "${path}/.env"

    for file in "$(helm_values_dir)"/*."${STACK}".yaml; do

        server_copy "${file}" "${path}/${values}/${file##*/}"

    done

    server_run "chmod 700 '${path}/${INFRAX_NAME}' && chmod 600 '${path}/.env'"

    rm -f "${config}"

    succ "Bundle + config synced to ${path}."

}
server_overrides () {

    local key="" out="" keys=()

    read -ra keys <<< "${INFRAX_FLAGS:-}"

    for key in "${keys[@]}"; do

        secret_name "${key}" || out+=" -e ${key}='${!key}'"

    done

    printf '%s' "${out}"

}
## the ONE verb: push everything and bootstrap the whole platform remotely
server_deploy () {

    local host="" remote=""

    host="$(server_host)"
    remote="$(server_remote)"

    confirm "Deploy the '${STACK}' stack on '${SSH_USER}@${host}'?"

    server_wait
    server_push

    server_run "${remote} -e SSH_HOST='${host}' server bootstrap"

    succ "Stack '${STACK}' live on ${host} — grab access with: ${INFRAX_NAME} k8s kubeconfig"

}
server_node () {

    local left="${NODE_REGISTER_TRIES}"

    while (( left-- )); do

        [[ -z "$(kubectl get nodes -o name 2>/dev/null)" ]] || return 0

        sleep "${NODE_REGISTER_POLL}"

    done

    die "k3s never registered a node — inspect: journalctl -u k3s"

}
## run the on-box side: k3s, secrets, gitops handover, verify
server_bootstrap () {

    ensure curl

    bash -c "$(server_installer "${SSH_HOST}")"

    ensure_dir "$(dirname "${KUBECONFIG}")"

    as_root cat ${K3S_KUBECONFIG} > "${KUBECONFIG}"
    chmod 600 "${KUBECONFIG}"

    server_node

    run kubectl wait --for=condition=Ready node --all --timeout="${NODE_READY_TIMEOUT}"

    k8s_bootstrap
    k8s_verify

}
## fetch the k3s kubeconfig over the wire
server_kubeconfig () {

    local host=""

    host="$(server_host)"

    ensure_dir "$(dirname "${KUBECONFIG}")"

    server_run "sudo cat ${K3S_KUBECONFIG}" \
        | sed "s|https://127.0.0.1:${K3S_API_PORT}|https://${host}:${K3S_API_PORT}|" > "${KUBECONFIG}"

    chmod 600 "${KUBECONFIG}"

    succ "Kubeconfig written: ${KUBECONFIG}"

}
## quick node + pod glance over ssh
server_status () {

    server_run "systemctl is-active k3s && sudo k3s kubectl get nodes"

}

# @module tofu

## cloud provisioning through opentofu — stacks live in template/tofu/<cloud>/stacks

tofu_dir () {

    printf '%s' "${TEMPLATE_DIR}/tofu/${CLOUD}/stacks/${PROVISIONER}"

}
tofu_stack () {

    [[ -n "${PROVISIONER}" ]] || die "Stack '${STACK}' provisions nothing — tofu runs where PROVISIONER names a stack"

}
tofu_vars () {

    local file="${BUILD_DIR}/tofu/${CLOUD}-${PROVISIONER}.tfvars"

    tofu_stack
    ensure_dir "$(dirname "${file}")"

    cloud tofu_vars > "${file}"

    printf '%s' "${file}"

}
tofu_hcl_list () {

    local item="" out=""

    for item in ${1//,/ }; do

        out+="\"${item}\","

    done

    printf '[%s]' "${out%,}"

}
tofu_managed () {

    local module=""

    for module in $(model_modules database); do

        [[ "$(module_mode "${module}")" != "managed" ]] || printf '%s\n' "${module}"

    done

}
tofu_secrets () {

    local module="" password="" passwords="{}"

    ensure jq

    for module in $(tofu_managed); do

        password="$(module_root_password "${module}")"
        passwords="$(jq -c --arg module "${module}" --arg password "${password}" '. + {($module): $password}' <<< "${passwords}")"

    done

    export TF_VAR_database_passwords="${passwords}"

    cloud auth

}
tofu_cache () {

    export TF_PLUGIN_CACHE_DIR="${BUILD_DIR}/tofu/plugins"

    ensure_dir "${TF_PLUGIN_CACHE_DIR}"

}
## prepare the provider (state and backup buckets, stale lock) and initialise the stack backend
tofu_init () {

    local flags=()

    ensure tofu

    tofu_stack
    cloud auth
    cloud tofu_prereqs

    tofu_cache

    mapfile -t flags < <(cloud backend_flags)

    run tofu -chdir="$(tofu_dir)" init -input=false -reconfigure "${flags[@]}"

}
## converge the cloud: nothing to provision on a bring-your-own stack, otherwise init → plan → guard → apply (idempotent)
tofu_ensure () {

    local plan=""

    [[ -n "${PROVISIONER}" ]] || { info "Stack '${STACK}' provisions nothing — cloud converge skipped."; return 0; }

    tofu_init

    plan="${BUILD_DIR}/tofu/${CLOUD}-${PROVISIONER}.plan"

    tofu_plan -out="${plan}"
    tofu_guard "${plan}"

    lock "tofu-${STACK}"

    run tofu -chdir="$(tofu_dir)" apply -input=false -lock-timeout="${TOFU_LOCK_TIMEOUT}" "${plan}"

    succ "Stack '${STACK}' converged."

}
## refuse a converge that destroys what holds state — replacing a box or a database is a decision, never a side effect
tofu_guard () {

    local plan="${1:?tofu_guard needs a plan file}" doomed=""

    ensure jq

    doomed="$(tofu -chdir="$(tofu_dir)" show -json "${plan}" \
        | jq -r --arg types " ${TOFU_GUARDED} " '.resource_changes[]? | select(.change.actions | index("delete")) | .type as $type | select($types | contains(" " + $type + " ")) | .address')"

    [[ -n "${doomed}" ]] || { succ "Converge guard clear — nothing that holds state is touched."; return 0; }

    [[ "${TOFU_ALLOW_DESTROY}" != "true" ]] || { warn "Converge destroys what holds state — allowed by TOFU_ALLOW_DESTROY:"$'\n'"${doomed}"; return 0; }

    die "Converge refused — it would destroy what holds state:"$'\n'"${doomed}"$'\n'"Mean it: ${INFRAX_NAME} -e TOFU_ALLOW_DESTROY=true tofu ensure"

}
## free the state lock a dead run left behind
tofu_unlock () {

    tofu_stack
    cloud auth
    cloud unlock

}
## show what an apply would change
tofu_plan () {

    ensure tofu

    tofu_stack
    tofu_secrets

    run tofu -chdir="$(tofu_dir)" plan -input=false -lock-timeout="${TOFU_LOCK_TIMEOUT}" -var-file="$(tofu_vars)" "$@"

}
## build or update the cloud stack (confirmed)
tofu_apply () {

    ensure tofu

    tofu_stack

    confirm "Apply '${STACK}' stack on ${CLOUD^^}?"

    tofu_secrets
    lock "tofu-${STACK}"

    run tofu -chdir="$(tofu_dir)" apply -input=false -auto-approve -lock-timeout="${TOFU_LOCK_TIMEOUT}" -var-file="$(tofu_vars)" "$@"

    succ "Stack '${STACK}' applied."

}
tofu_unguard () {

    local module=""

    for module in $(tofu_managed); do

        cloud db_unguard "${module}"

    done

}
tofu_owns_cluster () {

    local server="" expected=""

    server="$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}' 2>/dev/null)" || return 1

    if [[ "${CLUSTER_SOURCE}" == "managed" ]]; then

        expected="$(tofu_output cluster_endpoint)" || return 1

    else

        expected="https://$(tofu_output server_ip):${K3S_API_PORT}" || return 1

    fi

    [[ "${server%/}" == "${expected%/}" ]]

}
tofu_release () {

    local name=""

    [[ -n "${EDGE_TYPE}" ]] || return 0

    has kubectl || return 0

    name="$(k8s_gateway_service)"

    [[ -n "${name}" ]] || return 0

    tofu_owns_cluster || { warn "The current kubeconfig is not the '${STACK}' cluster — leaving its resources alone"; return 0; }

    step "Releasing what kubernetes owns in the cloud before the cloud under it goes"

    run kubectl -n "${ENVOY_NAMESPACE}" delete "${name}" --wait=true --timeout="${PVC_TIMEOUT}" || true

    for name in "${K8S_NAMESPACE}" "${OBSERVABILITY_NAMESPACE}"; do

        run kubectl -n "${name}" delete pvc --all --wait=true --timeout="${PVC_TIMEOUT}" || true

    done

}
## tear the stack down — confirmed twice, releases k8s-owned cloud resources first
tofu_destroy () {

    ensure tofu

    tofu_stack

    confirm "DESTROY the '${STACK}' stack? This is irreversible"
    [[ "$(input 'Type the stack name to confirm' "${INFRAX_CONFIRM:-}")" == "${STACK}" ]] \
        || die "Confirmation mismatch — name the stack you mean, on a terminal or with -e INFRAX_CONFIRM=${STACK}"

    tofu_secrets
    tofu_release
    tofu_unguard
    lock "tofu-${STACK}"

    run tofu -chdir="$(tofu_dir)" destroy -input=false -auto-approve -lock-timeout="${TOFU_LOCK_TIMEOUT}" -var-file="$(tofu_vars)" "$@"

    succ "Stack '${STACK}' destroyed — the backup and state buckets outlive it on purpose."

}
tofu_ready () {

    ensure tofu

    [[ -d "$(tofu_dir)/.terraform" ]] || tofu_init >&2 || return 1

}
## read one stack output, e.g. server_ip or registry — initialises the backend first when this checkout never did
tofu_output () {

    local value=""

    tofu_ready || return 1

    value="$(tofu -chdir="$(tofu_dir)" output -no-color -raw "${1:?Missing output name}" 2>/dev/null)" || return 1

    [[ -n "${value}" && "${value}" != *[![:print:]]* ]] || return 1

    printf '%s' "${value}"

}
tofu_output_json () {

    tofu_ready || return 1

    tofu -chdir="$(tofu_dir)" output -no-color -json "${1:?Missing output name}" 2>/dev/null

}
## format every tofu file in the tree
tofu_fmt () {

    ensure tofu

    run tofu fmt "$@" -recursive "${TEMPLATE_DIR}/tofu"

}
## init -backend=false + validate every stack of every cloud
tofu_validate () {

    local dir="" data=""

    ensure tofu

    tofu_cache

    for dir in "${TEMPLATE_DIR}"/tofu/*/stacks/*/; do

        data="${BUILD_DIR}/tofu/validate/$(basename "$(dirname "$(dirname "${dir}")")")-$(basename "${dir}")"

        TF_DATA_DIR="${data}" run tofu -chdir="${dir}" init -backend=false -input=false >/dev/null
        TF_DATA_DIR="${data}" run tofu -chdir="${dir}" validate

    done

    succ "Tofu templates valid."

}

# @module tool

## self-provisioning — every verb installs its own missing tools

tool_arch () {

    local arch=""

    arch="$(dpkg --print-architecture 2>/dev/null || uname -m)"

    case "${arch}" in
        x86_64  ) arch=amd64 ;;
        aarch64 ) arch=arm64 ;;
    esac

    printf '%s' "${arch}"

}
tool_curl () {

    pkg_install curl

}
tool_envsubst () {

    pkg_install gettext-base

}
tool_flock () {

    pkg_install util-linux

}
tool_htpasswd () {

    pkg_install apache2-utils

}
tool_gpg () {

    pkg_install gnupg

}
tool_bin () {

    local file="${1:?Missing binary}" name="${2:?Missing name}" dir=""

    if [[ "$(id -u)" == "0" ]] || sudo -n true 2>/dev/null; then

        as_root install -o root -g root -m 0755 "${file}" "${TOOL_BIN_DIR}/${name}"

    else

        dir="$(path_expand "${INFRAX_INSTALL_DIR}")"

        ensure_dir "${dir}"
        install -m 0755 "${file}" "${dir}/${name}"

    fi

}
## fetch one release archive to disk, retried, then unpack the named binary — a reset connection never feeds tar half an archive
tool_fetch () {

    local url="${1:?Missing url}" dir="${2:?Missing dir}" name="${3:?Missing binary}"

    curl -fsSL --retry "${TOOL_RETRIES}" --retry-all-errors --retry-delay 2 -o "${dir}/archive.tar.gz" "${url}" \
        && tar xzf "${dir}/archive.tar.gz" -C "${dir}" "${name}"

}
tool_kubeconform () {

    local dir=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"

    tool_fetch "${KUBECONFORM_RELEASES}/${KUBECONFORM_VERSION}/kubeconform-linux-$(tool_arch).tar.gz" "${dir}" kubeconform \
        || die "Cannot download kubeconform ${KUBECONFORM_VERSION}"

    tool_bin "${dir}/kubeconform" kubeconform

    rm -rf "${dir}"

}
tool_actionlint () {

    local dir=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"

    tool_fetch "${ACTIONLINT_RELEASES}/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_linux_$(tool_arch).tar.gz" "${dir}" actionlint \
        || die "Cannot download actionlint ${ACTIONLINT_VERSION}"

    tool_bin "${dir}/actionlint" actionlint

    rm -rf "${dir}"

}
tool_gitleaks () {

    local dir="" arch=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"
    arch="$(tool_arch)"

    [[ "${arch}" != "amd64" ]] || arch=x64

    tool_fetch "${GITLEAKS_RELEASES}/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_${arch}.tar.gz" "${dir}" gitleaks \
        || die "Cannot download gitleaks ${GITLEAKS_VERSION}"

    tool_bin "${dir}/gitleaks" gitleaks

    rm -rf "${dir}"

}
tool_trivy () {

    local dir="" arch=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"
    arch="$(tool_arch)"

    [[ "${arch}" != "amd64" ]] || arch=64bit
    [[ "${arch}" != "arm64" ]] || arch=ARM64

    tool_fetch "${TRIVY_RELEASES}/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-${arch}.tar.gz" "${dir}" trivy \
        || die "Cannot download trivy ${TRIVY_VERSION}"

    tool_bin "${dir}/trivy" trivy

    rm -rf "${dir}"

}
tool_certs () {

    [[ -f "${CA_BUNDLE}" ]] || pkg_install ca-certificates

}
tool_docker () {

    local os="" codename="" conflict=""

    ensure curl
    tool_certs

    os="$(. /etc/os-release && printf '%s' "${ID}")"
    codename="$(. /etc/os-release && printf '%s' "${VERSION_CODENAME:-${UBUNTU_CODENAME:-}}")"

    case "${os}" in
        ubuntu | debian | raspbian ) ;;
        * ) os="$(. /etc/os-release && printf '%s' "${ID_LIKE%% *}")" ;;
    esac

    [[ -n "${os}" && -n "${codename}" ]] || die "Cannot resolve the distro for the docker repo"

    for conflict in docker.io docker-doc docker-compose podman-docker containerd runc; do

        as_root apt-get remove -y "${conflict}" >/dev/null 2>&1 || true

    done

    as_root install -m 0755 -d ${APT_KEYRINGS}

    curl -fsSL "${DOCKER_APT_URL}/${os}/gpg" | as_root tee ${APT_KEYRINGS}/docker.asc >/dev/null || die "Cannot fetch the docker signing key"
    as_root chmod a+r ${APT_KEYRINGS}/docker.asc

    printf 'deb [arch=%s signed-by=${APT_KEYRINGS}/docker.asc] %s/%s %s stable\n' \
        "$(tool_arch)" "${DOCKER_APT_URL}" "${os}" "${codename}" | as_root tee ${APT_SOURCES}/docker.list >/dev/null

    pkg_install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    ! has systemctl || as_root systemctl enable --now docker

}
tool_gcloud () {

    ensure curl gpg
    tool_certs

    as_root install -m 0755 -d ${APT_KEYRINGS}

    curl -fsSL "${GCLOUD_KEY_URL}" | as_root gpg --dearmor --yes -o ${APT_KEYRINGS}/cloud.google.gpg || die "Cannot fetch the gcloud signing key"

    printf 'deb [signed-by=${APT_KEYRINGS}/cloud.google.gpg] %s cloud-sdk main\n' "${GCLOUD_APT_URL}" \
        | as_root tee ${APT_SOURCES}/google-cloud-sdk.list >/dev/null

    pkg_install google-cloud-cli google-cloud-cli-gke-gcloud-auth-plugin

}
tool_kubectl () {

    local version="" arch="" dir=""

    ensure curl
    tool_certs

    version="$(curl -fsSL "${K8S_RELEASE_URL}/stable${K8S_VERSION:+-${K8S_VERSION}}.txt")" || die "Cannot resolve kubectl version"
    arch="$(tool_arch)"
    dir="$(tmp_dir)"

    curl -fsSLo "${dir}/kubectl" "${K8S_RELEASE_URL}/${version}/bin/linux/${arch}/kubectl"
    curl -fsSLo "${dir}/kubectl.sha256" "${K8S_RELEASE_URL}/${version}/bin/linux/${arch}/kubectl.sha256"

    ( cd "${dir}" && printf '%s  kubectl\n' "$(cat kubectl.sha256)" | sha256sum --check --quiet ) || die "kubectl checksum mismatch"

    tool_bin "${dir}/kubectl" kubectl

    rm -rf "${dir}"

}
tool_helm () {

    ensure curl openssl tar
    tool_certs

    curl -fsSL "${HELM_INSTALLER_URL}" | as_root env DESIRED_VERSION="${HELM_VERSION}" bash

}
tool_tofu () {

    ensure curl gpg
    tool_certs

    curl -fsSL "${TOFU_INSTALLER_URL}" | as_root sh -s -- --install-method deb --opentofu-version "${TOFU_VERSION}"

}
tool_aws () {

    local dir="" arch=""

    ensure curl unzip
    tool_certs

    dir="$(tmp_dir)"
    arch="$(tool_arch)"

    if [[ "${arch}" == "arm64" ]]; then arch=aarch64; else arch=x86_64; fi

    curl -fsSLo "${dir}/aws.zip" "${AWSCLI_URL}/awscli-exe-linux-${arch}.zip"
    unzip -q "${dir}/aws.zip" -d "${dir}"

    as_root "${dir}/aws/install" --update

    rm -rf "${dir}"

}
## install any listed tool if missing (docker, kubectl, helm, tofu, aws, gcloud, trivy, ...)
tool_ensure () {

    ensure "$@"

}

# @entry main
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; exit $?; fi

#__INFRAX_PAYLOAD__
#H4sIAAAAAAAAA+w9aXPjtpL5rF+BYjk1xw51+UqparZKI2tsJ/JRkpy8bCarR1OQxJgiFZKyx3Hm
#1f6I/YX7S7YbAEmAhC5b1vglQuWwiAbQABp9gs2IjieuFdHSN89XylAO9/fZ/6Fk/6/5+3C/Wv6G
#7D8jTkmZhpEVELKJoV5iieL9t4Khb/efhQxW3v8KgB9u938TJbv/1mQSrpsIVt//ymG1ut3/TRTt
#/jdGVhAV762xu5YxcFMP9vZm7n+1XMns/+7BHvD/8lpGX1D+5vtvTZwfaRA6vlcjt9WCZ41pjSAR
#FPo0tANnErGq+mRi+gMTK8j//c//EnpLg3uClDPwgzE2cB3bQljSp7ZrBbRPRjSgheh+wjuM6wu3
#8XCVYrlYLnztBfibF+35jx+uSRKszv93D7f632bKgv23ppEf2pZLgyeIgwX8v1reO8zs/8HhfmXL
#/zdRHh5M4gxI8UfLndKwmO5307OuXeDiX74UZBmBZDIJ/N+Kjl+6rVjuZGRVCjeO12cyImHyYxpZ
#fSuyagVCuEyxXVhpGpjpCFBleZ4fsRYhQhLCqbAojxLee7Z5Z91CH4ZZNQrhhNoIjPXUjmrk4SFB
#XzxDpAkJ/WlgU95vQCf+VbtVI6MomoS1Uulmek0DjwKNF4dONJpe41AKboTYqAbNwJwQIJshjdr0
#1uErI6GRQop14wgREInumCNEyC2DvbhmkxDPCHHG1pCmP3GY4Yy+TxG0aw3jztn6Qe2RE9o+yme5
#GzGJc7YXUnfSc6Wfu7BNh9l5BeyRDBdcW7Y8TEiDW8emddv2p14k18ylg7TkKCIt9AZmP7b+8D3A
#rmj741Lgu9S0glmL34bqeqDgSz9HgVUPhkrn15ZreTY1Q2fsgOpien6fmsPAnwKlkCiYUnmCN86E
#AYTmHdCN6fowlBlGfoD7RgaWGyI41EeOx+bBR8KFoYGW/vp0YE3dqBje2oV4ncKJBaRLEMoM72HB
#xkjQcBIufThjYmdxpmNg0/14MpNg6lEF5ZC6gxNqudJD7OVioqywSToMvY7Tp3iK798zaOQN1GMs
#4GuzqW15prJA/ts0iMyx5QFxP14DWCD/K3v7exn5f1gBdXEr/zdQMvJ/CLt+Z9133XB9gl8ioa8i
#8n+fWvfY6280gr22b0pMroeKiFdxnCvcEfaMg64s3e2gr0geypWsjJSxfW/gDGU4eSOgNgLBhyo5
#Bywqh1TenrQDvlGNpGmDtZwGfNOyCB1zKqhfniaYrUmg6dfxPAYQu/h8cq4RUOgoGe+91MXfUwgu
#4P/Uu/Xvn+oJXMT/y7tZ/9/+4e7hlv9voqyFxTMqMYXseAyPrzyVx/d9+4YzP4YLNPh8LzN4gZuJ
#LFrL4G+l4VgXCm9fP/djY7xkvve1CXNbNlIW8P+B4wKxPi//L1crWf1//7C8u+X/myio3uwEvh+R
#2ntSRD6ETwLLG1KyM7Gi0Tuy02N1HxkpHLv+NXk9CRwvGhCDkUfp27D0ltGIkbA3pmi/we5M04Qu
#+RhxHzTifcfD/YX1q5deFpx/ITefxgEW+f8re9nzf1DdO9ie/02Uteh/j9f8yk9V/BTvNHsWW+Nz
#TPhr4G/2KAZETqRU9+nE9e8vOYMqocpYSme4jJk/8sOIqX1Kt8lT8ieJ/O9D1ZMehm5zbDmu0iR+
#CC1+n/qR4qKP3LAZuw+kJqoHJwbue2G5ooM7wgrFQ94f0i4L2svaqniowwPr6tK2Z9tJddqJB/5U
#0kwV94gp9+WpynJcMg4s/xpVc+vacZ3ovkjTINaMXlX4OWMIGZVgDcvXcsZOdEmDM8eDKai0mKt+
#LkNC7OPWlNiWx5QF8h94feDYocnJ9JFqwCL/T6Wc8//v71e38n8TJcM+xX7zY7zuKwAqMb2Q8L8Z
#OkP5DoCKZEl2IuXwn6tkKEv5HN6kbXB4W55cFvF/vz99sgdokf1XPczbfwfb+18bKXP9Pzf0/h3Z
#QY6LtX0HWKuBLN0gr10nTH6AFfeGGJHvu2FSg7+gpmq8ifvcYVwUOwJRQT+LfstJNfL4bG1FRei1
#qGO+JM5mGZJgVwg+SXD0xO+0FqmFLJ3z7RXFFXq92KQko0knveTp6ESYGMxUjF6lUcby1YolpYFq
#AEsmsAKlsYMRhO9j0lY2h1HSutQK6Xlm6Xhh1jLzAapW3g43o0tLIJBCYs/FbAvmd8QKZFjPvmwB
#HdSEC2Cttp0yqPccll0AyklyP9BFQzU/MI7URiWGSq6Ea1hffzBI968vLhHUyH6YPBxYduTDzKvJ
#k7H1+SiBrIxXNC8lZWOrd6y1LJD/qnvkkVrAfPlfLVd2d7P2395W/m+mLOs+W5so1Q4kbKU2Fx6P
#krZrNA4BEhAa0Wlo2v54PPUQxdRCRDlk5u+QMXNMaspE0SIjUV0G1uSZLpUheun9L3HxStssvsOc
#tuvYI4p2wLLwl3j9YknYZmT3lwBNF1YGTp92xM6nBUQc9aL5C57AqP7e5B77mQ977wcdoEsUaOeO
#exXS8AS2hHeXxZLh5Pcf0yyA9V2pgbhznp840InvTse04VrOuCtYeRYE2msaYrFsUDnDM7ziXiO/
#tKnV/ylwInrh2fRXDbhAAwYLw9zbBXJldonjXVKU3Hz179BPNKM2GX0xa+k4f6gvOAA1R+P8KZjL
#D+GkR6eZaILcUX4vQmoDjeFCMjgzdLybXzPDZSILuvufIkqSXYWA2tRhKib2m6lkLzD0ru/jsZEF
#v0sVzexecvA7CzXB3XKorXW8CFcDFMn9cQ6VCehtEkSlOsocR45rbitNIRwMb+q6xoxKzfwesVe8
#RHDKhoE17vF11tKWSa79qBf5N9Tr4SWHGinRyC7Jm10Se1tKd7bEGmhJFdHpOf05hDobYSwgf3vT
#wE2FFDwoxjMp+sFQ22piBSHtjeEs18hJ96ylBQKCCNkZegW4/RP+jdU/sOLjAWJ7RcAazPr6J/z7
#SrsrGZKGLgawaMqN5v7Y8dSVp58dNKCGHbautbiVyUAVyCms2w8UKBv/QAJRGTAwmzs/6DOI+IcE
#IfotOp6TPazMXstSNphE6tLP3EKM8GY3EFHMkditQ+/gcc+2vB7t45HL8vfQ6VPbyiDTt8LRtW9l
#5D1bO63Mj6dlBfboPLUw6y2ZEOaeItcfZhi31Qd8QWJa7hHodh0d844Pbcu/cTK48NfB3XwFlzo1
#kt7clJYwXvx5a4+YpvqjiUMUl4rzog0evwZXZK9z1XYr5XIGh99C3zsSyqxawLJtOR4KS2hVzixs
#jrdPULuDoTw7w81n7+CjJWwIMg9Y9bGzVufEUpHzFxV/XpsrUJnyI0yUJ19z3tBtl+w8l73zMoc+
#GGvU3B55BG3xYk0m59q2WmjVwFzREuVFXLSY01ZAaBrpMdVf3YhPg73AdhEQmStBS9wF0r14s+Sb
#OfHZBR6tb6q71s4L8uc5s0kFzV+cUy0lbtcavFhCXH5Vd0usjy30sCRqw9IOFWyxsj+FM8Qx9aIz
#pjh3QCd16QegyeBeIucbRXsEshn1Zvgu0KIbj32vobPraLJ9vdhrLr+4F9ojOrZ0LWdYLyYZBP4Y
#Nqharu6ZZfinkjWquEqBNB32r3N1PluOngBhN7zjOwaZThhqNXJb2c3VsUCdzrCaBHTgfK5xgJ4O
#gAaOD0tY3ZPtx9jOVxpwZVKLIQtphD2tJR37fHrxUAsOidZFBDs64ds1o/PZ+lwfjl1Ee8K1MWeh
#Q4nw5GEEzYQqpTxRs1xRq5y7Zllniz2aejdhwwKCWcLVF9AQePrS4HgSG1Z2jWYAg9CIlgCLZf1i
#SIyHgZKv356yNCdrIcwdutlmA/3F5WJc+bwaPFCnGY6cyeRR98+efFt9ZZFnuSCKVpN5rMnqQYQk
#NCBTIOewfYuC9ApplCrfOIYMyBntmTXJySjkhzXyZ4bT9+McNcWUaokx8fuhQR5yUgHzvJD3rD4r
#y74UZvYcUNe6pu7sbvmShuS9Fp0iNisKmOwo3F+v6TPe+B4bG/v+xej1kBB7ade95KwZOpc6H5P3
#QHDeKXgOOu8tfBJiMGeG3HJ4afbjWTBCMrIcjwYr4Ja02QiGDKAHNqlc4fgr4AttF2Oao3bm5uJI
#LnWSYpInRKF6cVQ4yfvTaDKNck0HfnBnBf1e5OM6sIGZxEqETezhz05XjzRrSwzRWIcriNWJ73iR
#dmOmgYurtmmvYAl7QN87iJ3SZBqOltmzv7zs3l7P+bctC+7/iDj40y4AL7z/W87e/znYq+5t7/9s
#osy7/5tYg4IIXsa12lle9H+na7RiRUWzF36DFgsSBeY7VGEdTQbKiRUA5lEm6BmHBFkLUKrVcDVD
#SUxWEyPIBNK2N3r/Wjd6vzYL/FsXrfznB2BtHwBY9P7nQbWakf97lfI2/8NGSiJBBf8qJLzVMAqc
#O9bgqDtegQkG9jhm++yHxOeAdgr5gGecOiEVRTURYilI/AiYTaEQKxo18suvBaYu4B/sxSL2V0FK
#rAA/05QJgEca6xRMUU5wEHtt0+QG0CKfuOBLQY1fZjKbxS9b6gOoSg5JXXqAXbweorrcefZgVBsK
#BTnrGMMvn2iSPda9V8oqclmnM09P5W0r6N70jZcplwU8rigoaaShm0AkiVYGEnmX+TiKoYpCIRuO
#kAhozO/NOh6qB/xCgYEGdhJ6T9NwJPFxJooLynXfQ7ztJd37BKlVZpdgeAxajCu5BphfOCzkrwmI
#3wI611c7HbNy8B3Gq/glPoG2fJ1bPJICkuKJ7K5ljzZ7/rP8fwRaRTRa37dfsCyy/w4O9jP8f7dS
#3b7/sZESG2XxPeyiDQvij50/OFMsCnqQbLGeZNfFjv0R+kYfRKyB2RDRFB8Zl4E/hK4xkmnEteIO
#KVbzZ84Ag85xq3+9J57jkmiU3KRV6gVGGjB16FwL8SsB1vWa4KbrPYP8zMZJA9BvC+pf8f+BWU0D
#D/pbvPKZ5L69Bvx2Brj+dOHqn7Au7nUr74ThFJPeEyckFsrhUeB7/pR/3QejlcSJ2E0CRa7N2S8L
#lHlpSWzf4/dEdRs68APivCMJDHHgn4nlBOFrbRdvSN+X9y2pKWKAiryH+eB7CvfG3A3jMO8NUixK
#PWSo4rn3rM2j/l9r61aYhGWPaW4mF0Ef7d/HI4+9Eh97QfGINMz2A1SHCOX+64WExVpBD8SYejee
#f+cZb9Yys8YIJDH1hk86VWx2dtzTs81wjfw/K/+FPbBWBWCB/N+t7OW+/7Rb3uZ/3khZ3pd7ySlD
#48rdebhsX3zfbHS/qOr8zkO9fXzROOqd18+anct6o5kmQFC+Lpd2kHxSLnHbtsEeTVy3Ow/Hp91e
#u3l50QMbNXYHzkz+rK8qvRWV8z4MYD4yVZCu3ewvDJmPfefUXPoqieTDTJZxwR5x+beCrzPT4w/f
#ddbZ3XG92/yp/vM6u2ye/3ix1g4bzXa3d1Y/rx832+vs9+JDp9n+sf7htHXaXSPCauqolXoSHoC2
#ELE/jZyIYtKVmLbYm4K1WLWPvzyR+ElUKOA+9DPY0CETzzffhUC/SrsGE+DxYEd04HhO8smKpBv8
#ChV+92nkB0LW6/oy3hqZ0ftj0KUAGr0YIJ1XaDlxFrWpX552pChP0jSjdywYR6OpzG8RJ+yFrbvz
#AwAaLjWhuFnKJRc2SZ01oKkH1Gef5Mo1+drybVvml6z+x8JFa/X+LNT/9g53s/m/qge7W///Rspa
#YvlINMurfknIQdEbtfdldfpeNqTLYT606+eNE/kVt52Ho+ZlC8T8Zb178kWOb3HDbeGVWD2evMzF
#EEscOsljx6Qtj6XsPHS69cYP6XMpsrLzcHoG2kSvWz/+kl4yW6xn6d45m6NDxa+7XGrWLEVXjtMk
#W9v5+bwBM++2T5sd+cW1OIYDgJeXnR4qMKcNGYRHdkT1Ub1bl95g47EeUde9uGhJ7aTojwA4ueh0
#2ZR0ebRhCTudVq95Vj9tSUsoB4rShenKA6mhoxTo6LxTruhSZcNQzSPcrJ8vm9JQuQiTAKufn190
#693Ti3Np0GzoaaaWOusNvkVaqD5p9c5DG2bXa52eAZ1eQruz0/OrblOmVTlitfPw40Xr6qzZa7Tq
#nSz2CSeJcY8X7sdmuwOz1c5AaqTgn2ujD3ztPJwhCTY4oenaaeJiQD5X3YtOo96a3yANmSkt0pOp
#Ry6JmuWQa57XP7SaR7qxpEbSULkGSgQOlqx11emK3ZbZkwjLIcDF1REc02OcoqEZN43WKQO3L1pA
#qG25TS6Ul25+grpqsOSwJyuZN1hEGBAOYbv+EUgjOfNf5Ku3mghhQr9xpDA9xx3g5cqOK+HDdNOA
#uTXPs5BKYFHa4NP/UvDmscadh9bFcUe3Dkr4UYC1m61mvdPUjCZBpsjlgNMgpehQh1RbnqkYVkwT
#1vaq3ZEbJPFMoI0Wns7GSb3bOz1SFl+NczJpCUieNK8AAZRv+ROWCYQiHj+c6sDU6CgigdJJAlzT
#FS29G+T5bmbNFaLrupG1jP6X6v93YemZdExU6g/392fp//m/8YuA1W/I/jPho5S/uf6v7L9gNhu2
#/3YrB3n7b7+8tf82UdbziV/Xn/bN9LLMOm50LzYOn5auUW6F6N9ZkT0y6eeJH0QzkvsLZeqnerdx
#0mv+4/Ki3c2qj4utSjWz4OK8jatqTOKVd+WNy1gdBKnzUyfWBaV6/iJ8DzQl3+uH7KZaXgXJ5ngC
#htGTUIOeS+2jjgJEGBBv3+Ok0ri8uopAgfwj++XhGLrvjIU/uEZ+Ofpw6sH59Gx62kelZeDkXy/D
#RhgyxeRhNjaqg/wHtf3XteD7MaC0E2datOxsbq0XiDFmqboGXbHhex5XfbPJ/F4g0ng1o2Vh8oJs
#8q8XiCzLh7khbNem385hHJt+XfBry7xtSYui/4mY1r0Z0EFAw9Gjv/iklkX+/91y9v7/fnl3q/9t
#pMj6322s7YnAZd22/amnu/GRJ5Ss+z/jm86+NjgzYltKkEC/1DqGxnf7GUcyMWx7jMFL5LGGeC0/
#TUBMfhEZXdWKc/G+wWTquiaH4ADAhq+xAnTEdxhzsEe/PnaeH+AvvPW+julCd23KnAfxdOcHyKXV
#njNoOGV6rFhILZnEImcG0qsRyDWuZ7pIjcD3vvev17FAsaURiqTmzLmFOnGn2/4ZlOOP7WbnpNdp
#nDSPrlrcywhqsT0NApT3Qk6Sj35w7eDF0HDKMpcOpi7gF5446C6/b3EvD6ZnGlgOKPX5OsyZ9Zt/
#rebnlnNyCy+QAI+9PBZodLf0CNQl1/FoJ6+xR5ErntYHYMh8dDwHFgUTalUOUqBcVvBsNnBYSuCL
#UTzdcxp/8SyW//LWn8/bdV6SdBwzcsWKNhnNiMXDYrul0TrlnvdshgW0+iw1B1Pcea5HfGjamofZ
#DDV8lhEx6VRT0734oXn+3th5DWKTAE8gwARM1x86nhlnHCamye0u1ex6k88YQUj9qnuCvYnvar8C
#+Nq34SugTDaQQf4kqNIf7BHzrqztoXFx/vH0WO7jwcADHxq1B+Nb9t84WbJRM6B/450RYwoPAOId
#g+d/f/ny5ZVyLNDp/sVI8TF2EOUl8OrU35duraAEGmSSMFtSWdERwEnJkriIWmzM9WGGnQGsqG1h
#5AiG79RLtlW0g8ggnzRtYEdPiFGXOV6NfKBWQAOy89q2RBcsX7fxZl4fDZ7CyOSBPiv1g5TGNBhS
#kzH+/8D0wDN7+Qe5RJcBz1YyW2eP04okzCssZZlXsoSSMJo5bJ8YD5/YJ7o+wfZ/Mor8MiR3ECDC
#8PiTscMp5xPsuUH+k5T69LaEmdg1fVJ75BNDGjo+tTSXBmhOWv8kpT95IPZkWiP75fE7MqZj4I2Y
#Nv67M0eToYcn9MM2MWR1/4BBfm0N6t+7JPr/0J68IP9/9bCy9f9voij7/5Xsv/1qJWf/Vbbf/91I
#2dp/W/tva/9t7b+Xbv9dHZ12X571J5kmJ+TVmSBO86Nr3eLVjGPfH7r0FXm183DcuOydNbt1vO7I
#boqWHBEXiA0gU1hAYUnYBNw6eQU2VkjBmvTIq7BUfGvwL6XwbxOBtfbp9S//bfz69tMbo/i29KlS
#mrxaysL0kRtUeV+sqxn25p8kCtCUePXJ03e8muGZG3bNZuhCdLf26NYezVbNs0cP9pY0R2PD9Wsr
#dCuWRP9nueGeZ4xH2H97e/tb+28TRd1/PJzrJ4LV97+yu3+w3f9NFM3+N/CC1DrvAC6w/8u7ldz7
#/9XD/a39v4mi2P/VAlfGkQwKyhv6Fx5lT8nYR5uJpRoBAUg6/9/em663jWQJovWbT4HmOMdStkhx
#p1NVyhpaom11amtSymWcHhZEQiJKJMAEQNlKl+abX/MA95sn7Ce5cWJDRCCwkKIgpxNR3WkRsW8n
#zn7AVwWifYbo8QWnLugTsVSdQKBA8Pyzgz+SpugPoGwQEY79XsBvaqtqLDCxUQpUzKZ0x0ZYr9aq
#NUQnLkKHWfhTYWe6btLc/9D784b6WB3+N5vtVgH/80iJ+z9CHyGsUDVYPOYtSIH/jVpL1f9ud7qF
#/W8uCfzwTsCtAsRiQLuPnROXjQp1BC66LEbENaUOjSq1R6oC54cXBn++8Hcp0iiJn0GaRdC7KlPc
#3CG47Yxny4k8Euz+OlqHvjKVKxqQkQ2I8iShku1ce+YnXNgljL6kLpIngOjLpWcH92QK7BemxT9h
#5W5v6fT8U9cZuG7AlSLxx0sf1DWF0A3ADiHul3E+ZdFqC1wn5qJhQBiyc8/FIaoxkUoez8HSCew5
#+MvAPl2T58ZZc8O0SYI11sdzz75D3d1YfbAfpKwMFhRrbC6IfaDNSO2J5y5ApfX4+EPKOBaeeyUc
#PSFIIs7hGYH7C8JNYzLRMSM/gvFiCPwFPHBQ6ke7Ml5IQ0geDhi1k9EwHuXg7OxidDnsD0rMETtE
#2qNaucB/+MG6p6x3SKnHmnItmHr2LcSrDvuQej3vDYc/nQ0On7pn3o+4Ns8No4r0dCnx/SeI+qNJ
#wZT3v9tuqPE/2u16Ef8jl6RAWrrj1BSJvYsv8PO/t5/8er4glXEgEak58oKvI2eGAAa4bwSySFso
#iyATBNbh4UuDYqgGRJJwIMqoExgt8l6GQSzoNCmPPyYMifjW6BujAQywvQQ0JM/nAotV6NO4tnxz
#k0sQFX1C63Qx2Ec5Ase6os/m5kSfLMhpnOgzSawprifn3QuLx1ICUhpd/aRqgJC5Do55qJTfgIQ1
#cTTkztIjeGw7t340DnH0rISIrXha6jU56it4XTtIkeBOlnN5cbj4VkBe8Rc1omwowzXe+9MdY5dy
#i9j7409ViynLudPJe8lAQEiokRaFQWZeUGomEmhGbQksPBNb4jgowi+zNAjS39e9YV81MZNb/adr
#O0YZ/Y9dzQk16fOz9HF2mTDmXWC0JazcST+hbhDZYN2JInizdJo60fFG62nIEKmRVrSRVaR69dp6
#aqb1t9Fyd+5sObdOsLQ+/hxqlxqBJKhG3C0l7wa9BSlNREulqVosFzPXnMReVXboSDFwOZh8Z7VH
#gr6bkbZopZTDkXi9EXnyw7oH/HzQf3P0czJwoEMmgcqzXLgf+v3z0WHvl+RLzdq9tazFoXmf6Sqv
#eR9J9LYXiKrboYHBACeL7AVa5aTOYcyoCV0RaV6kg4TZKOG7woQGENKx8hAIfSqQtHIiIyQTqqCS
#2LQWvXXawi6WYUi2qvLgcoVDa2q7t+sNTcmnAkSk3Rj4oWmOUhHWb/yUEd8JRpm0VI6uGQ9XH/yI
#ixzMTFtzFMbwOQ77UfebM4CiR22+CO4PbW+PeXRXKkWPZzIUjol3DSmKOLImMq2SSihwEuFct2CZ
#CAb/MURThCwCRgFCyXbZoa8sKAYLkA2XiPP24VLrcOMc7Mn3MXK6c2jNEO5Mfwxv7QVxr38wtca3
#xFycIc5Ea+zEnWB1XPAYgA3xz5wxtpQX/dSFB4ahkCSzOoZcynyVLy2/qHRDaQ1tK779u6UEu/2j
#xrNL5P+QU/7U/J96vdaN8H9qBf8nl5SdvSNwiShAi+XrHDDomAKeQti6JnhiTQtYD4hCENpz5U7u
#RU6UMGQDjwHKoV/MUQ5hYEGlJE6P8qewJEAhJ4LvrGsCDeWxIGzAm1mN5z7GRVozJcJ/xwrQ4/7k
#8L/TisL/dhH/LZcU4qQMMMxdADPUzWw5uwhAhHqR6AMhp/uUZBG2ZzIsfDyje+FOhgi/HHNPa3Ng
#ux9LDOAMrF/cEowXlO4B+TxycFQ7QDtt8icLf3EtEbSV6AhYwiPpf1rg6HiCz6SwKpbK6kcXITpc
#RE6Z2B3okepUjTmiwzMK3P/wXcfYAra+GfA9H89stHa+sQWRPAxmyVH+xqcURJksxfb2tkgmpc3u
#WMNohwVjahkLi2pGCOsMCbipvryIXhDlt9LyXKrDDzDxV8edToVxw9XN4ZYNK09CUUahp7jKT041
#y2xexE0nx/c1Ef5TGcRjH4AU+C/qBjL43y3if+WTVoftqvT2qWF43AtFNcAoa4noPfU/BWBqNjsl
#MNISfuJRAZFve9bEKJtcT5lqNDuWNfEhfiRTXMaqydg1qHFj3lnoZ5mPgBUJMWLOdfIlUJLtcZFY
#UAK8YDwoUFwKgUksJGQeS8/jCmn2P/n+U+1u33qUPUDK/W83Ivb/nU6tWdz/PNLT4H8QZSVE+QQj
#gacGFvTFijCMMb8PGxT4RKHA3wxaKGscqNoGqqZBtjZVNEnQXlVKRXizkMbAOfWX812g8GXhO5D8
#/2KyuX8Z/tRstDuoKGtRVFHIotRCSqYpHqBjNKcuTN96CNk6x96Guf5Gh2lvZFVOEASGOlFnRXuu
#+LJmUUmIoJRMbCmV0gpAY5SG6o1oDxGhQ6RbBM19uQh82WyHEMzZ4z2CTJCzzLAMrq9KCSPC2XiR
#o9hqjHglVsqYVcIYI76JDMqzriV+oH5yWQeml1vqdHHFpOGASnq4YsLUHxSFgWeZs/ajQnyIEwyR
#Cpb4bYpFIMKyEGcaFfX9c1C/jh4I+SJT1e6kA0qUjGxzdmjNzHsOHeo1qcxChh1S7sy+s3IYUSdx
#RA05F1Tglp51MQWzdHeGHsOOev9WEj7X1F3QCp41WvK8ZMKE46XJXMcLDAMNKQlSZOHAQEH4qDu5
#Gq65ri/KCE/vCwrq+iKH9MyZ3Wsk/5HbkjiyiDw8ZpAxYuFYLn9kJHehaJepR3JaIKrLGNkUWccw
#RWBKq+jEphxKRsWmbGU1B08VoUodaNvVCFKfGyH+kyUN/UfYhRs0AE/j/6Nc1f6zXcT/zCcREFIu
#l4Ds22PR5UoUTUbfCceh3Wo2Sktsyfbdd9+VKP8DFyiFyrsfShg/hT9KgCaCsg1HtPCvEnsY9gx8
#2Eol/BCTPMEVG/xkgKOEtYCgt5k7Nmfg4Qb8Ovk40Fm99tZGQyD8a9yzyv4lg6TyX9wyJYzIH2ww
#2BdNBbXi3S9c2wkwiJ5cVSelEuGBwzh4iBZG3whOxGpG0/gW/ge+ZwgjZs9wsde0Eol5iVV48Rgh
#pAKoF9I42UwnEPx4lTDchoeO6ioxfT0CVcONIe9NuPTwmy16CHVJMc3ysQVswAI+9yks0nMlGf7T
#6IkbdgGj8Pgz2P836rXC/0suSb//m3UBkyb/aTRV+79WrVnI/3NJWv8vLIiq5AKmP7khfl/eklyj
#d35kzLBGKmpgx7g4Hhq27y/Bp+EODjVM1JjBr2nh0uVLTfr7v1kXMKvD/1a9Vvh/ySWl7f8mXMCk
#wX9Q9pX3v9NqFP6/ckmi2wu6+1XPXQox23ytSw6lDC6C1WsMpktTEkVsem0nquOUoExDOUka9Sam
#1PSeG0zuGOWIYpM6TKLgJLmvwTnbxr+MpWP/BvpNH2RHImRWvdks1nfIc+/hY1La/Qf3tvY1vNrr
#qwGl3f9OTdX/6Tbahfw/l0SvNQg32Z0JZn6f+n9gn6auH2BlOVXQD8ejQjRpPEnN8yA8N3qZv9Db
#kDjv1ZsbpRoTJdoMEe5ThK+tdApoq+VxoR2dAWGFHeG8Ushun1mBbzlj736B+ToO4TRFXUZElk5R
#WfgyeN5p999CWP9T6/+1myr+1+50i/gfuSTlWYftBiVn9Z4z1MBy7tx7dA8/3WuChPch8xwyNVce
#WhajfN/ZnKdJqMMfOBZALiH/ycRJuG+qZiIIuXQ6MJmUEtCAemFlVZjOpP+pKgh/bIOYtPvPNv4x
#ICDl/tfrXdX+o9NqFvq/uSTdJU+w3qC8H839ZjwjdsXpb0GujO8vqPgxnpGs5ArBCJiWq+cG7tid
#7RnvLi7OJdXXV0y/AvsitCYDQPB9WSROcH0VGnBFi1gyJ6ppoUBHATNCmZHR+9rhD6Xxt1rNPCdA
#ageiEiIR9F1QpbxQK0LA9BEmJPVeSUXbwnRDHFaW5QgMTGMcavwRweRXmzLCfyxBXPcRSOf/qPG/
#u612Yf+dS1oP/mOorkPyMIhnTwAos3nubGZ5p+IToSCR4gmrhFVKEZUsETdF4NT0UKOIQPM53UZB
#j7YbgbAT0FQGcCl6KsFf2a+wYk321YCwtPtPSOPHUYBp+F+zq8r/Os1aof+TS0rEcLJxeiQ+SRQm
#iPyS0JXLnLl9RPQcaBWxUFSQU7mrNaqo76pQtep6N7sT28Mc5XvObJHU5X1/1p+b9oyhJBb8oOaY
#CummqH8uPPsOHfcfrPuh6ngqMomKGBnMd2d3gvWBspoTx6/VQwSpYuAPImaF7cuuZ6anKCyj2WNL
#i8hwRDRxT6hewaHDlEKYuy5mRB0kVfDKy4OiUACQV4ydyn0jwIvwSxVFJG3JpIChpGygVU4KTI88
#TZEKMp0iTPsPS6I/aUqD/yDHx2L8RzwB6fy/iPyv2ynwv1zSyky+1+YYwZPJhWdeI2Ix1o0DnJsK
#Pjgc6BOdyBBwVLJebt2VViEN9Ef8BQssxWNQeMS/seojg1c8IjADW7OwIkuC376Q6OWdnFveie0s
#o9ZIS6xaSvL+EAAm9f5b5NF9QvvfWrcR4f+1uwX/L5eUGf/LQBxyhEEDDzB+V2GnKRQEKMiEHoXw
#URU0iFOVT7gm/BDuf4VoJsjgADSkZWhAwAmoip9jvW0pk7ljpR+v7VmgGKTSoCwEpAzYGkSADctR
#7GfQ8FQOI80JzGDpH2B+XrNWXwu30d//zZqApN3/RlO1/2g1CvlfPomLp7ENAaOgMP82hAXUfo7z
#fPmVq6BPJULUUJMIhSeNW40+mzhgea3EODq4O0Ueh+0Ynnt1vv4k33/3CuhxEsFpc1YA+I1fMf5f
#o1nof+aRkvZ/U1YAafC/3lX9v7QbrQL/yyVp9f+lYyBbAfw0NQMjmNq+Acfm2vXmxkeCQRnmFYL9
#4DXJml2na/w/98SLhFPS/d+UFcDq8L/dbNQL+J9Hyrb/E9OfXrmmN1nrNUiB/926qv/bAJlQAf/z
#SCv7qmZgv8LPREl2dHXjmdemY454Plh0lblnala/+k8f+qT+pildWw7sYGaVUY1zWqy8w7KW9gQy
#FpGMwLzxUc77MOtDmGfPrd9dBzd55bkf0fEOKyJSHtyyQF6z5pelSmUIvlEG3X/IdtyPlc4ULAwC
#l/4uGw+8wsJ0wC0ZGgOnzz8LlHoZHkOoBg2jEdhW2Jk8a8oigNDo/kcLHBUuLA/YH64z2TGu7okl
#t1z5xrMn565PBgyTeYWG+bEMwUXQH5/QHzX07z38Gw6ZLhwwZOVxq2PHBa1PCw+GB67C0CC2MIN4
#hNZugQg1azR2J+g/MLJtYwuIPVoAOBajifvR8QPPMucj77fRp0/v2/MP29vSFHAfEFHWmbxB22cG
#0Nfnz8Y/Pn+O7enh4dOnfxgPD7KakciMDV2cCLNeb1uGCBG2DPeabgu4iURYEHwj4kvD8jzXW3lf
#8B+6jbm2rdmEXEJSncZdpo0BkxlfBcsbW06Af+6AQ0zcKPxlO6TVDWx46obG79H+r+X2r+UHsuPG
#Lhze+WKEBreVpV1SbcdAyGKtnuHAtD99yuUwvHM/GjPXuUGHgZ4HIzBv1eLZb+Wr9TZ/7pcfv79T
#iMuIAPZ89NvSdAJ7Zm3Vqt+1d4z0DYJ1Gl0tIcIy3WCADDMry91efNdWtmrnEeNt1558vO1aLkcL
#QmUicgrbTBu2g73Rogdhaa0NWdTDFXtCwjUGHr0/urXuR+AgBACLHjSjEg8PGASvuRzAvo59B4mv
#TuLP07lJmX+Hzv+VcrUgttzjLghYIYwmaDTu/RyB2hFhuY+YL9GReWfaM+CRfubKDQjqCSJDRAGL
#+g0IHGZ9+sJe6TJv4AQmLPk7d4keNt920Djh3CEAHtAIayuu/qu41c8I2QiexTzm0UzQWoZM88p3
#Z8sAn0s/sBZ4L6HA2J25eMtuPMtyIBsLMdAXZzmboZFIhdAhF4s00VCNDwBPH3tgtuCSb21jwdKn
#LXx8/ulesXMD0WFnFrBDMDzKfGh2IF7uCErv/+9fy9V/p275K9V/RwcKv60QBTf9ZJk31hMfIxza
#EGFKgja5MbOugxXPUL3zyEM0edwhUs6H7ghFzlm9valDBCgSLCBVtxsJizlCZWzP5EcIbQXCqQiF
#4IOoER8/OBGvOq0sR4IAGzhaK4CZkvilENP8gVM2/s/cRdcKUTjrCQNS+D/1Zrej8n9qnUL/N5ck
#8n/oLoP+xNj1LBf7vQ7VO87dyQkpEWfeKTOCPKLfKWlQUed8VPVT9NweE4sFq2ecUgG16JEY1NPE
#RxKHgFzXqTszTVugKZIR9p0JdgPI9USI+RYdP21uQUMwo+fQ30UjQrlTa8lyUW24TDMQdvsaUzJd
#uLiULaDWr/HbILwUali9J90O6PeEvFYb2xRR47wE5r/aHQnGi0q49BUaAICuY2QnOnQnChVgmrLB
#f6zV8VT+P+rdtqr/1222C/8/uSQFLIE60IY1/6g8IFXlT4AmtMdQuVaxHJCLaewHoqYhRIMwLCGp
#FMoBuyTbkFA/ig5W6J8t1lNrFF4RlWvZ5EKzbBFoXmFrHzbNrajVl+cRIfuwJXNFdvDwiMB74aDX
#Dbr3hHHd4tCPXHt3oh3HRJnDanZJD15G+A/n+4ngf71Wa0Tsf5vNQv8zl7QK/s+xrAE6Dgmi4Uch
#nlinW3kahIZxg6r9hjmz4LBT7PjIP3Q/iqZwwFYhXuZWZeUmMOXKD8b+viFG+7gG/3SNufBFjf8E
#ybfuLAjsgfBb9I/NDFQoSNQ7szFAvjE3vXvOrzFekLar4YQMwr8xpqZvOC5aJMcBMQKdX7mUsF4H
#nulPwU+ruma2M/ZggwgjEwH1EQ9QEq4fXKDAHwVo5LOsa/e+DjIY43ujqS5gO/sCfjQ9Rx716uuH
#5sQWjs4EhwT0gAluggTGsyzMVPNBIHNtXweW5RhzrMXs6xb1BEfrSjqDQlS9yCGEiCX3f6gDKMxG
#PYEwl6TzBx6FB1aw9By/jwXokfX6lzqGx0ijy20mi1ae3cdJptEhRn80HnGO19uHE35IG9+Eugno
#9HpciSSioBCzCUf+EGFwKav/JLJitHh1QFGUxavXnhgKXEwt47s2IhCoDgWajSTMxxJ++AHra1IN
#HN3y/SeIZ4/8Uzc49BBc1AFRWaCKZtx+jhkr15Y4NyPXFQQkAsy7tu/gL3fpg1fIfyKcUDfxQ9u/
#PfLf2LMZGsrlIuXwOHANr9Eq+/c+QivJYzu6ukdA9DOO6oRZO/vlXQTVdiOlYd1iCv8NXb7I3avn
#/IjY6KyD23MRAM4gPiw9PvBsTOGOQkhZdBhuiUhMs6o/4vhP2dcVHpQZekdI3Cj8nAiYDFkztKDa
#YmMTvSRoDWgpWMl6+7mXEnxNY/9gARnrGEJh6de13v4mdh1fY/noG7QO1kT/CgtS2WtcLOOrK4pi
#JUksOozfR5/j+lM/AwDJyBhgYIaynGysbAXJVONX7Mg/sX1fB8XkcydKuTEwH3uugzrbRmAdesYY
#DVqxFSTgay76jlGmfYMs9kUd/ssKw99bvPg2lCdPTuO7ThQEN1cAwRtBnei4ZbQpMOgSoZfcZDtr
#AxSZmPfYT6+JSs6utTCZBhk68i8d9PaOpwAEIju5tbgZoTYBedyG2J9b83v/txn/lDsi0+PBkSBq
#0WIBE8dPMdaCQhATDdv1IBhxjBAluhCC9+E+yMstf+i6UXRcPtMbErkjQFpvRcDANN+jJd55i6wA
#HKIQeF67Sw+TMuhU+eVCJvJnTUn8v01ZgafIf2rNVsT+p13Ef88ngQwDm18LIpaQD1gSH2JszleS
#OXehRJwKY0LXDap0RnARS2QvzKWBzEunwvgKszAnJEBJJ2BWRMQzF2IPMkt1+tdzr++XnuT7T6Xn
#X0L8t3Zh/5dH0u9/vvHfmpH4P61ao7D/yyVp7b/pMZAtv88ci2XgMHCAmSPQDSGmLX/HwHFc0b/m
#MnD9MeDhO8bVcnJjBTsGVh/ZYSJmKtbdMaaue+tjksYGl9Vga55gNt6IBoprFIHiHpv09/8LiP9W
#+P/IJaXtfw7x39qNiP/vTqtR+H/MJYnx3+juY+ZBGPRNVDox/mVQcwvZfWskJFpJ1y7hTZCW45R/
#Pn8O4xzI46ka2moE+59Uru5lr7JUuA2VbOfaMz9BYW/pALdGdupIvglTKztgMW5kmRJTbt3wpIAF
#iMaAY4CjkfKfmcaEQ4SH+7dAhFxwbZS/8fe+gRgRdNq4VNWzFq4PxN69sSXnBOYNWpLAHQZACG5n
#2+HFcjYjLsKEqIGSIh5u/DwshkupH/dKYfgeqpgnqrspfnzjwvLpRwiKaeMlsNrICH3668B1AusT
#9r2HTkTPP3WdgesGlIykHy998FUtHJ4l+sBUAFH+W+KQUFvgOjEXDQN2+dxzQe4lOjEdkPN5SA5n
#+gy5hkbqPLHe3rln39lgFNQHrM0kuB4Lbw8iIswMspnCzcRz0RTe946PP2RYbIwThieBhFHycRQm
#Dy0uXQYxviRgg1vWb6woacIoA6egvM2/TnG8N6w2BCobS1i3K7xqUPCtRV0oEv18Hr9JrIezsYoc
#bAf8RcMKWJ6Njwgwd/cMkIeBzGTpWRfMmAzMBUug3IDm6vtP1XO9VprZd9ZTdtGohZEu0dJHV/3G
#W4zLulWGjL0nWMOV2tWt0EoNiPNH+dHhBOPF0AWthUeNafVWGrU4+Ka9ZpZzR+4YA5JHp28GvZ9H
#w/7gx6ODfokrFCe8Q3AdRSf5SlPng7OD/nAoNVWl1F9CtUH/uN8byiMQb7701kQaOT8bXCg9wooJ
#JVOXhukBvUN7i7BYKZSt6xlV0FpChebuHQ32GjpvDd22ik2cuBP72qYBIT1tFtnm8OXzxSBJvsXd
#uwoh6mC+Uoy6qEYxuepUriMIgcLViQtSp8Q60Pwk46TLwOuR39HRKoNLUJ7Xet7/mqLn/vFTGv03
#xpbWc3PxhP7/m52o//9mYf+TS1rZ/1cyLVMh56UkC7ml6HUqNVhVA+Oy/jKE8HTuWDim1HCdhYRb
#m9Luf6hfvj4ASOP/tGuq/+9uvbD/yydhsgwjfwztwF8wnoG+JLEthPtJMUF0R8GMQ7yiXELAm8Y4
#HCqBizKMjrFeauhv24mYIJqLhR8aohzyM6mHTwxLqsDfDEnFQCAzUHpB8WEJMGFVnBRejdgfM2mh
#+KYTLpRR/mhdlSnjgOr+k+p4UdgnYWHqESgGNe9sWJ93oJnt3ZPwJ5jcoj2+CCkMPwAV7Zt7ibPg
#UiXTCYsD6olfGOY3Nz9dOlynlAxTxOGhkrsMqsuwUIgPosrDpXeTUM2HbGF2PDyVdsjAICKjlZYi
#1chcu9sh925rbsEotib2OAAfL3RLy3zHtsngt4Uz0SFdM1hJuxYOJCRV1+sJxvEqXG2toth4ao1v
#/eWc4nLRnYBn9F8sbv2/DH9qNtod8PVI22XnmNAveMg9EgPtNIYwASEg1tQeSsVxSLOQuwTJwhEG
#aLFj27n15fyAxqlFU3rrmWPrXKaU+ZW5gUzhvjRrMk0SWXOJVale905aZZGLmFCZ8+L0hrsycGIJ
#08R6RIuydkmP0UrAQiVWutFNJpT2gpeQq3MqkKwmOnhzM6Ti2GTwR1kDESrSkyNFH25E27fUBtG5
#izYWmTPmbtALARNi0y/TxSsLUBXgHSr8QnlVpIWAvO3thLGiDt9IBsVk18YMKdZE49M9PhwTFhvx
#4+L56VoghX1lGWW4zpJi/0t6iwTWZomfy3PGjNI0STsDtqDm2UrcM8b41W4b3iPc33ZMvGrWrhyq
#EFKURxcmhc8mr03cJHUcPGUQ6rGN/RhZBg0rXgUW6rQ9y3eXnhL9W7pmDEWg5VIuHZwW8fQDpgCA
#wAqjPIUViMnFCYDqmLNEqysLjEH9OedH6/rDRVLWcaXxkrFq4Gp0iKFNCTGvOQCbEnl+2Mwk8ppV
#5LaEAYP3hK+Cokyj/7COziM1wZLpv3q9GYn/0anXC/ovl/RI+o+y0ZlVv30DKDtHHwQikFAqKl2X
#lePELyQcx03wmDSoMlyAqj/FJ37PWHhWBZv1zWY78PdygaY2sSIlKx8t+2YKKtSVZjmaOwGzO6uy
#oEjZlXXtosbILICQsalViunduONJFf5Bi/VPoCvJOM49a3jvjJMKqZ28xp28QzkHKV34qOXKR/PO
#osN/cs6b8ieVJ+hOieqe5gpIupAF8B/uVcpJ4a0BFwA9P2CVvxkmwOZPTmO9k7ODf/nL8diyJtTO
#8Qs4SGg2jGIE8zX3+ppyJsBO1xwH9p11iNC4GUKMONZFzPGCYEa/9K4R4ffGdmx/amFhMcnPhdQu
#86NTTqK2RaqYuo5gtNcpGHNtnBTWaHDQ3nX6KkJWqLUS6psI2YJaipqv00ohSaubQnGpBKKXL62W
#3iVEqp7qNN770x1jlygkY2+LpCF0YT4IxSM0Jev53dnwQkFbBcEyduUVkZzKLVBxdEwLqmha10L/
#54v+6fDo7HQY3w7aWcuBiYncv3I5rel3Zyd9faO7wXyhrTI4O7sYXQ77A129KAUMiVCkP1j3WgpW
#AMMhwNVQsSzh8PT6UUhjPO8Nhz+dDQ6ff5zakbCxUnWLp1pS/rJdIUgUN0qYEnmO49eUjfOwd9F7
#TbQznnus2qGo433CY7DqeDVDeWIGgBCP3BgvlntGuzbfQU/g3AXz307rxDZkwIBjmuPirFCj3VFK
#ZaD3CbiNp/d35RLxVHmkIc5Pk3vWXk1aWUEfJcVSlfbYBA5J2/wiccb6V4Uz1uNwxno8zvjdl4Qz
#0qOyCYwxbxHLlykeCe8eS2vJRR4jtNiUfIIfDs78jsgjnl4cIXNOxJY2IZPI8eGr18SXL/qo6Z6+
#bucVLvVVsGw3mlL5vwvz0XbAKfo/9XpL9f/dbrcK/6+5JMWjDlfXqX60riJaONS013Zudu8azPW3
#69m/w22fnbuTHjf+XV1zEHW4CqIVYemy1xX3f4FD7nCYptMlgu8RfSIJ6KWPdm47A1F9h/uvClcK
#IabU7fjc/CQVBtdZcRW031F50hBxucF85HI1dQw+Q/wC/wyBKQ2qsFjyLyQuUZSrcxnYM/v3EHkj
#CWFqIAsTMmOnjDpRuL3PfcyLFJPS4D89a496A9L0v7v1ZsT+t1nE/8klCWZ3im/uKhiYZXsYHhu1
#JsU+diOvwrrRCFLHpq8saIWSpyImfI2gnMMN+rQbwfuKhhV6DIxNu/9oQoi0fxwKmHL/G+2Wqv/d
#aXQL/y+5pJWk/Vh/CpvvzmyfG6OvrgMOSj6h9rfc+D5cJjjR9He0YFSWvKE4JjKT5fEw5zFBUOSx
#rBsIJTIClhKCkGQbEdfWEl8OEiaKqWrRDaTFnyNKCwVeccFaFJ1J8SyLIxfBtWzsmMW2UlkiOiSE
#KM8gkHzaGiVvYP/TAnY/6hcUqmKZhX4zI3wed4Fwe+jDOHIimcQmHM89cP/Dd524yeS7sBL3n46E
#vpiRvc718GnG/NxQPj6lvf+LydVT839qnZqq/9duN+vF+59H0oAoGdXfugmMLTDJimFVbBv1bfUN
#Js+VFDn00Pa9JfYk9xo7hXs+/hAacy80ZqpnoQ3WlgqBuvy2UY1YDX05oCHt/j8u8iNJafh/s6n6
#f+vUG4X/31ySwv+VMbhVtYFfTImbDRH5Jy0qfjhUgPHIEJMbR9zTQ1SSaWUMVCkV1iCiEXSGVBBi
#VIZl1wxcKYo8pU54uajSghBnbXU6j68+9ekUsX7dFkk7atQCIwpxto0F0gwNa8UOYk5HxGUMP9Va
#GXZacM54Y2SWQvMkidRdAwuOMOk2vI67z7BuuoWKW6Mv51n9w6S095/t7hPy/+uNjir/7bQK/y/5
#pNz9P0R4f1p7ICoyiKES9EapAtBAf1Lb0XgIDGUYLH0evxAy3fEEngFajHvoBQomI4od4p8fJiI+
#TyqCZn7uuYE7dmfi7kgqTrI7QXmdpo1xuF0wrnBjFCvLArxvPmWE/ybRLlzvGUjj/7Raiv/nBnws
#4H8eKQn6UpXSfAW2GrRWVoitCrrUMcrVMfqdQvtMcJRBifa5d+hpU+r9p/b3T6r/0YjIf1utWnH/
#80gK/0fjbkELIc51LhVW5+mG/hWexJSbKcFx64RbyyJoT5w9grsgzRjn3tKx9jEE2DnEJg7kB0fe
#0IuIkK4Td4JFsgNE6v7k2YF15owtEMzSmR1A5OlTlXnEVhnHpaa8Fln7mWs9M64PqaFtBUcVXhc9
#0t//TUV+IymN/utE/H+2Cv2PnBK5puVyiYdGQH8Th/x7+Fiy+AA4AwiCmz0DPw2gLLsQHE4dXZ+6
#wTk6x6BHG3Xpb7z/UCotsSVyp91uNkqE7nhVe1UrYfqAEiXEi/mesUv+KJXACsP4/FAq/TcjmEII
#IgSWCMMSbGbuWQyiv0KEVGouO7U8y/joLmcTg1BNthO4OIw3iQkRTM3AcKA6qoIuIURNt4MSp1VJ
#f4Kgi8qNiAn73PxEvOxhc4Ruu1SiruwwTUec3YFYaSk6zauVSuwOl5hJzkRwtA+QAC2si/qrAHMO
#mkL3Gswd3tolanKHVgXAK3S4DPQNRcLw8U+nZiQQn8JNxhsc8o1hx1Qf1xQgCV6sIT7EOKhceKbj
#w5ZWmMXHHixUBU14v1lvgzFW7a8Mqg+XV4fu3LQdZkfycwUbtTuonfuFVTljUNhxfce+vual3nho
#ZGH2Yf/0F5o3sK4tz7O8CjuOjlvx6DcKUbE3a+P9z6jIR3RAJpXX9+hIEs0BzPXPEoeQa18LBfG6
#USUIcs6pwQ+0Gtqvo+/cap0WCxW5ifIf3D0Z291T3jc4mZu8/zL8D1x3tuHgf39ZJ/4TegAaRfyn
#PJJm/zcb/O8v6fh/o63qfzSbrYL/m0vSxv+DYxAN/mdOwDIF8nj8PxDWzlxzsoN/AaickGB/WOYH
#z7XrzO6Niet6PioCemYI5icE+atHg/zViyB/T5g093+zwf/+sg78b7YatQL+55ES938Twf/+koH/
#22gr+9/utgr9n1ySGDQHdn/jwf9wo6tG/hNGsomwf8STSHIXf9KQNIn3fxPBH/6SHv+h04nG/+wW
#+F8uSS/tj96/x8ZiSGLxSiAiVikvjJNQL8XFPmiWUsMGPMYQUJjMam5lstrUsKWRxF9EBi8WCSHb
#wmKu/RKMJ9LiAoBvP9l+HX/JHBMgBxeHkUXRejLM5AMxUkvwfyjmXcdlaPx/b9xPol4BTvCUKHr1
#lwtF3fKCs9ZQlgrs2D5z38qS1tVNRhewYRJHTzylSdlZgtXFLrF2UJ51LQ4pZnJZB7YpJ3IpngSx
#i3Q08Cxz1n58rK9/0fOQ3HKSe30p+KgwGNVqWQ5DKo86pXuAbHZgm7NDa2be613yJzvsjwTf/BLG
#/13i+JtibiwAhJQerzdM0ci9YRJj+Mo5ETCLmvGjS2FOJpI5YLSE9tymxzbgqunZoxsIcI68WuzX
#R7SOciwiSPEuDxVJOGksBo7gTGXKchAEqZlzU3eg4LKdObN75bmKXT4J/sGifEIQEPsGEECgftbh
#yFk+VobEjUQHpoRzWGhGnw1Yrb5FEf+RabsStyNp3iU5sJYraua15qJnXXCERwb3h7aHJTuJK/kk
#qo+J9N8mjL/+kkr/Nbu1CP+n1Srk/7mk9ey/kujDfGy5stGMhSGXasj1BNZAj7LkUXAp1WUvO0xY
#Fo8F9OQgmbPF1AzVVQnS9FjHHtnOVMBcy/EVvSF0YuzBpxNXz37Mi1SCFfXtcW/JNgVoXb60vDyo
#iNmguVI2HcP6tHB99DeWzjmWNfG5RI4SMGXluCCifRqjb0sKjO0J8+kAZcHNH8E28UAoJ7g3Jgjo
#oeXc4+/CUYOlMWl+D1BXfgAWHlpze2HOxEM3ntlorQ+ODgcJ+KEGH1SiMuXrCyYjGHp2RzBP72sl
#o5OVSvzdxxtJI75tbhdj36zn3tWEgaXuMmgPbQYlTMT/NmH895cM/l9rqv+/drdZ4H+5pNXxu2w2
#epsDnjLDPiuYzGTxpufkKDZvOjClo0jVx2fl2GaMEl1zvTTBu6BFRK5euZN7kVwViGjoH34aEL/r
#X7xLUiXJcqawxfs6kgb+b1b5/y8Z9D+6qv1Ps1Mv7P9ySVz/n8qW0F+CYj7R10ffgA+MsQ6unl+i
#3qOxzjLT0ecCGKJBzwSLDyXOBkU1aRCCEuOMEV3okDmMq+ao4Q7UDVPiBpqHq2qna4M/9+49Psn3
#n1z9TWuAw6VeUf+7i8BFof+XQ9LuP8P7H6f2x1Ma/t+N+P9o1Qv7z3wSgf8vPg/7/cPRae+k/xBa
#gtGvg8vTiyPI0JuF0VJHJ723fawZAxZiZfr1ovf2AQDrKoZitOr55fHxaNg/GPQvhg/MdIzmQWy7
#B/pQseJng4sHZknGvg3OXqMxsTeLDepdv3d88e6Bvlv0Y//0x4eSYAIWNnHQHw77wxiDMLZG/fPj
#o4PecHRydAqLgG3EInm9nyEPm43RvIPzS7RGg7f9iwedGRktNbwckLWVTMrYWpz2fuwdHfdeH8MW
#6YzMaMEfz44vT3Az1NpM+j46OO4Nh5BL7M7kzOHR/8Q1qRkaW8mTM3Q2YCGjzzWb/NnlBa6Z6dmm
#ld72Lvo/9X7B53F43jvADUgPOVuY/sHF0dmpzCZnmRDxE7Yt3sIr3OOflc40Rl5syv2LwdHBUCgu
#WX+xfe0dH/cH0LvOFIw1dfR20IPVEe3CwjH9eDTEc9OYicljeUi3GqMVegcHeMdCxIXD/9tXG3/3
#WVr9/a81Gu3i/c8jSfsPpjzVf/qb7iPl/W8gfC9i/9ct6L9ckj3HfC3gjmGhgfHytrMLv17+tUTz
#PhNNUeOBF0B5JUTF+QGGusa+MYLns3p81iNQ9680FwAfyj1dzq8sb0soBGBvm5UCmAZ+/8UC572L
#d0PjX/8yXu6+3K76i5kdbL3cQX8iQjJAbb123ZllOqiNEoi+0ChJW9R/A2rtM2Zm2Q7WqLKGt/bi
#4nj4o+XZ11ThZofIsWz0onuTAbVyfu1OQGFKKOCP0ZPm2S7QpVyKEXjm9bU9Fj9Bsj6hzrAb9Zee
#OV8gPKFiep6NsOoKLMXLHak0DgA5gLfBOEFLUB1b9mwLL9muUa9ty4UBI7t0QMf5Zd1XGlp4FsjX
#xmB+9+MlGmh0wX+8HCoNIgwloazxrdGKjPYGk8yKfMhA52Oy9KgimrTHJ+c7LMYUOQoPO1krH16i
#I4Jev+QGPoQ/aQ79J5gi9HLqzibSrsGxHnnWb6NrhEMBjvL+JbT6t1q1Vn8ptMXLhUN7/3Kx9V17
#+291BJ9YUdTXQ3j+mGnM9dLBeIqxtY26xgXDY47OJT7t7/GGX89c19vCf3oIL3DnW7DuuEB1Zjk3
#wXT7w1+FFtCcUAMwuipakq1/vPgM1+/hxWeo8vAPuAy4MNzWLVR4B63uS9PxsbX7yz1jy9s29r83
#vCray2DpG38z2rWa8QD1Ci7unzRF3/8NGn7TlPb+N7uq/5dGrYj/lU9aOT42nJGSpB/14vMPr0R6
#KCaSc41QQIuZxWkS8tSfHWKyc2F6QETNbH8eyQvrgcMliFIyQW8tjEO2w8kYYRnAZm9mm76sBmUv
#MGmFeyZE+ejo/KEsPDki61gpCXjPQ5kpVCfZdtx2hBYp2522xZkoLKHHD/ryls4OD7XO0PQdo1Lx
#l4ik9O4rgWc5kwrAdfS5bN7d7OD3Cv773fYOeuvLUNpxK0sf9VcB/o0XiNrfEQMQNlqO1ClPN1UC
#K8Nz5O/t7upWI75BjN/FtMj2HooktQFIZHITUGJ03h/AOUpqiWEbya2xUsljOjlPG9PJeVILCPtK
#bgAVkOqnxU1WWsPcJ9bWwfmlMhaDx0xu1xsntpRH4yrHlK+/FUvH69mz2ZLTrDYWqp6z414SG9Rc
#p0g7iarfcHcqtMpzw94vIUnvP4BM19uAxrecUt7/VrcVef87tcL+N5e08vv/4vOgP7w4G/SptCAZ
#FZC1WeKUd8I2T84OL4/7DxVAHZaLmEqCZ216YhNQDtBAvbMOLXMyQ+9xaHXVqUFuEMzop951YHlv
#bMf2p0Aavuq0SIGN2PkmTjDzJKFgRgxHZgefZhnE2ra52Uxvw96J8EYqQi1t48pcJxcAo7uDBITr
#2kLnWodzscbe9C8O3kWRL4FfL5c8ODs56Z0eqga0kXJYpiSViZqYVqh+tta6lIyfbFMFlQJlLBvt
#SaQg4XtBUFjFluwZDQrTUQDQ3U1AAITsJHxavB4kRTY4fmvf+1MBs2YPoD/NhBsnoMWRy6ZH+UBq
#mdoCFm3q6w/PLgcH8Vgwa4EUi2mDoOypbVAxZcw4LpIQXz6Mi3jk983Rccw88DnYFe7W0bG0l+J+
#nMS1EcwX2iqDs7MLDEx09R5jEB6Ftilm4fqRSOM87w2HP50NDr+MsWpG85VAG7meTIfoqmakVJQe
#wlVHq/hD1HI02m8iZaPZRNpAEv4n4/9L5wnYf6n8v25Ltf+sdxsF/p9LWgf/vzzdLO6P2kNg78ej
#g36GWDrojCZg+7H4POnm4uJ4c857NCPPNHoo9Dg0Ptrt5lzw6PSxoENZHYsN77EkAWo4kRyI5F/H
#ZybiiEsxrnWIH6ImEtF+lB+D7GufiqPTN4Pez2xz4vEhYQP12BBtiGqf6RuS55QVp4StVPHJGMKE
#PzcJtIk8mQrV7ZbbSSVwlEaiyMcz4hVp7FVQjyAKffiwnF8+7HCWKPl20j85G/zyYMg4K2Wmouq6
#0qPjo5OjC7mOhOGw0qDOxe8jwzxoJtHdGybKdvn7T3wkPokKGDzqK+p/12qF/lcuSd3/+b3/26Zd
#wK++/416u/D/nkvS7z/gMLnZf9Xbnaj9V6OQ/+eSJM+eQjQkxcVGT3DWrqMJQvOBCtVWLmm8TsZF
#XfpoQmSOcr0c2tajbGssaPcPzv6jf3CB9cDxc0waBDn25eCYWPeCFBrVQ/1PraVfATRu6SCkoXpj
#B9PlFY41ac3mlTHENyDYBf5zzxBq4fNfITpdFA1nDj9CDe2TX4b/eTzq/wyIVH8w+rE/GFItdBJ7
#iqEKxJzm7ApPhb/kC3cSdbWguvSULDJYITw4sRboI8SUZWbOknlEmCmZU3DWk4TkfrL9wHZuzk3f
#/+h6E0IP6DkPwvbrOEcJPCNK4Zy4jq14peCWBApHWyI5Y1TyS+CgBEYveCyBnmDO7KgINBrV3av6
#d+OSvgvZEgGdWUqtkWMNxBcoX7LhLyB4mDRw35pdv7M4f/65b32Y9PD/Cl366sz00L2cge+dx/WR
#Av9rjYaq/91uNAr7r1zS4WtE4J6eEjuafbz7JfQNJBv7Lz6/Pjolyj8P8BFgCPtI4An6eNi76L3u
#Dfssg/3GmQBT4OqwTAJjoCkKB3hz9Hehh5pzSrj/S28Ddx9S2v2vRe0/W0X833wSQWUQDsWv6OAY
#3VB6icWM88HRSW/wCynw3MMu0oaS/v6DRsXmmACr0//Ner3g/+SSEvb/xjMdhBP/9mguQBr8rzcj
#8V+7hf/XfNLbQe/0wugdHxsIvv94dNx/2x8aZ6fGt9VvjYsz42WEQnz5P15+89L46ejinUHqnp0D
#6vjX0pvjy+E7oZW/Fo/EHyDp7z/5sRnsL/3+t1uq/79WvV3E/8ol/YBQu33g5l2ZvlXqn749Ou1T
#MvDk7LA/3B/P0ApZnkEDbpVOeqe9t/3DfczHwLJTUnzvVbVVrddpE4wntk+/YtKx2ax1SgBE9r/7
#7rsSByn7hPdVAh8T+w0Id3xwfrnfaNfmJSIM2+92Xp3YJVEytt9AxYbDYxjj6ABBngvUDv/Axlg6
#vDw534e5MF7dfjyrD1BdMhMwZgnJ1T2FREUI8NHD/xBp4z2RJt6N0MHPvcWJSX//mT7kZvpYA//r
#tOoF/pdHSt5/onlc9aeP6iMN/nfrqvyn3WoV8p9c0n/7N2D27PrTkm8FRsVacoN2whk4/+lwH9RG
#ROY99jcTmPMFytmagF1+ZWn8+ze/fDP/ZlL55t03J98Mt1GRa9cz2Mti2I7x4jODicO9ysNfjYlL
#7NXntxPbMyoLUE85u8QQlFWjWir4UE6W84VRmUIpYl1oVM7hB9FmgSGwcWKwXQbrSNu5mVmVAGLT
#E0/k6CO4KoIYR+jPwLNvbiwP/kSzr9wE9qSyAM9Lk/2zN2+MX0M1oopn+ctZgH207mvGif7GK/IA
#9FIZRqJMwRpPXaNM3hdDyDX+6//+f4ZY2dh6sfVxbFTGxt90CyJ3tG1c3QeWD6s9cZ115ArJ95/7
#JXoUCEi5//VmTeX/dRqF/DeftO79R1fH8vdrpRI4i5uRG0oChIPbk5Xv6cxyghAikMZfbG3hP4x/
#N+rb2zjjPdTFH6HeLDC+qxkfwE3MZ/GCGWZg0M73aL+GA1qVhjkeWwsIUm6CcptDPIqV/wqyzsCo
#/5WqW/kzy1oYDXqnSqTNVWb0t7+hpSsdDPq9i77BgJ5x9MY4Pbsw+j8fDS+Gxq//ANIaa7yFuOKv
#//grqwZNKVVehjUEUvzosH96cfTmqH9ovP5FLMO36+VfS71jhPySNh/RShyzIGYuAgtB7U/HLoA1
#KylwUqppuB8d39B0VUSHXzslw//QHuoxfaTB/1ozIv/tFPR/Pmld+I8hMTMJM/5tH/skpFZmMkj2
#rOslIGJG4DJTPcMFYPyS13hp/Nf/+X9YC8fFSJrtIwA9sWb2lYXdPiHcTQLS742KDx1iSzClO0Ky
#4MaxtdlLw72WunLcwLh2l85EanINKF+xjHI6jKdr9Os/ymt0Ia7x38IZR8EkmZzBJs0WeoLwbrTs
#vBW8znfYCZphBztGMLUcuu6WsOCz+wKi/kmSHv7TEAD5+H9u1DT83269gP95JI3/5zl2scQ9/B6i
#T9xgRnT1rNEv1DhpNicTErKIOa3tHR4O+sMhc7+MMG6qg4CKh6UEKFgSwgrw0tKDFFUupI9XTD6O
#lUJtN+9MbxfBPXLwS9SBdIn4ciT6fKGteEjl7GAyZwcB8x2j3uhWa+h/9R1OykjxDEpaaxHm/lky
#F6HqjKG9iM5KRCgUmomIjp9XcO9M/DqXSOw1wX3x8VEf25VE/SDH61yWKNbIXGcPDwZH59gDM4iT
#2dej0yPwdU2eaZ3H6Ne9gx8uz/FIx1MLgFJ4KkgeavldnxvVMweRchHmVNvgLKhwdpwNhd2O4fiG
#kS7OB/03Rz/jDkzqU1npgftSBv1Wa3Fo3vtqkR/6/XPU2y+4o+UCfA9ZVMdVvlGX5+COqT8QjdFU
#b9G8jGSQRv1OyCWo3wnhSKQdCuVYsHXGp+O5QVSRnjCp7//iBsO31iZNgDCPfzX7n3a9Vsh/8kix
#+79BFYAU/K/WaKvyn1a73ijwvzwSlv9D2C9Z3F8i7+f+wvUDCDmJUCMi658s0IvCT8ned9V6lwj3
#27V2jQj38V8HvfPhfgmrkRNJ//HZ26NTojVA4m/s785tf7wLeBQW+AvyfnQgVHk/UQF47tX6+lLs
#/d8gCZjG/+t2VP8frXaroP9ySRr67xHEHgkTx2OgnA/D4Dty7J2SgrXzGDiUJDx/2zs8OTpFl394
#0SceC0IUnfsvYKUO+296l8cXo/5J7+g4LId/SgVBcoDw4/8Ynp1iN1I8Gt0usQ7zq//0XUds+WgI
#gXVQl8MLRA+gtgGCqSSpOo6Q7gxJThILr8Ts0EhPPOZmeUi+lhGpV67j/wLNVRYjKRE+4I5Rxh4w
#hCxmHAl57xDA1teCgKZlZcHJUqLME9N2AkSJOWPr8DXUZ4AfaoK3Dkc3GkqgoyKgeeVOcAkgqCyv
#/PCQGvWP094U6OxgN13PQDt/wdGLWHhCxjy5hMvDAxWypTg6xLGGssY3Eu5/BP5PF/N7vBvPq/8P
#8p8C/3/6lLD/G6MAUvH/jrr/7Xq7sP/MJaXg/4QrSlD/8GjstauNapPg/ThOLMb7Cc5/8O7sp1Nj
#2L+4PDqEf96ifw57B6Mz9PAOjg77xhuU3x9Q0oCRAioFUG9ENH6JP/LnXq+vLSXc/41RAGn4f7Om
#2v+0C/lPTulLxf9PehgDimKyNFOmCERsFkr0EJ7zrh9LNqD6vdfDs2OE3IE2f1gEbFuhBOGkE8Cz
#Z3RaJ6XNhLYu0NknRmeLtGKKwH/O8HtW/L9R8P/zSQn7vzEnYGnvf7cZ4f91OgX/P5dU+P+S/X+x
#85/mAgwYgm8H/eEzeAEjSIZYDXZDXBaWEt2DMQdhEfQoTOlOwkL1CrSKdOnkPhK8h2X2H5bidR6d
#CX8maS1RQ9BwpIWbsZiUAP835gQslf/TVum/TqNT+P/JJcn+vxY3z+7/C2XS28vy+GV+7rX6GlPa
#/d+EE7C0+1+LxH9tt1oF/zeXxPCYwgnYnzMl3P/c5D+dVsT+v1Ev4r/kkrT+Xzgmn9kFDKuxV39V
#7VQQ6Wg7luoKBrKorlir2SAyo25tFT8wRASU6gdmYvuA00fcwQDr1fbQuH6+6J/CkIbUQwy4FtC6
#iIlSgwALwzuyYVcxf6d0TI6YT8L935gTGPzEr8T/a3W63YL/l0fKsP+PdgKTDv9V+99Ou1bI/3JJ
#8fa/5285kfbsDmAWNyON+5eFaDt7GTHPnchuWIxKxXEr7kcHvWT4zwULGeQblTdjo3Kd7G8FBiD6
#chFegXiHLnjUWT264B4e79JlpZTh/j/aCUzK/W+0Gir+1210Cv+fuaS177/iAAbdUNv3LHNyv9ol
#/W0TXl/CQ7th1y+LqMF+KtBhgzEqd8bZ6ag/GJwNRsOLs/P9OpoudSqF8jyXuJKSXJyUIYfxzMXc
#cOmhBAMeYonQG4rxt7+9RAT9y9Kwf9w/uDAQHJ6bwdZL6qxgcHbcN745MrBFBtdQNr45frlj7L2E
#YeE/2Chebhs/vesP+qJjgy3act14Mzg7gc2Haj4tiP4G1raxz5rbNn69AXtadUDEK83q49G3RrzT
#oIYuztB/xcrjpedZTjACeYY4GzTuqenjsW+JZYSqLxG18bo/iO1UdQCBusf6bWwEbKfC4WRaTv5s
#krLoJ19R3mLckAb9H89+6GM3PWen0shw6+eXr4+PDuTBhU2BDx54t61PgeX42BkHPNwhySS93Ovc
#D/2R1V8W9GYyFxt8BKqPDdQeH+zDr2X2bpZ0r3ThTkhNGd7/RzsBSnn/662GKv/vdIv4L/mktd//
#r84B0BO89cpLHbrySXyfBYitQumNvxwA7uH1pttSqYxnlgleMu3rCg4A5se50YSVq7hOxfI810ui
#rSjCs/IjwVcr4vZIgemF76NHpAT4n5f+d6PRbkT4/82C/5NL+hL8/3BdqngXQEKhw9eSqtH5W4CX
#giMf4QQDwNtd3MA/Ygvggubw9QiBhSHqrVKZuWMTwTfM55hY3r49XgIEHC9pzj56KwDiOWN3gkDh
#/uXFm1cRE1DW+Co+h5ShpngfCknsHQQ0d3TrpDgkKtwQFW6ICjdERUpI6vuP8CZ7U3EfWIJHfdX4
#3/XC/jeXpN//fON/d5qq/8dmu9D/zycV+v+y/j8+/2nK/4P+4dFzaP7jwfUYQo1/YQ2UsOiehI6z
#etjmLoPOu//HCvFNG/kUeGbPu5GWE6Fs49sKGhQhPJQN+6H/yxDjVH907f3HJz38zzf+dzPy/rfr
#7UL+m0siN4MQWuDhAe9/iXyNGgGQ71E7APo9Vqmf5mNiJlQlxqRN6QCbag8vzgb9fdL7f172L/ui
#WQL5jCglALOjw8ERgrj043Ov3x89Jdz/HON/R/w/NluF/U8uidxMVfWffEXPZMydfe5RF2lTSX//
#843/2myo8b9a9Xpx/3NJWP9/bCJ8WXEARfT6CY3xqlqvVetMrR8//51m97swlitW2W9Tjf16LdGT
#ax0V0+naK5QXgCRG4ayqV18rAFTWpL//ucb/qDei+v/1RnH/c0nPKv8LZVv+dMeojHeMlyD4IpyN
#CqHFjUrFXCwsZ+I6s3vjHsftpIY8oBGImpWJj/LLD0SwiN00STI6uWCSgE6RxgXjxdAd3zLWiGbi
#hZxtZTnbtTnzc2JyFCk2qfCfnquNSoAAqK8o/2m1i/jfuaS4/Zc4gC7mYK9NDqTh/416JP5vt/D/
#mE8CzbrhL8OL/gn4Ov9h32+Wej8NR68vD37ocyYf+fWAc5iP80H/LbDmaAnyi5Tonx6enx2d8trs
#N8lFWAF6cy/ejYYXvxz3w8LFc/AsKdP9v3Nny/n67IC0+1+L2n/VmoX+dy5Jvf9Y4624hn+alHj/
#QQLwyLcfUtr9r0f4/53C/3tOCeRuiJqPSADYdz0iwHL1SADLjUcEnnvWRWIp9f4/8u2HlPr+N1X9
#/06j8P+QT2J3FVDyUG4PXrmfe2RFyiPF3f9NSgBT3/9axP9zq5D/55Ow/I9uOpUAEozPIIC/JCAG
#YO8AOobc6RVDB557EkVaO/H774Efj/lmGb80waVejf9bb9QK/f9cUmT/b9yNH4E19r9TxH/IJ+n2
#/xBknR7EtdlMHynvP3r+I/E/2t1O8f7nkXqDt8bry6NjKtXfv3FnpnOzV682utV6JfDsT7ZVwoXA
#EzAtM/bAUGFi+wF2++MjrNEM7HFlYl3ZplNv7jmu47luUCphrwQIWwh7eDB6Q+Nqac8mJdzuSe/o
#dL9aKv10Nvjh8Ghg7PreuFQ6ODv/xbhxqwgNhX/85fxbo7pbKg0uT41KZQ6GkPvB/cIiqks7xERj
#Hw7v4vZml9Qy4J+J+9EBg0faZNWortJIQimY324Vf0M1KnhG1NfBwduzUf8U4sYe7tdgICQTVnO+
#MIOpUZlNrmfmjb9frvhG5WPZqLjGrrsMaBRaUJWAZQEVCbaAfPUf6EwqlWvPne+TpsXKYLxF/y6V
#+qc/GmGYPqx3Newb5AfoZxiddrvZ2MP/hdIXg18wi8Z4XxbaKX8oULyvNOng/8JzAfhvSv0zlf5r
#R+F/t7D/yyeFwIGF4iQB+0rng7PX/X2wgyJqngREANm3v/QgWujl6cU+UZQ6OXo76F3090tQ6aA/
#HCIi8qN1Vfqp/5pZie+THzTIJ/xNFUQ7rRNb+M28OmO1UXgSwNCc1SI/pYriJ6luiTw54ONhX3h9
#hGcMvzyl1LdvrXePPmpoOX4ENviP+18s/Izcfyrz3SQRsDr+3+g0C/2fXFLs/m+QCEiB/61GJP5H
#q9Ms4H8uScX/J0vnZmb6u9ee6dxazmK6QPCw3qh2K+jPV9W2SBIg2A7oJHUXsj925wsXFIAbYC7Q
#xEXO352P+j9f8BgAKAua43it3ASmDVgz8cQDRCrQtY4+Hh6CD7Mpwt33AeRwO15qAo7a3p2DikNg
#707wAYdpVbj/yIrtoOMwm1nermfNLHDXsssoiN0Xn5X+HnZpcbkR39hd+t4u1qTAzvUIxRFTlpAM
#i7ETzIzFxB3hEEwG/S/6jSNwE41ow11geoPWuZmA+7prcHM2M363F8bVeI6oC9KbuQgqiE4xlgvs
#n5vU+O//Xfh+45kTy6jcE4dtbHSeBUrZljPxo3VomaQ6M/tqbC4aFTTtsL5vBeijUfHUhQkPWbSz
#xRLRWdCVtklWCqyqPWvu3uGiPNubo96uQ0dLqDj61w/83W/pscIu8tBhugPNck+mqdgJJMOFgcZ/
#EQhXRC/Rdlhm9Z++64S/0MRvORXLm+SrCks6se7QH+AMCB1NQDSYOz0X/ET5bN0Dy+OO+NAHqolN
#fsCSEBc/Ks3LuwRH47wcquUuEOi3f7fEMWCt8rmJy01diGcc2HeWsnp4ypoFoAtJFhdn0FwYxsJD
#E7g2Xn7j/+q8pHv2Eux+fGsER2HfqPHPRA1+hPXiUQYEAOF5xJPRaG5+GuEYzDCBfaPRDkuAfy2c
#T/OaQm0PoblAjI/wlWIlXsUWCNAl2zc6tXBs9DZW6RjH6DajdcW7AsPoRArifXOsyQjhj7Zz44+u
#ltdon/HAoq2iYYPP6hn2SjghU4SGa7V6PVL6zpzZcNFH8IZjd/K+uI7fY3+LCHodnR6N0F494EjV
#1cnu779X6MOPRmeXyQZxf/xMGIju6dz66Hq3u3e29dHXfCd8EKAGNJkIihJYx7Jm7k34A9gMi+XV
#zB4bVwh3RmtjLnZFOIfu8wwddP/aMarVXU018g/LCWuNF/R6c6TGHQemYwGLafeA2J4ADr+8Et+7
#CowZ3VY4irRlfWbYzxQ9EUZlYHz8+LGCPaOwP9gkIzOThyzxaWo12vLZwUXvtD8iNM5wH+6rnHPS
#+3k06P/nZX94MUQUEqv38+FbMJ5/c/R29O7spL+/G8wXQha4HQszBJ5QjfGE2OgVhpA/Le8Y5coY
#/ovNdGARTC+wfdMxyMruCRC9UoHwo/s17IquBlDN9YJ95pS9QlfSR1/kiUIeOvwVZkQTFhDn+1Dw
#pDaSYvH/TTF//pJB/h+J/9Vstor4X7mk3vk5ZlAgDGOyxChFCT4d9l9fvqU6+fCbaAFw9+mgIXh8
#hsDMu97paf943w8QuuGV6D2FYv3BfggLipv6xabY+79BJnDK/W/UW6r9D3rMCv8/uSSOdHD+73IR
#4f02m4TxS88GY/5iAVGIjnE+sIgXzO0b7MEdUQSuN7ZKw/7BoI/QFQAqP/R/ycQybig8YxIGMMI0
#BscC784GR//z7JS3IQ4FqJjfEXzjZZivAvaBNt98Baxl+SProt3sCHlougf9/e9q3GNRtFOEwyyt
#PcB1wJE6RJcB1/AVEuumSVEduHj7TURbsIbYyMhPyZeC+ImOqtt5xTPIkDq1EnNOO9AOi/u0hZGJ
#ZSmvPfxCO683oA/1Mx0A2ZBBH0H919ruPAjBc7UHVy2IQwy34Chus1ZCuQT9MDi7REcLnzPWEVsl
#+ltaJumbtE5xkgGZFRXhLa3DJEthkMUxx0KxAb0l+0Bvd1p7vexp34i+7Eb0yTbk+N/+bzMbXVYx
#rPces0QX/XSZnmfeG4pDLvIx4rwLHOEVCMCXmpLe/7tHxHwRU8r7X683o/6/GoX+fy5pDFEV/WRG
#xyOZKEJslmBqUU6BQQpApJe57ePwMC7+BdFZcDFUJpgC05uU96f2wpcitgSWHxjlF1vgEn9mO7cK
#U2W7bOwbZS3HqCwFj5O5RwvXdgLU6zLw7YmFh4K9n0S7rnyUGVpCm6wxOp+PwD69mlnG1T1ukN41
#A9ylSO1ivokH3FA72OJCghFm5062ylhKUN4GnpMmkwkPkgpgaUJcASxkQJl/N2rGnlHf/utLcU7o
#GQ+DgsEsgKuLZoLWyhG2UZrPc5/uIqWlCPx33MmmlcABqK/q/71Z6P/mkvT7v1kN4NT3vx31/9co
#9H9zSar8H7Z/r9GqNurVGiVjENlqz9N1gKHmP/1Ga2UtYI38cGGOb9H7SeSn9AcE47nFXzKpAhP9
#XGcxN+D/xzYTjk5sKlO9XjoRrWAoii4CU9iFKGgLz/ItJwilPVAG++4GwencDvaJvDTaeFhlbtoO
#hMqGJcLBz6gDs62X1V1xqi+3q1AUXt2XtjOxPqGvL8sIkeEtfSbBcKHUA8ZviIIuKkej4DFJWViI
#l8BR7nT6xPECXKpdHMpvV9MnPjg5BLkRH2Ihsvnikh7+b1D485cs/l9U/a9Gp1nwf3NJp2eHfVUA
#9NxjKlJ+SX//N2sBkHb/2xH5b6tZyH/ySbnr/2OOvSDMIYKFiDCHynhCCwBSTzIBoFU1NgCkdroN
#QCkT6rsm2vsH0P7X3P/FfTB1nef2/9kG/88F/f/0KW7/N8kBSIH/DZSrwv924f8/n6TS/2T795rV
#eqvaxeBP1Pi//JHBwSkBhCYoNc4q/nR3ebdXAxmooNzPSmNif3mXxgcQCc/lnbGL/1/SF4c2gAJF
#DYNo9ei4P3r9y0X/AOGw+3VKJKO846PTH7Dj8v2xu7gPv5//cvEOxJVnP51ChNLhvgNiaSGfBJkD
#kH00ODs96TMlh+odQoT0jIp7GqmuGrjzGZokVvJegUFBFGfRVNH/gaSULMDvliPqYgu69rS7FcyZ
#s/aj3Z7NGxMkqOaHhW48d7kwJ8CC8e99BKPQHzf2xKgDuxALHnhRkKEoJZe8JKkF5fG4xp6Fxl+Z
#unMrTXWdcYCwbu8+yt5jTBCREwJOs8rhEYFDuvfiM/afxZg25NBdnr6+fPOmP+gf8oNKMg7PTi9+
#Ghxd9CMHOZHNgqfHGSyqYu7yzh67noP5Tntk9qByYcgqFwbVxS3YMn/iFPf+b5IDlM7/icR/bRT2
#f/mkKHgqgMGfKcXd/01ygFL5PxH+b6vTLfg/uaTM/B+CcXwV/B9Gl5SyET7ZiJ4/BLcnmiL330MX
#4vn1PyAkWMH/ySHp9z9n/Q9N/Mdus4D/eSSV/wPbv1evfveqWo9wfxL54OP13L+hB6WHQLnW/1sW
#7kbIIBqjL+6uZ93AmO6T6oDmKvmbktq4Klf6oJ4f0F/Ay7EEPQ4Ilrdfxs5v0aD3Ki+2fJRdcYyX
#u//r1/dUk+PXD7s78HPX3/1fUMH4dt/4tvzr1vv/Vf7w7a/b5eq3u7/WdxcvjQPolfCN/mWgVxe3
#VN9+ENQ9uG+AQ6NMRsz8Uuy++AyNo8KC77fCXVyRVkx6+J+z/kdd5f83uvUi/kcuaXA5vBgdn73d
#t51rt7i2f7qkv/8563+01fgfrWa7kP/lkv7E/h8JFlfKgv2ujPkytPaL5wrw+x+418uncP7/l3Xo
#/1qr2y7o/zySvP/mR/8JzsDq+19vdLrF/ueRovtPIv9s8hysvv+NbrPY/1xS/P6PZ+5y8tEMxtPH
#HoXV979d6xb6f7mkTPsPeiTV4HrdPmBTE/X/OpH4f812wf/NJXmW7y69sWWU0d6Pwj0fzdybEVbD
#KoPZvu2Xjc8lw7h2vZFljqfGvhG4vhVs3Zng15QW9bdLqAxmekpp34A64KRyaaECnhVYDliajGxn
#NDHvwVUltBN+h4+lh1JJHp3v+KPAXYD9vjCkMbB5aQvmzPTmIwud15nxb/tGuWz83agbe0aNj2sf
#LOOgKOaeVnAFv5zQ18hfXhH/qmhg63VM2jE98AsqtV2Fxt7XPlRRHiqHqO7AHbszWLAybquMvlrO
#BPskMKJdRYctbODcQsQL6haKx+0hb8+HcZKW5e1T1uvFZ7yTt9b9Q5kuqb8wx1bMZld5AVSYDkhq
#XypMCqCSE3vO3CPrS4YFUGnshN8P7LE0iHLvzgIfDDDMheXZ7kQ9k81aDZYXWjTxqSPFfMhrwLZN
#0dpO3dnEiBkFL4APw3xheraPmnEX4LLV9eTC7Cs0DGqII+ovYYT9hMKAHTd47UEN8KIQ7gdx9Osn
#HLT3sYfqAzqC7z+gptxb3o6hOUjZmyp8OnxdKdP77y6DxTLw10UBUt7/Gjh7kN//br2I/5lPIluL
#ngf2RpE3AsOsBDgRCyYQlCiXCyjxh0mZ7j86BTb4L1oTAqTdfxD2Kfe/2S38/+aS2NYi9APhZeTy
#g8oEuvvESz3gmGGhENUXimKMAmw4tkiVbUDhrGtzOQP0GCMNQhMylq824yznV5YnNdCsyQ0I8Eit
#TYcs1sbQSK3tSxOdm4stEvR46zPWvBDQWqFNhsEaSl8SpijMQMJjSS/h+iCUjKGJUMnF5IU5oyV2
#jPJbbKviXUxN54I1X4aaD9uYygpn+PnhEfA2/v5b48aGeICr83+arSL+az4pef8fyfihKQX+dxsd
#df9bnW6B/+WSMPVJOB7+fIRIWAT6ENgpG+Xl1dIJlgRQMtYJPiCg5GWPrd2x6biODap3pCjV/tol
#/ALybYQ+AAB8gFB5CP7ujpeeh8D/rjmfdFq707v5rnXlV24WTfTFrtgTHSvGQpXs4F7DjqK8BIKn
#wg9AXRfjkT2h38gPgJcIquIIOgTCTyzO08FelPypsXVr3VdcZ3a/Q3w0Ui3Ame3AD1Ag9A07MECN
#zjCd+49Ty7O2y7g1+DbCJnWYd9Agj4LLPgkfQxYPJvmD8YK0MLYn3ugK9A3hqXhfppZ6u7UyUO8P
#GODfowmi16dMZ1KmU1HZOZO57YygPczTAc6EAw8uLR2Z+u3yCoLSBGh25sIu00LyjNDlbdIMeVZC
#RtzMInOjwydskQ+4zAObY+ImgS6Cbr1f1TTrTT8+Yr1Tx+LrBsMWRB4N+/qI4VjiaOQ+dfPXTr9S
#z9xdYN5A3mfjlFx9dsGMh+gFRRcHQQ7bi+WOous1Im5WoWyUQQoN6K6yUEfXEIwkhF+2CUuCsu5H
#E3e8RJhXgAZk+v6S4bXAKLTm4V0IOWvvy37g7/Vw2YE7s9A60PWznbG9MGc+vz4M2aRLOiTAkJ11
#ewK47bWNoB5uFj2iVXNu/o5wu48+hJ8riyc+w/jBvYh+9L49CYfRH3vH7o3tlKWJGXQM3t5bK+iR
#OF6/Y17nhXtrOXQsbDPJiL8Nz4CuR9LX+XI2K5fURaRrgDt8DYTjwdQa3x6b95bXu0PYunllzxAc
#L+9ECqLhHWEnu1IW+npIg+9derM3roebomXoDomDn1nOTTDFIglUHZgZ/rbxvVFDR038BoxMcZoc
#sPL5akCr0DZ17ju6Wo5vrUDq5n2dskm1kFfasSFphR0cecv8Jkz+DNMkYNWNfp8v5d+H6H0KLOnT
#MSLBXuNB0Z2VlwcNZ2wGcVPYMd6j6RrAwrEdI6YQcHdefEZ/PeyiBdyWgXemdYSGr8zx7XIhtBuy
#n7Ov32vciL/2+qUs1nvtQHeYNCSSgxdEvtoykITrDQpj0p2OispUgQsuC7IADJtwCxRKoJIAPKox
#sKNKamC/kvGjobV0g4oZCNTCuWIzVcit2iAIyTY4XD5+aNjuwRmj4RFF1Oj4kkanGxt+UaJ90X6k
#lwsdYkOThBlJqDLFdLl0k49dfCnYwyZlAohdXiHca2RHhFP4ArJMitXKiDD6jg9qFEXG/Fi0G3Ae
#daspbZ+aKSyX9DBrhqd/1UWMgHOGeUN7hoPejhLeKjcgSMhoYsEbSu/5nTuDk04DMkJHE9u/Hd1c
#ibmUc1NGhAOBAJYz9u4XgTXBwws8vBUYLKFNMmHnRoTHwl5ywOBGATyDvqGmfe6hdVIOCy+WwQgd
#nwVqwxpN3QWPStlgXc3sa2t8P56xqdg3jutZo/HUdG4IVEFni6MWFoJvExtjlAzChV+Sl5kWtzwP
#QdY5wgvB2Tw8KsN3o/PL18dHBxA2BLyys3kY//V//p9hwoaCzqpx5X4ypiZ4pzfmpoNq42cewl1W
#yzJUXwURtGyZPGNnix03+pOdT3gzXOzwFi85OuLl1B6fm17+2lIy/+eRgj+a0vj/jY5q/9NudQv/
#H7kkJv/jz4A9kSWA2ouLbj6rSEET3Hy1GgIHpAYvI1aMvGbRBvTPWgEFNpiS7/8jBX80pdx/dNvr
#6v3vFv7/8kkryv8IPzW1GMdcU0tKCHEWcV7QrM7AEloR61EcMYM4saWKE0OG6SoyTQKqIOh2iMCp
#6Js5mwEmuoUpa+iBkdZCnwgjHpvOFvwNPtrwHztGbXubktcRHK93eHJ0Ojo4OhwMjTk6vcaVZcAv
#H6N4wLpGSw/RlXzo3/2IcL/AJRxsnCszfDG696DsnoRxriFjZZyWtWXEGtbD2m1FSPU1JiQLM7I0
#0GhVa60/gCJMEvz3nk/+2y7kv/mk5P3PRf5bb3Yj/n+73SL+Ty5JIeAR4PashevbCADfp2v+87K2
#Faf7b0TU/3E4vRGi8kfzZUBlAgAyj05OLi96r4/7ZdIdQgommMktNIQZO7wNH72cDuhQo4f32r5Z
#euJjDJkj0Ope+lOFJUSZRaCDpKspZDM+U68/bLQ75TimSDg/LVsErSpnDYUcV+3aRncBkz2YYcY/
#GREd+5LIeQW+KpqDO7GoPpMHFxqeRsZngg/nnu16ZOnr9LMo5MSyYctaGDPTB1exsN3we4SX3n8g
#W+BTKRBabrRVYyoeZd3ghRoGZrAkjPmy6dyXeR6WEF6QVxTl4fYO4NuJ61mg96QUPcW4HGUICUOh
#pR7YSEw+DIZ4lq1PC9tD6OUD4W1h0c/2l/8455CS4X8+/J92iBsw+q9d+P/KJ4Xy5zGiFixvRCTY
#gQCgBJ4N864ls2rKLz5z0YjSCuHZmGN8gdHXh+rkFktiqwSiQIOu86DIyEtSlwzqjZbezJd7/gyg
#Ez86Oxg8An0VA0FB8oCB9fe4ZFVul4BtTZ8h6cH6xMQc6wx/9Ldi+txGneLOwH7mywQ3yfc/F/5P
#rRHx/9epFfyffJKolx3ichLbRqK0JbJYeIQzMF4aCuOF3H09h+i5l+VPkxLu/+2mfECsQ/9D/PeC
#/n/6lLz/edD/CNmrqfC/XSv8/+WT0vQPxzO0QAihe249ylv/8XqUzz6JNGXQWI0xugtZlcbQalVY
#lbV0x+Rdz6ZDNjKDwBxP5XNDRkx1xshIJd0sWowr/NKWsKuEMvpnD5XeQ6X38B8ke7eH17D/w/CA
#1D4nHJWN6dzB8q2vdyectHUWLhxohONGFGzTl+Un17u1vFPUEF2ZnYwVRwenR6OV6hw0DlwnQK+E
#5Q0obTiwzMmZMyMtfNguJe6/qGwmbb7AMYzy027B0QU9X1FrENUehAht2NfbVz6T49CRCZ45IucS
#HHNQ7TvCKWTMRSbg9NWTJCnu+ZSfSDx4MKEaIodBBytkSopFPPsOASZWRuZb0jhb7CCyoSxA75+z
#KocXvdPD3uCQMysn1gJCcI0wT+x98gFkE/8QXfWZuXTG0xFDGCJ3Cg3durY/6TQzK5hLKOr6jebm
#YoFQ/dC8An/ldkbo9+6nu4lJ2YvWVQhzo/qB+MaJSoLxaoIxioKCvluO6oIQuoy4/9g3rkzf6rQo
#1/Zvf6v0zy5wUydHJ/3Kj+S87hn1KrHrOCCa0RXgnu4Zc0RfoXfJC3bn9idr8lfjyl06E9O73y/v
#7tIVrFR2dzVV0S6gE4CZ3ziSaRU/tB+p6ZC5sHnXYu7uXd2cLaYm4Rvf2s5kzwBwc4CvCDmVC2u8
#R5ccJM4zK2A/sZwclQt/o1U3P527E3+PMprxjqJv6IBO/Ac+gUoF/UlWZlunb0niu42urGtQu5xY
#4KLzXrxDWlCCO4valrE3kEEVypsPYQ/hbVEoEzbCDrEAgnAmBzV6IEhcAKlwRQNPJI0JDEXe8yWD
#TxhbUS4r00ediEBYKSPocIdAM6Ek/OUHAiwlNiNjcxZKZGi/oOyA76sAnPEO2w69/T5cnuidJt9L
#9ITo2zA/heARwhMqXaNqS8ck5idYN7y+FlyEvj5k0/GVlwC0n8X5fZAx1mCGzpPlAZo4JlDVtSdj
#cgKBLxlz6hh/FVqHCvCvjXAOy9OjGy6aqj2BITnWGF4Z9w41IT+f0J0M1lbtGi6NbWFG7wi4RgbD
#pjVobzBdzq8ApQ5IUVQSo1XKguAuqsIHrE7uI9gzukaLbHm4iQ+ZTMGWCI1Ce7M2NfOTHUx/sq6O
#GIc8M13wxpqArT97HiKUQcouUSY68JDJU1WiQFTRHof7yLocYk5a/7clGhbrlbPe8BPtWegyj62t
#FTd5hxo/7qGnBf1d3n7YM5eTsAvghxtJG/8FTgDBV/0EcETRPWrwTKUYe/Cc0WCje7TPSni2ViVM
#hZppx5EOkVdB67N3iEW2V1YPfRuSb2+Jf46djMWP6HuSUuMYvwEHorg8pQZtv4cmcIf2Oa6DoRUc
#Evh4YC7MsWQgKJa7sDz0XqDFYQM+ctRJi+aDDT6OI8Kg1ufRtgAbiilCJn5B3z6KDyllwX5RbOmN
#587ZhwFBDWFLxVq3Pu8BUKcbYfwa08bQYDGJyFXPUjqpK9RYi9iNwNTM9mYxY00cn972LCyzigWa
#UEs/ZOHsUcQuMG/KWNN07CKs5z5CpZMLW0YUJniIj4KGXcsB6DUps50AvLScVklYjjJUcj865CHB
#YDQ6Sop+RrFbAhj5qcIOu9Ta+CtTKEHzpXMCwyM1URod7LA54NQXYYo/2B59Yd5g+jagWCUqdI1A
#vJUVXiJScDT27eIJL57wzTzh4H8EHagKWBsjeIKuXMU3M3Nm6XHMzFokna0HbOWjvw5zURptPFeO
#FluNK0uXuAItMPbg6+HB8OjQs+8kJu0cgc8JAZ7gTCWEVeZk4jrEZhQsDSpjxya0gmsYkWIoU0/P
#42xgQTu2hpJPJuNx3dAXBR9FiTEtKOozoodMo2xHgPwp0cE/ZxtLYT0tcScoyfVPQedxdD7ovzn6
#eXTYP+6/7V0cnZ3KD4Rh/NQbnLBSF73B2/5FeMTqgtHmtp621bwFGiafuH5a/URm6IDQNeZLFhv0
#wp/4ViGI9+mefSXQ+KPPzn1lgs9C3HkjPBAMW1Tui3ChMu+fXE14rehRHTG9JIELLDxYqyzjc4vx
#1k7J8t989P+6LTX+e7tTK/T/cklM5U28bxpLTu11EzTmWHUmx8jQBCuqayaDbWikvVBGA4hCbEti
#d4BVcBQt6vw2K04nNikQRAyq6BtVSRelHTw0gu1kmHsiOzBx/5Pvfz76f92uqv+Drn+h/5FLWtH+
#U5CeZjcCzapOyEUYGe1A59bEXs7LmkayW4OqzmUlyVOG+vW6tgE7YiSoU4jUjZywwtasjQaexQJW
#AArx95/BlMcrAa6u/9dqdwv7v1xShv1/tBJgCvxv1dpR+N8q7P9ySfHkHwKAgjGIho4Grob4SUM+
#gyYVaqfC2qmYN8CIeELHjeDcDX25MG+Glo+fqU1p78GDUH20HiK1bNdG4qF5ca4Xw4GKrgOfxHGg
#JHoISWLs/i78yXzeZZo4McPP4MpScuz3eLd+m3Dql8wCzLil6cxBJbjSk7v8W23gyYPVi2ZoK+9Z
#0Q+rSGiilZMnphyy9PWmpfNYas3AYgejX0qSv8r60Rr6IQKkFyE8MJXdsW3SKGcZj0ZUR0rzKKhB
#wkLVKBYZTOHHycw6QW9KYAAmHDGqs6nn3RHesTjzGC5owuKIm6k1i6eAhE6HWMY/7VLx0HrJi0WP
#xBor9Nx4SpGeJmXA/x/NBErj/7Q6LQX/79a63QL/zyOtyP+JsokTCnO4lc4qEp+bkHchh8xRIt5k
#dPGk71CB0Ks5l3ruPdtkir//1IvYBmxA1+D/tJoF/yeXlL7/j7cBTeP/CHl0/9vdegH/c0kh2W4K
#IRpGv7sO2PQLOgCYZsf6H0yXHrNxZu6YsVTM36VwvT6iRqwtTqFEmw8lif6OUdshjhF/H2GIvC1g
#zNTZkoouc4fjn8UgNoISHdWcE+sQDTp/amIW+4OxR58SGf0HR9SSJQgPlyLRkrhxlFViOh+jieOP
#qDmWIVgXCbng4hHP2Ah9Wa3iYdt2AjzRESjRfTRlN1I88hGdBHeYu2InRHBTZr59NdGu6S6Vwk4j
#KTqKmIXEZbErTNztFlvWHePVDum1ajsT6xMcicgh4g3gc4gG5r8XqgDvBuEQI+5/GPyBcbVDZf3n
#lndjbZF2xKO3Q5lUpzrXZhquAums8uKzMJAHpuUpnVOsKWXNrspchQc7pYrdDWIauOp2ZNuITFtg
#/LvxSr8NsRuwgfWNXWiyHplXmtwdc1ZJXXLix94xg+ha07uM8sQARtSNfYITe9kmElrWXDz0XXux
#0wcAnl6JGV8IAcD9NiqGdQFg0+VYE9TDNv5GHXTTksnQQss3UMFSnHqZ5y4DcP13hbl1InhJgl24
#FtM8C08uWtQwcBXOpL2HDWnHRVZD68dPc5G1G6XMQ7yYSRPhEXJw/ZjoONIGJwfEUa5xdEGAo8Qn
#Hw5L+MgjdFDDv9i4D7qrl7Y2Ct8sy3OiBETRnVIRvpBhi13ySQofaU3quT7zcLPA28TxkgbWGjCp
#+vTe7tPx/8frAKbxf5oR/3+ddr1e4P95JKZvJjp2F1XNRAgmqKdhZTsEfRIqhMBJEy5C1Q2Soj5I
#t/3bD2rACeohIUsT9AKyNp57sb/AlH7/H68DmMr/bar0f6fbLPz/5ZJW5f/yO5+snVdniEi9o8Zf
#p4/n6hpuIWKk1r1y3ZlUE5N2WRjXsRP4A7ju30iKv//e5Fn9/3UL/m8eKXn/c/H/32q3I/xf9AQU
#8D+PJPBv/bk5A4cjEI7Gs26sT1vlX3+tbiGC1XP/hTO3X5R35DCW4xmimbY1LJTJFUPQYqO2E+Ar
#uMkRnN9E/N6sysLMEDNeomjRaS+L1PudFDw+Y+x1MoKRfwNtZItpK7nc5wtiOTe2Y9EiYrDvsAh8
#YHqMrpitKSCGAaeMAiE+u7xWXE9OnIwSpn2d5dhfeTlSliJxGRKXIDE8PSbwSdwkTOEoU3/mMOyR
#M6s7/OjuaQPbhhqt4r3DAgpYY+X88IUnf4xCl1BhruD9SQYJxr4GTgiMSnCGRGT+Qo+hCzcwwIiW
#JKUgLyzJIkWpwXaZyzeWL7p9EwOJgA82QZ+Z/UQ5CzRiRAAxYMB+Qo7mlMGtkEFeqAatgYeS0eq6
#sX2x37eR+bshJ7pMNBPGiynp2T11KmhfzSjiSxwvoBJUHcKz4DICE3lhebY74Y3R/Il572M0eWaR
#Uuhc06AfhriuaNlv7QU4aDJnI98xF/7UDaEXc/cgZ4+k0ymdc1wQq2kuFmgW9hwMf9DJmN0rc47k
#47Aolofg0pwEt3R8+2Ya+CPqiQPV+zcikcDv26qvjHzRwJmBPTaj/EKagc+/MEvxtErXmhSX5RrG
#vxt1omhLcoEBQsDr5Co8YmqgTtZX9H4Kq0ZbHCkl2PuVUGQv5pKve6BTDmrsseLHLuaAPN3pyLpx
#X2zs4mT8Px/771YtEv+3U2sX+H8eiXFV4w23I2DFnEwAB5J4sugJzFATv5QbCgEsBmvBsInNQMMO
#FgdCiwNPOJzIc+/C86Xk+5+L/Xe924rGf2kV/h9ySSvyfwnan7FYZkvxEHzQQpQZ/KjQw1mtzkVi
#b43QsCKRu0Z1GXnK0sDkqhq0bvTG79nt3tuK2bpAVWUK5aNUZ3RT+lZTMkruRJqrbyE8LLDvLC0j
#XyBFMgy0q8ySEkWpAgSCcCrhiggWn6HXSKAjHfa8xmGJYLCZ5xF7/+Phv9/cEPt/Hf5/o9Mq+P95
#pMT93wz7P+39bzZqqv5Hq128//kkhW3epEY0Et+QfFJ4hitx41mzcgQMwvvUdyVVE3XoSBQJ3s6M
#6ZxzHoBUgFrKkgL/hrl1OKPEHbdHWuINeRA/wB7zQZOx+EpDSZNl1r9xim/ku6jHSedvcL5hdA10
#+peJC0yVMUtJEYJ/5MzdcqNWb1TqtUq9S7jUQ26sLwQQHooW++e4zxN4lCD4C2Os96+vrTHlz5R7
#gGWxnHPmiwFyvmVfe5yTuG/Ipv60wICtM2G8aJaH2uwTlj2P8hu7QRQ/Rc9urLptWESzTQnHNKyn
#D05NgiKjefSpT+CS1s1AOFYw/AV/ZvaEM7Mj8atXvEoQBZp51MCYRUwfV/cjhlGw/fd9a2TObiCA
#9HRuSAGyY72mhnMJg2FvaPhcp7k8vb+xLYf6xtCsMpHb2LPA8nBkWzz5K4ifg46ki95CK7BGPKDK
#aLmYueYkFE8hrHNkXoMiie0gHNWkgqpujHwMhhin5otDUmM81vjeqKVKxsIp0mDWbCdi5hiZpWHg
#iqbkrpdMKTokms2rOq4zXnoexHagJ3ukbU0ol9KweFCe+xH8E6dE/G8z7N9U/m+9HfH/2WwV+r+5
#JMZFZWhfhP8qQ17yt+TwUufgMvosF7f8y0yJ938z7N90/f9mXb3/7U6h/5tLWpH/K2LMq7PQBDxg
#dS6aSEQ9huNVJDFF7z+6D+ONhf7GaXX+X6PdLvR/c0mx+3+9nM2K+O9ffUrefxC2WM7kifU/ai11
#/9utZqH/kUsKLM8zQQOKMF3IfgP7rUxcYzz3+Ir0tCn5/udi/4Gd/Sj3H6EAxf3PIwn2HxEvaoYQ
#7clv7u3tadzkPpTj3GdYkxuN7Tx8HV1DmOqRvfCpeimzCVzTnQa0qXoBIQxoQssi2obYslJPRmSo
#qJFqdRf9n2LwWo4465WMVEBNRMlhxtCggMpmEuZybwHcERC4dhDkTGlutYV58Kj3SfOwbv3oHHQN
#G4YQzoEXEb6V1IDU+wbppErXqho1xi7RcNdctUOI1QzfWD5VNpHyQ7V+FkXBUJsgIaPFUAlyCzxi
#NIuHEG0BB4yW4jwo2fibuOzgxAoCtEvrbkRXnhoRKZx+VtvXe4FO9qusmGYYclDFWCMNtVy4oZKl
#ULRBajKjcyOkbD21jorGLM96TCTzILkeC24TH8VHp9BOl/tKUbQBgMIOm3IdUFnZ6EQuyAvJNifc
#ZkS/hJBdEuxH1D7pcRixAn7ouziEwlh6ooxCtsKIWn+Eww1tP5jWkqYUN0vQ6c3zUiTLcT+KF0Ly
#1xl/H/ym5jpQMbrkWVxw90xl4vKh5KJ2NgDPurH9gMVgjYWEYw9DQjRT17fRmG2L3XXxEwBCy0LH
#CgcK5nAw/ISbuBHNXEgT8EkclRwuIW5UvFQcPBBfm0gYvNg7EuNCWgTrkiNpwfyKlfsMe0UlrzuG
#v7DG6JaJm4YeaPhapV6ojf3v2WiYG25SEDvhxuI9HVJBbCoiOWFp5paVD175Lq753HXwNjKOZNyq
#j2fucvLRDMZT3bpLiz5zWTRcmve+LEbhZf4FsZVeaDIlyDuhATkD7tjM9OYjC2E2s7BH4WOJlQmd
#pX1+2KFRv2FfGOCAPUF3xd+SHpdtcGZIpavoQWHfHyrjxRK8nQky2vCEgOD+p+Hu4HBY5tlzC7Re
#6MzLB+eXl4E9s38nEnpeKpginG/qziYCQCGTQf2FwmV7DsqcJFbHZ+PwNY/dHWvsJQy9TMXEghxa
#mhlA5EdM7Y1nWTSUxhB7Kc4wuWtUB96Hb406p1c2PlvDcBcQbNj1yECPLd+/mJrOBRtWmS8L+++H
#arW6vQ65nkz/5WL/U2+2NPY/hf5fLik9/mPSc5M5AmRMI7oYkClBGZWWIqVXCsaoNKYpL1saiUiH
#0gbL5H+INenzKVd8Hz62ANLlhxRBcypBpy+q1Jz4dMqNRgh0sR5HPanlk6WMiLz/sLM70mtDh8Y/
#7ZHnE73+7BOP5knobm5VBtS+hQh9uZ9/opJb5Z3yDvdTCQWxSZbox3I70tQKLXGfr2uBxT9NSob/
#7GI9bfzPTk2V/3dqncL/Sy5J5v971m9L4J8Izh7K3+8b9Sr486KkFC3BjwbTIP3oC6iYoKg7Nf2p
#PXa9BZwuhrkI7f/v741OtdNiqqP4n2CW2hgqom+sVW0paqhsqJg7WaYTvQl9WVBCLlQjIC7HSfeM
#80j7OvdcUEmWCQZIQ7g2BF+Dq8PGdmI6CJqDKXkZwgjDLZNH9+z7n3T/c7H/bDa7qv4fQv8K/n8u
#aUX9H3JV0tWEJPegCQU13gD11p8rBZ5ZJUqxLuhwQsmojaR+vJowwAkFo1F/k1qVgvwmF1w7jLHI
#H8toSCswzFLHJyHEtBxE+3GxwQc1SuFcptA2kvMHQ9Wvh+3tkjSXxOhAqbvMGSrJY2N8eWls4UMk
#Dpgy3IV1Jyxk8pGXTJ1HlHEcNaKVIyZFLGnD5g1dByrnPH2xrjJfCJmLnqW43tI3vvWobS89I2rJ
#9S15RX74OgqQIpMsQ++v2jHVKRsqi513FDJmD8v1qChZot6nJPRdZ+GiHNXUIyGwVvUTfe6n94tI
#sfjfDFwhbUYBEJC6FfX/OkD/Ffp/T59S9n8jCoBp9L9G/69TK/D/XFKh//fnTin3fyMKgCn3v1Fr
#R+Q/9XatuP95pM3o/21Czy5Oyy5Jxy5Jw07AIwu1FWElo2orxOw/bUyNGH0VZed08QAz6I4llY7E
#jHlfA9ULTqsKvn+pkum4wXQNo5pfYiFBp+sKHaClqD8nliO5cPYmc9vBB9FXmhNyYF7+lLniQOdD
#LCfnwJEdY7mlL48wKlWkG3+PC5dCz8bhffWzCxVR6Q/aK28k6OcU2MDXl1Le/40ogKTh/81uIxL/
#t1XI/3JJoStW7PoFNPc1yg0kN5Spfw1aEc+98l9GSrn/G1EASLv/rY6K/3carcL+P5f0xcn/n0lm
#j4/7H0Vov8GUcv83ogCQcv/rraj+T71T2P/mkv4o8n9G0qW7ng7JukyNEtIuizPeRqtaa6keeUOq
#L6OUXKb/1nAC/KeXzG9W/v3cF/CZkwz/b8aLTTp+oQmA+mryv3qjVcj/cknR/Wccv831sfr+N7r1
#Yv9zSfH7b3qBfW2ON6ADsPr+t9r1ZrH/eaQM+/9oGWAK/l8DZ3/y/re73W6B/+eRQs8dN657g22e
#yLaPGMduFIoeJAfNzFBHI1sSRFf3YTjV8BuRrs1N7ogAYbmHZwc/9Adl4v4D4YMe9Q3NPDzP58sA
#y/YocU/xOWwwMJ5ZpoMQSeLffDSBQS8dQwhwKJUAcZrqNxpQ5IpnjRG1T0h9c0x9O5d/6PfPqVPl
#uevDwowFP8g+ZzNgLFv0dSKL4r5M7kGG+/9oGUDa/W+0VfjfaRf2P/mkZC4+tVUm1/qhQi5mdXF7
#U51Yd9QmfkG4a0QRQAjKxmGG2GAGIENcBksA5Au7M19TynD/H80DTL3/HdX/V7fWKOy/c0mCf11y
#jzfFAlQhQJK5jpY9ZcTGHivAweZS/P3HDlP83zbgBHYd+q9VxP/KJWXY/6em/5qNetT+u1Hof+aS
#IvQfBMFZBtboZuZemTPmKQKCWBEfbgRCq+7PJKc26NCUsUqkh56AUDOv/OP5wei83x8cnb7F0dxJ
#01R9D+UfnV70B6e9Y1zZs67tT6OZ5dwEoIJZ70CvRCFQ0ruj32QvlHQuVEwxomVoMCaHhKyXiFm5
#ZXFmYh+h4CNarkyzwr6qZBTmAqGzaFVJ8HasSTMZLSwL3sGRZzo3WLnzfeLyMwd6eIE/6Of622zE
#JSRCVPpwjqu5JUxzTChplkqrxZkAfDjpXgkn1szCpl0ICwksRnpjGh+vehCg1eLifdvy1MHKQwhs
#ameJJYG+/Xt0x7hrJ64CSkuDExi0umodznFAB/fOtGfmlT0Dj4SC8mnYKPfN93ejPOi/PTqDU23s
#GeX/eUbPt3bKQuB5NnXDsBfaCGKQcdfiNXDXhN1BcpnLRXay1ZPMfS1QIZy+D6F5/WrzRQFDV9uB
#MFqjwJ5bwCVx0f7eC3MCSBv4H+1guhU9BDtG+fxsePF20B+Wt2mLV7ZjohbA+E83kPQWT34Z/udx
#eZt5D6NTDQ0JlYMFCWWi9w5dUVKYKV7LvhfJ8rH/kphfUlC+LACIxuWLu8xgIozur+e6wQr3V+eJ
#kkGDkP7WAgs8ntAXJVOU4X4sacxCrdfKqesHq+0JXI1v4E44y9mswOifK2XA/56e/1eL+P/o1Av9
#n1wSd5W2mkewVDii8xHGniT0otHuvjh2+J8uZbj/T83/q9caqvyvWyv0f/NJT6P/J9kBPt7Zitav
#SowLFTlm2NqaYlIzQE5k0dSbXFXG6Dy580q90nzVqimae1G1RCPOa0dNqyiXMXBaV66scYxiFKHT
#ioRTPPy/GVvPF/+r1S74v7mk5P3PJf5Psxux/2l1W4X+Ty4plmdKnT6ViS858nbQb8Rcex+Mt9Er
#uCVxCXHhHaO2YzRr28T+Gp2vexbcRiyLY7CUtfwPxgUNuc8Cq5ZZ3wvGPDrToKR2tfxRHQ9UZOrR
#vubmeAqhVhTGHy8m5qPiv7tOYquQX6ImSzHF3rPegdMCHpI/jhCSsVgAOwmYQssFwqM45gJm3a4b
#YCMIpuaEY9XP7N9Bd94z5yG/C0td6Ujw38x+C7M/oxxShj+gnVxMKlfmDFZxIhpHhcx0tMqB5V2D
#N35qNYAN+AVuJLfoL1GVqzHIAyS9L9gWVGIR8q6Us0EjTJMf8jjmVmAChslNwXx/WoHICZEVpscS
#bDMArXzYC3+HthoPZJpXM3d8W6HS8gpvEjUCy19mnSv3iI6Ahn8IGXFyKRyCqErCQeABj90FEQ+U
#MTlWAVgNqnM49gTpZ2pbswl4VuOu+8T1ow4xcAAdawQHQ5w3597SYnfBYq45gGox2NgbHI8njL6h
#qOTN7GtrfD+esb23bxwXDWA85QIPfkjf1z5UIycUf4QD+YGcjQXwk52JLXGnwy/hfVI8L/wbNqAh
#xS3PQ7dljs4JOfTl4fDd6Pzy9fHRweiH/i+G7XPzRuO//s//M0wIszEDNsWV+8mYmj6CWOj6g23g
#3EJbujCDaVWxW1xJn3Jkm3M0HkDgQcAGboPx3OjhCidFP8hal7Eqlzp9S/BnHx53+BVq+AhG2uYE
#DQVfHRgUK05PaY8cUnQ5Uk+vGhaOVZB9VkjTl5yzCLzuwPWtYEtwwYLZ+dRCXGR3h7PkM6RtVgk1
#2QNjLWF2ec2MShLIzPjAozbp+Y0/fP+T8b9c4n/UGvW2gv+1281C/p9LYvxf7tpBq6+Z+OaKATco
#gih43VRaSnjwCsbDM6Tk+5+L//d6VP+7DeyC4v7nkFbk/25YSRSIn9RCnEpILSmSXln4tVajAjjz
#xPQmlcbazNqWwqzFaGuW7onpecX1Kxi536W/G61aqzIL/Io5n3RUg3NGoqSv2sbszNMVeKM248ZK
#/qEz2IE/9z35WlMS/N+UDfA6/N9uo+D/5pGS9z8X/m+9UVPx/4L/m1dKIWSTFEijHlG1SXKTKhuN
#qgUlfsbSsYHTxSjqmXVnzUaERRjymugLRzmHCw8VcgKdqil1TvJ39Dw7U8uzA4i2sodQAAd1glmY
#ItNq5C0554oagjKeE32Yyr0r1wuOHKCMZlZgnYCQdWF6weVi5poTKZpVlHFF+E/dFNZREk+BzCey
#L6K+jj5+L9PKIbnXJJ4vXZ0HibOiHUWMkmAy4+JH2/oo8ZXAsfBsdonwGL9cPO7PmZLhfz78n3oj
#4v+7XcD/fBLj3OCgMImeOOPBQeiVk5knPPesipQ1Jd//XPg/tUZLtf/twD/F/c8hrcyyWd8/HJOE
#ruM07rmX6atNCff/9jn1vzqF/lcuKXn/c6H/W61GlP4v4r/kkzat/4VOTVb1L1Q0QQWMShpkqjcc
#SkRB4D1+Tij5OXNvbsACF/37E9D6XnlHzA61VqpzC71F45RCd4R+lbKxm+SJZ4NffDb4E6pwVP2o
#aS9O2wIKfcBv3kLyUx3qfDDdDUXZgelobFKNYew62PzRG9GAu0kacpJanMLZUZg5OB4tK+IznTYQ
#/3woRayvI0bXod5YmE0+Epfkc/cOYugSP+C4qwVCJkIuEdUuIlksdhBpql7SGx/TbNqAYL+JwKNs
#+Q5W7ae9i6Mf+8DggO0HvSDuH10o2Tv8sXd60D8cHfYueue9i3fUo/rMAvMpUI1yrBnlEbFf+9iA
#+PK4N+CaZTAS4DGhawjMruBe1vji2XQNyrKbpqp/N67aE2yczpsEi6wZ2x7qRo0NhAZe9rH+FZjj
#Ypt1cqOxHiBEGBaxPl9fNjymPu+XWYSxTnSqa9yQGS28L+1KpIjlTLARsmQKPTdx09haGhw1j7AC
#X6itSTomoaWIJe89Gi/CScs0z1wGUwQHfrcmzI6X6SiW6UgFYEQcFmwpEYG2je+NmvF34339AyKW
#33/gfEEwROZcQd5xOEy/zHMj/Fcx4hAvo7aJv4Wz3hd++BySkPRQEv+NZ0uGMIJfNT2UUBwI4IIl
#fqIELcgI1CEKJjhCFIcrqt9/sNP3x+YMdA/JbGE5hCtOwQgNxE3Pwqe4EuYntv+Chh/lAKOeQGvP
#tD3ZDwB8Xy5uPATHFfVH2olwmlW1YaFvqikseCugEauEMhE3BVLQq6gyrqp+mlXj1IXTPqJ6p7jt
#9+VpECz8vd3djx8/Kj4tdqH0bkQ1VYZDTA1XVezFkBSN/e0P/dFJ/6IHUFHim6eotmZWbs2ot/pl
#Omh84pSM/+fD/201IvGf2q0C/88lMf4ve4FDLaCICqAWRmPsT9AAZO2wp1jxJ8lACcdQY5pl1WWv
#khJqs8oo41Am0DKXGv1zXf6/pN3/fPT/6p1o/LdOIf/JJf0B9P+yGpMTijA95Iw2ZIuxksKaQDVk
#0ayrdxvVeqdaq9Z2G68UNTuOAa6qsKhqBopoYgatxWZNUx3sC9Kr1nU1zU9Z7Nr/dPD1S0/x8J89
#lc/k/7Nb8P/zSBn2/6n9fza6Ef5/p9Ys/L/kkoT47yzGKtMiI5LeOD0yrDfG5bzfG3PLu7G24OsO
#qs+VyOgfD9txOm4RcUOcHSCJSk1zS1FphKDsR3O08gfuxJLNd3OWipERaowUq09v60cbEpT0Eg0X
#5dprzjTSyiSe4xQdn6xEKCa+OmhYnFI7opAJ9AcVY1WhXmS54PxKxN7D+5A96S/MsfWwK5yPD5nW
#i5t36lVkiWEDLesnntqU08qMSNe0Ps06vOcxTyUdbeLErjbbVY5tZIxf7qldAf5neP+fPP5DO2L/
#2621i/gPuSSZ/sfnKZWC1rDhvjiFsbWjjCpQQiVqZbdxf3wttfj7T9kuG9ABW4P+a9UK+i+XlL7/
#j9cBS4H/zW4rov/fLfR/80mxLrI41zWDhyxJEQhLxceeBQoZoeaOL+hkeO4yiKrSGFTXhTjLT3Tf
#FTabzYGXzldYXKlQZSkmJIQR8YpBSwpKC+CzH/QssPpLtA+qbSL4Q2bOgiTzNlEXJVSpQaVxsxrl
#E6wXJeve+HpVE1GHBzObI81Tgz1I8my0hUNNkiS9EbJcsP2KYpmojkFl9Y4ZGH836saeURMtDLVb
#GbNzqRuVPkoYxpojTUjyJHBHKeW1gyO2eLUPqSc7/oxj32pM98sauYuIcSborV1enI3OTo9/AbKF
#LJdwBfkh8Efo4sNiQJXj49Hw8vVp/+Kns8EPwxH8PjofDXqnb/vD5Mt9bXvWRxNcYZU/WlfRVXcX
#ljNCOfFrrugdQSuR+5x8NuiC0rmGQVrKtSr+324NO2BDL8cNIrep7z7JUV+JeuqjNw40C90x0ccL
#xgui5rJwvYAr2byqlXeMcqvVpK7dMi6R709jlgjlZF4iaOXLX6JGY7W1MRe2vDbJynnZlgoa3cxS
#qTp8m12sjniU4t//dPzv8TpAafR/qxGJ/4DtPwr87+kTt/9kwHyS6ABM84KqLSRoEMXdDaEVxdlP
#TBPh66MbCW0jdSBqK3Qsz70luab0+/94HaCU+19vNCPyv2694P/lkp4m/kNmxRiGLNQ7qp8rhYxZ
#iQ8ntBPi6JnDHwi1Ga65dl2Onq1Wd00dJQLq7IkYw031kYuwCCAut7B1P/TARLtCnwgRGpvOFvwN
#gb3wHztGbXv7A4nMFnGk2zs8OTodHRwdDobGHN0o48oy4JeP/egGU8vgbACMxVgTI3ARvQJkK+Te
#Lq8sDxVBeBHCr6rlVLSlSBtKUfiPDds25foLp9X5v412s1Pwf/NIsft/vZxtIPQzTqvvf7MN/N9i
#/58+Je8/CMMsZ/LE9h+1lhr/ud0q4v/lkwL0lptgtkWck5P9Nso3Y0A8ijf4q0/J9z+f+D9R/1+t
#bqde3P88EqH2FSMLylpFiH21uov+T2EJlBUmaZx4TRE2YGJDrHG3GDPDa0GUIob9lmlAg8VxAZNz
#oR34yRoKrdC5PIwapXMTb0RpsVkzXwzJ02aeG8qikwah+9BRgyCAiY/OwbOE8By3lrUYYcfRbNzC
#F3HEkkZm3IABepfi5WNMiVd24yl0wn0/JHZya6kHgcs3BWNCZckS10wdqBQ7SQqXJLHf9w0yJuYy
#ohoyM0vMe4QRUzQMQUSNtuPts0UDGzE7NM1mNjSG0gAxP2d2MpFcbHoukt8a4YCwOyxoZvL2sPCt
#ZS7/kAUgPPRmovgjVnKeICxP3g7eL28kDGQeBhuP5o54FrBDbNGxBi52NYKPJWodT+znw7xwj4RQ
#mmG2HN2dBcyUWmAfxZ1gKpLJO8FLscXFWnbS6G9f+SOeU1J9eAhLyqxaZaPV8ErLi8KuNp811e7l
#+Yp+r6L7Fq83Kwe7p2OjoKnw//hHSsn4Xz72/52mKv9rtzuF/lcuKd3+X4E80tue2fA/phFWWGxI
#xsmUBgTnWeQPsaakaaxUZKYKGMpKlaLawaxqFEQK9fi7RMMgqd5z6VNLu2el2WOrfAYlHt4Oeofz
#o7yT7z9zYvW0/l/bNZX/0yniv+eUZP4PC384CiOul7/fN+pVENRRkoKW4EeD0mREts5JNI4OQRNT
#05/aY9db7JJSLCCj0Mv//t54VW0owRS5DzWq5CNHR4yjJFRHUcwx3My8smYCESk1Q1FcsII0wTsY
#jAmuABkRcQkFxkFYrAd35SuRUSXf/1z8fzTa3ej9rxfvfy7pD+D/g7GJ0gfH+EAZVQ86LaJ7EImx
#JbKMsrb1irj3qK0fRUvg+GRwpdFQ/Hf8wcysNuGFJYqzJnmR0fhZSSgZdaTCdyHNbUpSQclLir4g
#Z4ckb2X4dgq7BpHhlGOaum9RBou8IVFtG99y0JG27wSnh6x5Q9cBYc2krnvIpklfI4llk6U4Y99I
#Za+Ixy/xDoqMmD+DrWDs+z+zb6bBZhQA4FFfUf7fabUL+X8eKWX/N6IAkEb/aeT/7U6jwP/ySIX8
#/8+dUu7/RhQAUu5/vduK+H+sF/Hf80mbkP9nlhIKGgBRFQBu12cIzpu5JZv4URSVJkpKC/G+VrwP
#VGCqdH+ske4rOy3J9VMk+8myfUW6z4XynP6IF9orftWZV//woyIS5mVCkTDeBnUo+COMhQbcljLZ
#R5ofxtkW8sOPyvkQZyTIM4TjokhzY4QYEamuXmKRfP9T4P9GBIBp+F+zpeL/7W6jgP+5JG4zh2HC
#yF7opWc4l4aJRYX+OPK6517fLz2l3P+NCADT7n+7puJ/nUa9oP9ySYX8L17+h6/AVy4ATLn/GxEA
#ptF/7VbE/r9e+P/LJ31N8r9C1vaUEQ9CiipdkpNRjIM3ID2uAyW2MhUMqa4sgltFWPs0orDnvuJF
#KlKRilSkIhWpSEUqUpGKVKQiFalIRSpSkYpUpCIVqUhF+hOl/x8b1znhACgFAA==
