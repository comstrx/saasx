#!/usr/bin/env bash
# shellcheck disable=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
set -Eeuo pipefail
shopt -s inherit_errexit

INFRAX_NAME="infrax"
INFRAX_VERSION="0.2.5"
INFRAX_TEMPLATE_SHA="5fcbadeaaafb0314237a8e03076cc8c808c603f9aebeacea8f5bf0312b96ee51"
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
INFRAX_VERSION=0.2.5
INFRAX_REPO=comstrx/infrax
INFRAX_INSTALL_DIR=~/.local/bin
TARGET_DIR=target
SHELLCHECK_EXCLUDES=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
SHELLCHECK_SEVERITY=warning
NEUTRAL_EXEMPT=go node storage
FORGE_KEYS=TARGET_DIR NEUTRAL_EXEMPT

INPUT_TIMEOUT=300
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
tool_kubeconform () {

    local dir=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"

    curl -fsSL "${KUBECONFORM_RELEASES}/${KUBECONFORM_VERSION}/kubeconform-linux-$(tool_arch).tar.gz" \
        | tar xz -C "${dir}" kubeconform || die "Cannot download kubeconform ${KUBECONFORM_VERSION}"

    tool_bin "${dir}/kubeconform" kubeconform

    rm -rf "${dir}"

}
tool_actionlint () {

    local dir=""

    ensure curl tar
    tool_certs

    dir="$(tmp_dir)"

    curl -fsSL "${ACTIONLINT_RELEASES}/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_linux_$(tool_arch).tar.gz" \
        | tar xz -C "${dir}" actionlint || die "Cannot download actionlint ${ACTIONLINT_VERSION}"

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

    curl -fsSL "${GITLEAKS_RELEASES}/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_${arch}.tar.gz" \
        | tar xz -C "${dir}" gitleaks || die "Cannot download gitleaks ${GITLEAKS_VERSION}"

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

    curl -fsSL "${TRIVY_RELEASES}/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-${arch}.tar.gz" \
        | tar xz -C "${dir}" trivy || die "Cannot download trivy ${TRIVY_VERSION}"

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
#/9XD/a39v4mi2P/VAlfGkQwKyhv6Fx5lT8nYR5uJpRoBAUg6/9/em663jWQJovWbT4HmdY6lbJHi
#TqeqlDW0RNvq1NaklMs43SyIhESUSIAJgLKVLs03v+4D3G+esJ/kxokNEYHAQoqCnE5EdadFxL6d
#OPsBXxWI9hmixxecuqBPxFJ1AoECwfPPDv5ImqI/gLJBRDj2ewG/qa2qscDERilQMZvSHRthvVqr
#1hCduAgdZuFPhZ3puklz/0PvzxvqY3X432y2WwX8zyMl7v8IfYSwQtVg8Zi3IAX+1zsN1f9bu1sr
#+L+5JPDDOwG3ChCLAe0+dk5cNirUEbjoshgR15Q6NKrUHqkKnB9eGPz5wt+lSKMkfgZpFkHvqkxx
#c4fgtjOeLSfySLD762gd+spUrmhARjYgypOESrZz7ZmfcGGXMPqSukieAKIvl54d3JMpsF+YFv+E
#lbu9pdPzT11n4LoBV4rEHy99UNcUQjcAO4S4X8b5lEWrLXCdmIuGAWHIzj0Xh6jGRCp5PAdLJ7Dn
#4C8D+3RNnhtnzQ3TJgnWWB/PPfsOdXdj9cF+kLIyWFCssbkg9oE2I7UnnrsAldbj4w8p4wArctI1
#YwoOzs4uRpfD/qDEPJ9DaDuqBgsE/w/WPeV1Q0o9R5RNwPShbyFAdNiH1Ot5bzj86Wxw+NQ9837E
#tcnx/ifCf4KoPZoUSIH/3XZDjf/QbteL+A+5JCUcKd1xaorC4OILDP739pOh5wtSGQeSkJojEHwd
#OSM4sMd9oxtE2kJZ5DEhVw8PXxoUe2ogkoADUSadwGgReBkGMaDTpDzemDAUUDxwf0GHP64x6sAe
#68tDQ/J8LjBbnYLGteVbm1yCqOgLWqeLwT7KERjWFX01Nyf6YkEu40RfSWItcT0571ZYPJYSkJLo
#6idVgwfZdXDMO6X8BiRsiaMhd5YewWPbufWjcWijZyVEbMTTUq/JUT/B69ZBigRvspzLi8PFdwLy
#gr+oEUVDGZ7x3p/uGLuUW8DeH3+qWsxYzp1O3kcGAkIijbQgDDLygmKzkUAjaktg4ZfYEg8343ra
#6OZqgyD9e90b9lUTI7nVf7q2Y5TR/9jVnFCTLj9LH2eXCWPeBUZLwsqd9BPqBpEN1p0ogsZJp6kT
#HW+0ngYNlRppRRtZRapTr62nZlh/Gy13586Wc+sES2vjz6F2qRFIgmrE3U7ybtBbkNJEtFSaqH25
#mLnmJPaqskNHioHLueQ7qz0S9N2MtEUrpRyOxOuNsOUf1j3g54P+m6Ofk4EDHTIJVJ3lwv3Q75+P
#Dnu/JF9q1u6tZS0OzftMV3nN+0iid71ARMYODQwFOFlkL9AqJ3UOY0ZN6IpI8yIdJMxGCd8UJjSA
#kKySh0DIJYHCkhMZIZlQBZXEppXordMWdjEPW7JVlAeXKxxaU9u5XW9oSj4VICLtxsAPTXOUirB+
#46eM2M4bZdJSObpmPFx58CMucjAzbc1RGMPnOOxH3W980ma+5hQixDC4P7S9PebRW6kUPZ7JUDgm
#3jGkKOLImsi0SiqhwEmEc92CZSIY/McQTRGyCBgFCCXbZYe+sqAYLEA2XCLO24NLrYONc7An3sfI
#6c6hNUO4M/0xvLUXxL36wdQa3xJzYYY4E62hE3eC1THBYhwbYp85Y2wpLfopCw8MQyFJZnUcRrRX
#Li2/qHRDaQ1tKz6Nb/8VxD1N5P+QU/7U/J96vdaN8H9qBf8nl5SdvSNwiShAi+XrHDDomAKeQti6
#JnhiTQtYD7DCEdpz5U7uRU6UMGQDjwHKoV/MUQphYEGlJE6P8qewJEAhJ4LvrGsCDeWxIGzAm1mN
#5z7GRVozJcJ/xwrQ4/7k8L/TisL/dhH/K5cU4qQMMMxdADPUzWg5uwhAhHoR7/Mhp/uUZBG2ZzIs
#fDyje+FOhgi/HHNPW3Ngux9LDOAMrF/cEowXlK4B+TxycFQzQDtt8icLf3AtEbSV6AhYwiPpf1rg
#6GiCz5ywKhYS6kcXITpcRE6Z2B3kkepUizkiwzMK3P/wXcfYAra+GfA9H89stHa+sQWRHAymyV/+
#xqcURJksxfb2tkgmpc3uWMNohwVjYvmFRSXjwjpDAm6qLy+iF0T5rbQ8l+rwA0z8lXGnQ2HcaHVz
#uGb7ypNQlBHoKa7yk1PNMpsXcdPJ8X1NhP9UBvHYByAF/ou6YaH+TxH/KZe0OmxXpbdPDcPjXiiq
#AURZS0Tvpf8pAFOj2SmBkZbwE48KiHzbsyZG2eR6qlSj1bGsiQ/xA5niKlZNxa4hjRvzzkI/y3wE
#rEiIEXOuky+BkmyPi8SCEuAF40EF44UATGIhIfNYeR5XSLP/yfefavf61qP0wVPuf7tRV+9/p1PE
#/84nPQ3+R6LIc0ARKok/NbCgL1aEYYz5fVih3CcKBf5m0EJZ40DVNlA1DbK1qaJJgvaiUirCm4U0
#Bs6pv5zvAoUvC9+B5P8Xk839y/CnZqPdQUVZi6KKQhalFlIyTfEAHaM5dWH51kPI1jn2Nsv1NzpM
#eyOrcoIgMNSJOivac8WXNYtKQgSlZGJLqZRWABqjNFRvRHuICB0i3SJo7stF4MtmO4Rgvh7vEWSC
#nGWGZXB9VUoYEc7GixzFVmPEK7FSxqwSxhjxTWRQnnUt8QP1k8s6ML3cUqcaKiYNB1RSCxUTpv6g
#KAw8y5y1HxXiQ5xgiFSwxG9TLAIRloU4w6io75977pUVfyRZA1Aq4XgSFSPbnB1aM/Oew4Z6TSqz
#kCGHlDuz76wnH08ncTwNORfU35aedTEFk2R3hh7Cjnr3VhI819Qd0AqdNZPlJRMmHC9J5vpdYBRm
#SEmQIAuHBQrCR92p1XDMdX1RJnh6X1BQ1xc5oGfO7F4j9Y/clMSRRWThMYOMEQnHcvgjI7kLxbpM
#NZLTAVE9xsimyPqFKcJSWkUnMuUQMioyZSurOXiq+FTqQNuuRoj63MjwnzBp6D/CLtygAXAa/7/W
#VPn/zXarsP/KJREwUi6XgOzbY9HFShRNRt8Jx6HdajZKS2zJ9N1335Uo/wMXKIXKux9KGD+FP0qA
#JoKyDUe08K8Sexz2DHzYSqUFe68RPjIEhyA0VobQb0nw0QVtMKhSwupBMIyZOzZn4PoEHP74OAJW
#vfbWRmMjjG08JJUvTEZPBcO4ZUoxkT/YKLGTkgpqxbtfuLYTYPg9uapOSiXCHIdx8NgdjPARvEvV
#jKbxLfwPnJIQDs2e4WJ3WiUSDBHr9uIxgq990DukAZSZsiA4eCphoA6vIFViYop8ZL3CHSOPUbgn
#8JvtRgiSSTHN8rEFbMACPvfxLNITJxn+0+h5G3YBovD4M9h/N+q1wv9HLkm//5t1AZIm/2k0Vfu/
#Vq1ZyP9zSVr/HyyIpuQCpD+5IX4/3pJciHBvzLBGKmpgx7g4Hhq27y/Bp90ODjVL1JjBr2Xh0uNL
#Tfr7v1kXIKvD/1a9Vvj/yCWl7f8mXICkwX9Q9pX3v9NqFP6fckmiFwa6+1XPXQoxu/zQG4jAI1PK
#4CJYvcZgujQlUcSm13aiOk4JyjSUm6RRb2JKTe+5weSOUY4oNqnDJApOkvsSnLNt/MtYOvZvoN9E
#/VSARD+cVW82k1w0PJO7ho2ntPsP7k3ta3i111cDSrv/nZoq/+822s3i/ueR6LUG4Sa7M8HMp7Ho
#+ScIwo6V5VRBPxyPCtGk8SQ1z4Pw3Ohl/kJvQ+K8VW9ulGpMlGgzRLhPEd620imgrZbHhXZ0BoQV
#doTzSiHLfWYFvuWMvfsFZt84hKEUdRkRWTpFZeHL4Hun3X8LYf1Prf/Xbqr4X7vTLfi/uSTlWYft
#BiVn9Z4z1MBy7tx7dA8/3WuCRPch8xwyNVceWhajPN/ZnHVJqMMfOBZALiH/yURKuG+qZiIIunQ6
#MJmUEtCAemFlVZjOpP+pKgh/bIOYtPvPNv4xICDl/tfrXVX+02k1C/3fXJLukidYb1Dej+Z+M54R
#u+L0tyBbxvcXVPwYz0hWcgVn9PRaIfAQuGN3tme8u7g4Zx+xQOgV07HAvuisyQAQfF8WixNcX4UG
#XNkilsyJalso0FHAjFBmZPS+dvhDafytVjPPCZDagaiESAR9F1QpL9SMEDB9hAlJvVdS0bYw3RCH
#hWXZAz/TGIcaf0Qw+dWmjPAfCwrXfQTS+T9q/Oduq13Yf+eS1oP/GKrrkDwM4tkTAAptnjubWd6p
#+EQoSKR4wiphlVJELUvETRE4NT3UKCLQfE63UdCj7UYg7AQ0lQFcip5K8Ff2K6tYk301ICzt/hPS
#+HEUYBr+12yo97/TrBXx33NJiRhONk6PxCeJwgSRXxK6cpkzt4+IngOtIhaKCHIqd7VGFfVdFapW
#Xe9md2J7mKNMLq41N+2ZrFroz/rwkeEkC8++Q6f4B+t+qPqTioytIgZ88t3ZnWBUoCzSxPFr9RDv
#qRj4g4gwYbOx65npKZrIaFLYgCIyHBH72xOqV3BEKKUQZpqLGVG/RxW8oPKg6OUGnBQjnXLfCJ4i
#tFHF/ETsj2H4hpKyQUw5KaA68uJEKsjkhzDtPyzl/WWkNPgPcnwsxn/EE5DO/4vI/7qdAv/LJa3M
#5HttjhHgmVx45jUiFmPdOMC5qeCDw4E+UX0MIUwlKxTQ3X0VJEF/xF+wwFI8Br1G/BtrODLAxiPC
#Mvg2CyuyJPjtC98X3sm55Z3YzjJqjbTEGqQk7w8BiVLvv0Ue3Se0/611GxH+X7tb8P9ySZnxvwzE
#IccsNPAA43cVdppCQYCCdehxDR9VQYM4VfmEa8IP4f5XiGaCDA5AEVqGBgScgEb4OVbPljKZO1b6
#8dqeBYpBKg3KQUDKgK1BBNiwHMWGBg1P5TDSnMAMlv4B5uc1a/W1kCD9/d+sCUja/W80O6r+V6OQ
#/+WTuHgamwowAgrzb0NYQG3oOM+XX7kK+lQi1A+1fFB40rjV6LOJA1bXSoyjg7tT5HHYXOG5V+fr
#T/L9d6+AHicRfDZnBYDf+BXjvzWahf5nHilp/zdlBZAG/+vduqr/0WgV+F8uSav/Lx0D2Qrgp6kZ
#GMHU9g04NteuNzc+EgzKMK8Q7AevSdbsOl3j/7knXiScku7/pqwAVof/7WajXsD/PFK2/Z+Y/vTK
#Nb3JWq9BCvzv1lX93wbCAAr4n0ta2Vc1A/sVfiZKsqOrG8+8Nh1zxPPBoqvMPVOz+tV/+tAn9TdN
#6dpyYAczq4xqnNNi5R2WtbQnkLGIZATmjY9y3odZH8I8e2797jq4ySvP/YiOd1gRkfLgmgXymjW/
#LFUqQ/CNMuj+Q7bjfqx0pmBhELj0d9l44BUWpgNuydAYOH3+WaDUy/AYQjVoGI3AtsLO5FlTFgGE
#xvY/WuCocGF5wP5wncmOcXVPDLblyjeePTl3fTJgmMwrNMyPZQgugv74hP6ooX/v4d9wyHThgCEr
#j1sdOy5ofVp4MDxwFYYGsYUZxCO0dgtEqFmjsTtB/4GRbRtbQOzRAsCxGE3cj44feJY5H3m/jT59
#et+ef9jelqaA+4CIos7kDdo+M4C+Pn82/vH5c2xPDw+fPv3DeHiQ1YxEZmzo5kSY9XrbMkSIsGW4
#13RbwE0kwoLgGxFfGpbnud7K+4L/0G3MtW3NJuQSkuo07i5tDJjM+CpY3thyAvxzBxxi4kbhL9sh
#rW5gw1M3NH6P9n8tt38tP5AdN3bh8M4XIzS4rSztkmo7BkIWa/UMB6b96VMuh+Gd+9GYuc4NOgz0
#PBiBeasWz34rX623+XO//Pj9nUJcRgSw56PflqYT2DNrq1b9rr1jpG8QrNPoagkOO+gGA2SYWVnu
#9uK7trJVO48Yb7v25ONt13I5WhAqE5FT2GbasB3sjRY9CEtrbciiHq7YExKuMfDo/dGtdT8CPyAA
#WPSgGZV4eMAgeM3lAPZ17DtIfHUSf57OTcr8O3T+r5SrBbHlHndBwAphNEGjce/nCNSOCMt9xHyJ
#jsw7054Bj/Qz14JAUE8QGSIKWFSEQOAw69MX9kqXeQMnMGHJ37lL9LD5toPGCecOAfCARlhbcfVf
#xa1+RshG8CzmNY9mgtYyZJpXvjtbBvhc+oG1wHsJBcbuzMVbduNZlgPZWIiBvjjL2QyNRCqEDrlY
#pImGanwAePrYA7MFl3xrGwuWPm3h4/NP94qdG4gOO7OAHYLhUeZDswPxckdQev9//1qu/jt1y1+p
#/js6UPhthSi46SfLvLGe+Bjh0IYIUxK0yY2ZdR2seIbqnUceosnjDpFyPnRHKHLO6u1NHSJAkWAB
#qbrdSFjMESpjeyY/QmgrEE5FKAQfRI34+MGJeNVpZTkSBNjA0VoBzJTEL4WY5g+csvF/5i66VojC
#WU8YkML/qTe7HZX/U+sU/t9zSSL/h+4y6E+MXc9ysd/rUL3j3J2ckBJx5p0yI8gjiqCSBhX1wUd1
#REXP7TGxWLB6xikVUIseiUE9TXwkcQjIdZ26M9O0BZoiGWHfmWBvf1xPhJhv0fHT5hY0BDN6Dv1d
#NCKUO7WWLBfVhss0A2G3rzEl04WLS9kCav0avw3CS6GG1XvS7YB+T8hrtbFNETXOS2D+q92RYLyo
#hEtfoQEA6DpGdqJDd6LQFaYpG/zHWh1P5f+j3m2r+n/dZrvw/5NLUsASqANtWPOPygNSVf4EaEJ7
#DJVrFRMDuZjG0CASSYFqEIYlJJVCOWCX5JQ71I+igxX6Z4v11BqFV0TlWrbN0CxbBJpX2NqHTXMr
#avXleUTIPmzJXJEdPDwi8F446HWD7j1hXLc49CPX3p1oxzFR5rCaXdKDlxH+w/l+Ivhfr9Ui9n/d
#ZrPQ/8wlrYL/cyxrgI5Dgmj4UYgn1ulWngahYdygar9hziw47BQ7PvIP3Y+izRywVYiXuVVZuQlM
#ufKDsb9viBE/rsE/XWMufFHjP0HyrTsLgnsg/Bb9YzMDFQoS9c5sDJBvzE3vnvNrjBek7Wo4IYPw
#b4yp6RuOixbJcUCMQOdXLiWs14Fn+lPw06qume2MPdggwshEQH3Eg5SE6wcXKPBHARr5LOvava+D
#DMb43miqC9jOvoAfTc+RR736+qE5sYWjM8EhAT1ggpsggfEsCzPVfBDIXNvXgWU5xhxrMfu6RT3B
#0bqSzqAQVS9yCCFqyf0f6gAKs1FPIMwl6fyBR+GBFSw9x+9jAXpkvf6ljuEx0uhym8milWf3cZJp
#dIjRH41HnOP19uGEH9LGN6FuAjq9HlciiSgoxGzCkT9EGFzK6j+JrBgtXh1QFGXx6rUnhgIXU8v4
#ro0IBKpDgWYjCfOxhB9+wPqaVANHt3z/CeLZI//UDQ49BBd1QFQWqKIZt59jxsq1Jc7NyHUFAYkA
#867tO/jLXfrgFfKfCCfUTfzQ9m+P/Df2bIaGcrlIOTwOXMNrtMr+vY/QSvLYjq7uERD9jCM7YdbO
#fnkXQbXdSGlYt5jCf0OXL3L36jk/IjY66+D2XASAM4gPS48PPBtTuKMQUhYdhlsiEtOs6o84BlT2
#dYUHZYbeERI7Cj8nAiZD1gwtqLbY2EQvCVoDWgpWst5+7qUEX9PYP1hAxjqGcFj6da23v4ldx9dY
#PvoGrYM10b/CglT2GhfL+OqKolhJEosO4/fR57j+1M8AQDIyBhiYoSwnGytbQTLV+BU78k9s39dB
#MfnciVJuDMzHnuugzrYRWIeeMUaDVmwFCfiai75jlGnfIIt9UYf/ssLw9xYvvg3lyZPT+K4TBcHN
#FUDwRlAnOm4ZbQoMukToJTfZztoARSbmPfbTa6KSs2stTKaxhI78Swe9veMpAIHITm4tbkaoTUAe
#tyH259b83v9txj/ljsj0eAwkCE60WMDE8VOMtaAQxETDdj0IRhwjRIkuhOB9uA/ycssfum4UHZfP
#9IZE7giQ1lsRMDDN92iJd94iKwCHKASe1+7Sw6QMOlV+uZCJ/FlTEv9vU1bgKfKfWrMVsf9p1wr/
#77kkkGFg82tBxBLyAUviQ4zN+Uoy5y6UiFNhTOi6QZXOCC5iieyFuTSQeelUGF9hFuaEBCjpBMyK
#iHjmQuxBZqlO/3ru9f3Sk3z/qfT8S4j/1i7s//JI+v3PN/5bMxL/p1VrFPZ/uSSt/Tc9BrLl95lj
#sQwcBg4wcwS6Icy05e8YOI4r+tdcBq4/Bjx8x7haTm6sYMfA6iM7TMRMxbo7xtR1b31M0tjgshps
#zRPMxhvRQHGNIlDcY5P+/n8B8d8K/x+5pLT9zyH+W7sR8f/daTUK/4+5JDH+G919zDwIg76JSifG
#vwxqbiH7eY2ERCvp2iW8CdJynPLP589hnAN5PFVDW41g/5PK1b3sfpYKt6GS7Vx75ico7C0d4NbI
#Th3JN2FqZQcsxo0sU2LKrRueFLAA0RhwqG80Uv4z05hwJPBw/xaIkAuujfI3/t43ECOCThuXqnrW
#wvWB2Ls3tuScwLxBSxK4wwAIwe1sO7xYzmbERZgQNVBSxMONn4fFcCn1414pDN9DFfNEdTfF4W9c
#WD79CEExbbwEVhsZoU9/HbhOYH3CvvfQiej5p64zcN2AkpH046UPvqqFw7NEH5gKIMp/SxwSagtc
#J+aiYcAun3suyL1EJ6YDcj4PyeFMnyHX0EidJ9bbO/fsOxuMgvqAtZkE12NR7EFEhJlBNlO4mXgu
#msL73vHxhwyLjXHC8CSQMEo+jsLkocWlyyDGlwRscMv6jRUlTRhl4BSUt/nXKY73htWGQGVjCet2
#hVcNCr61qAtFop/P4zeJ9XA2VpGD7YC/aFgBy7PxEQHm7p4B8jCQmSw964IZk4G5YAmUG9Bcff+p
#eq7XSjP7znrKLhq1MNIlWvroqt94i3FZt8qQsfcEa7hSu7oVWqkBcf4oPzqcYLwYuqC18Kgxrd5K
#oxYH37TXzHLuyB1jQPLo9M2g9/No2B/8eHTQL3GF4oR3CK6jGN9Maep8cHbQHw6lpqqU+kuoNugf
#93tDeQTizZfemkgj52eDC6VHWDGhZOrSMD2gd2hvERYrhbJ1PaMKWkuo0Ny9o8FeQ+etodtWsYkT
#d2Jf2zQgpKfNItscvny+GCTJt7h7VyFEHcxXilEX1SgmV53KdQQhULg6cUHqJH127U8yTroMvB75
#HR2tMrgE5Xmti/6vKXruHz+l0X9jbGk9NxdP6P+/2Yn6/28W9j+5pJX9fyXTMhVyXkqykFuKXqdS
#g1U1MC7rL0MIT+eOhWNKDddZSLi1Ke3+h/rl6wOANP5Pu6b6/+7WC/u/fBImyzDyx9AO/AXjGehL
#EttCuJ8UE0R3FMw4xCvKJQS8aYzDoRK4KMPoGOulhv62nYgJorlY+KEhyiE/k3r4xLCkCvzNkFQM
#BDIDpRcUH5YAE1bFSeHViP0xkxaKbzrhQhnlj9ZVmTIOqO4/qY4XhX0SFqYegWJQ886G9XkHmtne
#PQl/gskt2uOLkMLwA1DRvrmXOAsuVTKdsDignviFYX5z89Olw3VKyTBFHB4qucugugwLhfggqjxc
#ejcJ1XzIFmbH41hphwwMIjJaaSlSjcy1ux1y77bmFoxia2KPA/DxQre0zHdsmwx+WzgTHdI1g5W0
#a+FAQlJ1vZ5gHK/C1dYqio2n1vjWX84pLhfdCXhG/8Xi1v/L8Kdmo90BX4+0XXaOCf2Ch9wjwdJO
#YwgTEAJiTe2hVBzHPgu5S5AsHGGAFju2nVtfzg9onFo0pbeeObbOZUqZX5kbyBTuS7Mm0ySRNZdY
#lep176RVFrmICZU5L05vuCsDJ5YwTaxHtChrl/QYrQQsVGKlG91kQmkveAm5OqcCyWqigzc3QyqO
#TQZ/lDUQoSI9OVL04Ua0fUttEJ27aGOROWPuBr0QMCE2/TJdvLIAVQHeocIvlFdFWgjI295OGCvq
#8I1kUEx2bcyQYk3YPt3jwzFhsRE/LvCfrgVS2FeWUYbrLCn2v6S3SGBtlvi5PGfMKE2TtDNgC2qe
#rcQ9Y4xf7bbhPcL9bcfEq2btyjENIUV5dGFS+Gzy2sRNUsfBUwahHtvYj5Fl0LDiVWChTtuzfHfp
#KdG/pWvGUARaLuXSwWkRTz9gCgAIrDDKU1iBmFycAKiOOUu0urLAGNSfc360rj9cJGUdVxovGasG
#rkaHGNqUEPOaA7ApkeeHzUwir1lFbksYMHhP+CooyjT6D+voPFITLJn+q9ebkfgfnXq9oP9ySY+k
#/ygbnVn12zeAsnP0QSACCaWi0nVZOU78QsJx3ASPSYMqwwWo+lN84veMhWdVsFnfbLYDfy8XaGoT
#K1Ky8tGyb6agQl1plqO5EzC7syoLipRdWdcuaozMAggZm1qlmN6NO55U4R+0WP8EupKM49yzhvfO
#OKmQ2slr3Mk7lHOQ0oWPWq58NO8sOvwn57wpf1J5gu6UqO5proCkC1kA/+FepZwU3hpwAdDzA1b5
#m2ECbP7kNNY7OTv4l78cjy1rQu0cv4CDhGbDKEYwX3OvrylnAux0zXFg31mHCI2bIcSIY13EHC8I
#ZvRL7xoRfm9sx/anFhYWk/xcSO0yPzrlJGpbpIqp6whGe52CMdfGSWGNBgftXaevImSFWiuhvomQ
#LailqPk6rRSStLopFJdKIHr50mrpXUKk6qlO470/3TF2iUIy9rZIGkIX5oNQPEJTsp7fnQ0vFLRV
#ECxjV14RyancAhVHx7SgiqZ1LfR/vuifDo/OTofx7aCdtRyYmMj9K5fTmn53dtLXN7obzBfaKoOz
#s4vR5bA/0NWLUsCQCEX6g3WvpWAFMBwCXA0VyxKOY68fhTTG895w+NPZ4PD5x6kdCRsrVbd4qiXl
#L9sVgkRxo4Qpkec4fk3ZOA97F73XRDvjuceqHYo63ic8BquOVzOUJ2YACPHIjfFiuWe0a/Md9ATO
#XTD/7bRObEMGDDimOS7OCjXaHaVUBnqfgNt4en9XLhFPlUca4vw0uWft1aSVFfRRUixVaY9N4JC0
#zS8SZ6x/VThjPQ5nrMfjjN99STgjPSqbwBjzFrF8meKR8O6xtJZc5DFCi03JJ/jh4MzviDzi6cUR
#MudEbGkTMokcH756TXz5oo+a7unrdl7hUl8Fy3ajKZX/uzAfbQecov9Tr7dU/9/tdqvw/5pLUjzq
#cHWd6kfrKqKFQ017bedm967BXH+7nv073PbZuTvpcePf1TUHUYerIFoRli57XXH/FzjkDodpOl0i
#+B7RJ5KAXvpo57YzENV3uP+qcKUQYkrdjs/NT1JhcJ0VV0H7HZUnDRGXG8xHLldTx+AzxC/wzxCY
#0qAKiyX/QuISRbk6l4E9s38PkTeSEKYGsjAhM3bKqBOF2/vcx7xIMSkN/tOz9qg3IE3/u1tvRux/
#m0X8n1ySYHan+OaugoFZtofhsVFrUuxjN/IqrBuNIHVs+sqCVih5KmLC1wjKOdygT7sRvK9oWKHH
#wNi0+48mhEj7x6GAKfe/0W6p+t+dRrfw/5JLWknaj/WnsPnuzPa5MfrqOuCg5BNqf8uN78NlghNN
#f0cLRmXJG4pjIjNZHg9zHhMERR7LuoFQIiNgKSEISbYRcW0t8eUgYaKYqhbdQFr8OaK0UOAVF6xF
#0ZkUz7I4chFcy8aOWWwrlSWiQ0KI8gwCyaetUfIG9j8tYPejfkGhKpZZ6DczwudxFwi3hz6MIyeS
#SWzC8dwD9z9814mbTL4LK3H/6UjoixnZ61wPn2bMzw3l41Pa+7+YXD01/6fWqan6f+12s168/3kk
#DYiSUf2tm8DYApOsGFbFtlHfVt9g8lxJkUMPbd9bYk9yr7FTuOfjD6Ex90JjpnoW2mBtqRCoy28b
#1YjV0JcDGtLu/+MiP5KUhv83m6r/t069Ufj/zSUp/F8Zg1tVG/jFlLjZEJF/0qLih0MFGI8MMblx
#xD09RCWZVsZAlVJhDSIaQWdIBSFGZVh2zcCVoshT6oSXiyotCHHWVqfz+OpTn04R69dtkbSjRi0w
#ohBn21ggzdCwVuwg5nREXMbwU62VYacF54w3RmYpNE+SSN01sOAIk27D67j7DOumW6i4NfpyntU/
#TEp7/9nuPiH/v97oqPLfTqvw/5JPyt3/Q4T3p7UHoiKDGCpBb5QqAA30J7UdjYfAUIbB0ufxCyHT
#HU/gGaDFuIdeoGAyotgh/vlhIuLzpCJo5ueeG7hjdybujqTiJLsTlNdp2hiH2wXjCjdGsbIswPvm
#U0b4bxLtwvWegTT+T6ul+H9uwMcC/ueRkqAvVSnNV2CrQWtlhdiqoEsdo1wdo98ptM8ERxmUaJ97
#h542pd5/an//pPofjYj8t9WqFfc/j6TwfzTuFrQQ4lznUmF1nm7oX+FJTLmZEhy3Tri1LIL2xNkj
#uAvSjHHuLR1rH0OAnUNs4kB+cOQNvYgI6TpxJ1gkO0Ck7k+eHVhnztgCwSyd2QFEnj5VmUdslXFc
#asprkbWfudYz4/qQGtpWcFThddEj/f3fVOQ3ktLov243Ev+nWSvkP7kkck3L5RIPjYD+Jg759/Cx
#ZPEBcAYQBDd7Bn4aQFl2ITicOro+dYNzdI5Bjzbq0t94/6FUWmJL5E673WyUCN3xqvaqVsL0ASVK
#iBfzPWOX/FEqgRWG8fmhVOKkJAwM0XzkboT2wcQMWGgWXyTg+NGxi772iP4v9hoGilQ0V7FAWMHo
#Lt7criQIzKj8iZjCz81PxFsfbrrbLpWoSzxMGxKneTDMpeh8r1YqMVhQYqY9E8FhP0AUtEEu6q8C
#TD5oCsEHMJt4a5eo6R5aXQDT0OEy0DcUCefHP52akYB+ClcaL3bIfyY7o7AHyRIL3rAhzsQ4qFx4
#puPDHlaY5cgeLFQFTXi/WW+DUVftr+x1GC6vDt25aTvMHuXnCjaOd1A79wurcsagueP6jn19zUu9
#8dDIwuzD/ukvNG9gXVueZ3kVdqwdt+LRb/SQYK/YxvufUZGPlmdNKq/v0dEmGghYepAlniHX4hYK
#4nWjyhTkvlDDIWhVPOclbv1Oi4UK4USJEO6wjDXvKe8k3Ci4/zL8D1x3tuHgf39ZJ/5TvdVoFPGf
#8kia/d9s8L+/pOP/jbaq/9Fstgr+by5JG/8PjkE0+J85AcsUyOPx/0BYO3PNyQ7+BSBuQl5cLPML
#ppbhOrN7Y+K6no+KgJ4ZgtUJQf7q0SB/9SLI3xMmzf3fbPC/v6wD/5utRq2A/3mkxP3fRPC/v2Tg
#/zbayv63u61C/yeXJAbNgd3fePA/3Oiqkf+EkWwi7B/xJJLcxZ80JE3i/d9E8Ie/pMd/6HSi8T+7
#Bf6XS9JL+6P377GxGJJYvBKIiFXKk3k3+tgHzVJq2IDHGAIKk1nNrUxWmxq2NJL4i8jgxSIhZFtY
#zLVfgvFEWlwA8O0n26/jL5ljAuTg4jCyKFpPhpl8IEZqCf4PxbzruAyN/++N+0nUK8AJnhJFr/5y
#oahbXnDWGspSgR3bZ+5bWdK6usnoAjZM4uiJpzQpO0uwutgl1g7Ks67FIcVMLuvANuVELsWTIHaR
#jgaeZc7aj4/19S96HpJbTnKvLwUfFQajWi3LYUjlUad0D5DNDmxzdmjNzHu9S/5kh/2R4Jtfwvi/
#Sxx/U8yNBYCQ0uP1hikauTdMYgxfOScCZlEzfnQpzMlEMgeMltCe2/TYBlw1PXt0AwHOkVeL/fqI
#1lGORQQp3uWhIgknjcXAEZypTFkOgiA1c27qDhRctjNndq88V7HLJ8E/WJRPCAJi3wACCNTPOhw5
#y8fKkLiR6MCUcA4LzeizAavVtyjiPzJtV+J2JM27JAfWckXNvNZc9KwLjvDI4P7Q9rBEJnEln0T1
#MZH+24Tx119S6b9mtxbh/7Rahf+HXNJ69l9J9GE+tlzZaMbCkEs15HoCa6BHWfIouJTqspcdJixD
#x4J1cpDM2WJqhuqqBGl6rGOPbGcqYK7l+IreEDox9uDTiatnP+ZFKsGK+va4t2SbArQuX1peHpRT
#bA/d0rLpGNanheujv7F0zrGsic8lcpSAKSvHBRHt0xh9W1JgbE+YTwcoC27+CLaJB0I5wb0xQUAP
#LecefxeOGiyNSfN7gLryA7Dw0JrbC3MmHrrxzEZrfXB0OEjADzX4oBKVKV9fMBnB0LM7gnl6XysZ
#naxU4u8+3kga8W1zuxj7Zj33riYMLHWXQetnMyhhIv63CeO/v2Tw/1pT/f+1u80C/8slrY7fZbPR
#2xzwlBn2WcFkJos3PSdHsXnTgSkdRao+PivHNmOU6JrrpQneBS0icvXKndyL5KpAREP/8NOA+F3/
#4l2SKkmWM4Ut3teRNPB/s8r/f8mg/9FV7X+anXph/5dL4vr/VLaE/hI06Im+PvoGfGCMdXD1/BL1
#Ho11jZmOPhfAEI19Jlh8KHE2KKpJgxCUGGeM6DCHzGFcNUfNdKBumPI10DxcxTpdi/u5d+/xSb7/
#5OpvWgMcLvWK+t9dBC4K/b8cknb/Gd7/OLU/ntLw/27E/0erXth/5pMI/H/xedjvH45Oeyf9h9AS
#jH4dXJ5eHEGG3iyMljo66b3tY80YsBAr068XvbcPAFhXMRSjVc8vj49Hw/7BoH8xfGCmYzQPYts9
#0IeKFT8bXDwwSzL2bXD2Go2JvVlsUO/6veOLdw/03aIf+6c/SjZmYRMH/eGwP4wx5GJr1D8/Pjro
#DUcnR6ewCNi2K5LX+xnysLkXzTs4v0RrNHjbv3jQmX/RUsPLAVlbyRSMrcVp78fe0XHv9TFskc44
#jBb88ez48gQ3Q63EpO+jg+PecAi5xF5Mzhwe/S9ck5qPsZU8OUNnAxYy+lyzyZ9dXuCamZ5tWult
#76L/U+8XfB6H570D3ID0kLOF6R9cHJ2dymxylgkRP2Hb4i2zwj3+WelMY5zFpty/GBwdDIXiktUW
#29fe8XF/AL3rTLhYU0dvBz1YHdGeKxzTj0dDPDeNeZc8lod0ay9aoXdwgHcsRFw4/L99tfF3n6XV
#3/9ao9Eu3v88krT/YMpT/ae/6T5S3v8Gwvci9n/dgv7LJdlzzNcC7hgWGhgvbzu78OvlX0s07zPR
#FDUeeAGUV0JUnB9gqGvsGyN4PqvHZz0Cdf9KcwHwodzT5fzK8raEQgD2tlkpgGng918scN67eDc0
#/vUv4+Xuy+2qv5jZwdbLHfQnIiQD1NZr151ZpoPaKIHoC42StEX9N6DWPmNmlu1gjSpreGsvLo6H
#P1qefU0VbnaIHMtGL7o3GVDr5NfuBBSmhAL+GD1pnu0CXcqlGIFnXl/bY/ETJOsT6gy7UX/pmfMF
#whMqpufZCKuuwFK83JFK4wCQA3gbjBO0BNWxZc+28JLtGvXatlwYMLJLB3ScX9Z9paGFZ4F8bQzm
#dz9eooFGF/zHy6HSIMJQEsoa3xqtyGhvMMmsyIcMdD4mS48qokl7fHK+w2JMkaPwsJO18uElOiLo
#9Utu4EP4k+bQf4IpQi+n7mwi7Roc65Fn/Ta6RjgU4CjvX0Krf6tVa/WXQlu8XDi09y8XW9+1t/9W
#R/CJFUV9PYTnj5nGXC8djKcYW9uoa1wwPOboXOLT/h5v+PXMdb0t/KeH8AJ3vgXrjgtUZ5ZzE0y3
#P/xVaAHNCTUAo6uiJdn6x4vPcP0eXnyGKg//gMuAC8Nt3UKFd9DqvjQdH1upv9wztrxtY/97w6ui
#vQyWvvE3o12rGQ9Qr+Di/klT9P3foOE3TWnvfzPi/6VRK+J/5ZNWjo8NZ6Qk6Ue9+PzDK5Eeionk
#XCMU0GJmcZqEPPVnh5jsXJgeEFEz259H8sJ64HAJopRM0FsL45DtcDJGWAaw2ZvZpi+rQdkLTFrh
#nglRPjo6fygLT47IOlZKAt7zUGYK1Um2HbcdoUXKdqdtcSYKS+jxg768pbPDQ60zNH3HqFT8JSIp
#vftK4FnOpAJwHX0um3c3O/i9gv9+t72D3voylHbcytJH/VWAf+MFovZ3xACEjZYjdcrTTZXAyvAc
#+Xu7u7rViG8Q43cxLbK9hyJJbQASmdwElBid9wdwjpJaYthGcmusVPKYTs7TxnRyntQCwr6SG0AF
#pPppcZOV1jD3ibV1cH6pjMXg/ova9caJLeVRH0cx5etvxdLxevZstuQ0q42FqufsuJfEBjXXKdJO
#ouo33J0KrfLcsPdLSNL7DyDT9Tag8S2nlPe/1W1F3v9OrbD/zSWt/P6/+DzoDy/OBn0qLUhGBWRt
#ljjlnbDNk7PDy+P+QwVQh+UippLgWZue2ASUAzRQ76xDy5zM0HscWl11apAbBDP6qXcdWN4b27H9
#KZCGrzotUmAjdr6JE8w8SSiYEcOR2cGnWQaxtm1uNtPbsHcivJGKUEvbuDLXyQXA6O4gAeG6ttC5
#1uFcrLE3/YuDd1HkS+DXyyUPzk5OeqeHqgFtpByWKUlloiamFaqfrbUuJeMn21RBpUAZy0Z7EilI
#+F4QFFaxJXtGg8J0FAB0dxMQACE7CZ8WrwdJkQ2O39r3/lTArNkD6E8z4cYJaHHksulRPpBapraA
#RZv6+sOzy8FBPBbMWiDFYtogKHtqG1RMGTOOiyTElw/jIh75fXN0HDMPfA52hbt1dCztpbgfJ3Ft
#BPOFtsrg7OwCAxNdvccYhEehbYpZuH4k0jjPe8PhT2eDwy9jrJrRfCXQRq4n0yG6qhkpFaWHcNXR
#Kv4QtRyN9ptI2Wg2kTaQhP/J+P/SeQL2Xyr/r9tS7T/r3UaB/+eS1sH/L083i/uj9hDY+/HooJ8h
#lg46ownYfiw+T7q5uDjenPMezcgzjR4KPQ6Nj3a7ORc8On0s6FBWx2LDeyxJgBpOJAci+dfxmYk4
#4lKMax3ih6iJRLQf5ccg+9qn4uj0zaD3M9uceHxI2EA9NkQbotpn+obkOWXFKWErVXwyhjDhz00C
#bSJPpkJ1u+V2UgkcpZEo8vGMeEUae5W5hqeH5fzyIfQQT76d9E/OBr88GDLOGnUYL5YeHR+dHF3I
#dSQMh5UGdS5+HxnmQTOJ7t4wUbbL33/iI/FJVMDgUV9R/7tWK/S/cknq/s/v/d827QJ+9f1v1NuF
#//dckn7/AYfJzf6r3u5E7b8ahfw/lyR59hSiISkuNnqCs3YdTRCaD1SotnJJ43UyLurSRxMiapTr
#5dC2HmVbY0G7f3D2H/2DC6wHjp9j0iDIsS8Hx8S6F6TQqB7qf2ot/QqgcUsHIQ3VGzuYLq9wrElr
#Nq+MIb4BwS7wn3uGUAuf/wrR6aJoOHP4EWpon/wy/M/jUf9nQKT6g9GP/cGQaqGT2FMMVSDmNGdX
#eCr8JV+4k6irBdWlp2SRwQrhwYm1QB8hpiwzc5bMI8JMyZyCs54kJPeT7Qe2c3Nu+v5H15sQekDP
#eRC2X8c5SuAZUQrnxHVsxSsFtyRQONoSyRmjkl8CByUwesFjCfQEc2ZHRaDRqO5e1b8bl/RdyJYI
#6MxSao0cayC+QPmSDX8BwcOkgfvW7Pqdxfnzz33rw6SH/1fo0ldnpofu5Qx87zyujxT4X2s0VP3v
#dqNR2H/lkg5fIwL39JTY0ezj3S+hbyDZ2H/x+fXRKVH+eYCPAEPYRwJP0MfD3kXvdW/YZxnsN84E
#mAJXh2USGANNUTjAm6O/Cz3UnFPC/V96G7j7kNLufy1q/9kq4v/mkwgqg3AofkUHx+iG0kssZpwP
#jk56g19IgecedpE2lPT3HzQqNscEWJ3+b9brBf8nl5Sw/zee6SCc+LdHcwHS4H+9GYn/2i38v+aT
#3g56pxdG7/jYQPD9x6Pj/tv+0Dg7Nb6tfmtcnBkvIxTiy//58puXxk9HF+8MUvfsHFDHv5beHF8O
#3wmt/LV4JP4ASX//yY/NYH/p97/dUv3/tertIv5XLukHhNrtAzfvyvStUv/07dFpn5KBJ2eH/eH+
#eIZWyPIMGnCrdNI77b3tH+5jPgaWnZLie6+qrWq9TptgPLF9+hWTjs1mrVMCILL/3XfflThI2Se8
#rxL4mNhvQJjig/PL/Ua7Ni8RYdh+t/PqxC6JkrH9Bio2HB7DGEcHCPJcoHb4BzbG0uHlyfk+zIXx
#6vbjWX2A6pKZgDFLSK7uKSQqQoCPHv6nSBvviTTxboQOfu4tTkz6+8/0ITfTxxr4X6dVL/C/PFLy
#/hPN46o/fVQfafC/W1flP+1Wq5D/5JL+n38DZs+uPy35VmBUrCU3aCecgfOfDvdBbURk3mN/M4E5
#X6CcrQnY5VeWxr9/88s3828mlW/efXPyzXAbFbl2PYO9LIbtGC8+M5g43Ks8/NWYuMRefX47sT2j
#sgD1lLNLDEFZNaqlgg/lZDlfGJUplCLWhUblHH4QbRYYAhsnBttlsI60nZuZVQkgpjzxRI4+gqsi
#iHGE/gw8++bG8uBPNPvKTWBPKgvwvDTZP3vzxvg1VCOqeJa/nAXYR+u+Zpzob7wiD0AvlWEkyhSs
#8dQ1yuR9MYRc47//3//PECsbWy+2Po6Nytj4m25B5I62jav7wPJhtSeus45cIfn+c79EjwIBKfe/
#3qyp/L9Oo5D/5pPWvf/o6lj+fq1UAmdxM3JDSYBwcHuy8j2dWU4QQgTS+IutLfyH8e9GfXsbZ7yH
#uvgj1JsFxnc14wO4ifksXjDDDAza+R7t13BAq9Iwx2NrAUHKTVBuc4hHsfJfQdYZGPW/UnUrf2ZZ
#C6NB71SJtLnKjP72N7R0pYNBv3fRNxjQM47eGKdnF0b/56PhxdD49R9AWmONtxBX/PUff2XVoCml
#ysuwhkCKHx32Ty+O3hz1D43Xv4hl+Ha9/Gupd4yQX9LmI1qJYxbEzEVgIaj96dgFsGYlBU5KNQ33
#o+Mbmq6K6PBrp2T4H9pDPaaPNPhfa0bkv52C/s8nrQv/MSRmJmHGv+1jn4TUykwGyZ51vQREzAhc
#ZqpnuACMX/IaL43//j//F2vhuBhJs30EoCfWzL6ysNsnhLtJQPq9UfGhQ2wJpnRHSBbcOLY2e2m4
#11JXjhsY1+7SmUhNrgHlK5ZRTofxdI1+/Ud5jS7ENf5bOOMomCSTM9ik2UJPEN6Nlp23gtf5DjtB
#M+xgxwimlkPX3RIWfHZfQNQ/SdLDfxoCIB//z42ahv/brRfwP4+k8f88xy6WuIffQ/SJG8yIrp41
#+oUaJ83mZEJCFjGntb3Dw0F/OGTulxHGTXUQUPGwlAAFS0JYAV5aepCiyoX08YrJx7FSqO3mnent
#IrhHDn6JOpAuEV+ORJ8vtBUPqZwdTObsIGC+Y9Qb3WoN/a++w0kZKZ5BSWstwtw/S+YiVJ0xtBfR
#WYkIhUIzEdHx8wrunYlf5xKJvSa4Lz4+6mO7kqgf5HidyxLFGpnr7OHB4Ogce2AGcTL7enR6BL6u
#yTOt8xj9unfww+U5Hul4agFQCk8FyUMtv+tzo3rmIFIuwpxqG5wFFc6Os6Gw2zEc3zDSxfmg/+bo
#Z9yBSX0qKz1wX8qg32otDs17Xy3yQ79/jnr7BXe0XIDvIYvquMo36vIc3DH1B6IxmuotmpeRDNKo
#3wm5BPU7IRyJtEOhHAu2zvh0PDeIKtITJvX9X9xg+NbapAkQ5vGvZv/TrtcK+U8eKXb/N6gCkIL/
#1RptVf7TatcbBf6XR8Lyfwj7JYv7S+T93F+4fgAhJxFqRGT9kwV6Ufgp2fuuWu8S4X671q4R4T7+
#66B3PtwvYTVyIuk/Pnt7dEq0Bkj8jf3due2PdwGPwgJ/Qd6PDoQq7ycqAM+9Wl9fir3/GyQB0/h/
#3Y7q/6PVbhX0Xy5JQ/89gtgjYeJ4DJTzYRh8R469U1Kwdh4Dh5KE5297hydHp+jyDy/6xGNBiKJz
#/wWs1GH/Te/y+GLUP+kdHYfl8E+pIEgOEH78H8OzU+xGikej2yXWYX71n77riC0fDSGwDupyeIHo
#AdQ2QDCVJFXHEdKdIclJYuGVmB0a6YnH3CwPydcyIvXKdfxfoLnKYiQlwgfcMcrYA4aQxYwjIe8d
#Atj6WhDQtKwsOFlKlHli2k6AKDFnbB2+hvoM8ENN8Nbh6EZDCXRUBDSv3AkuAQSV5ZUfHlKj/nHa
#mwKdHeym6xlo5y84ehELT8iYJ5dweXigQrYUR4c41lDW+EbC/Y/A/+lifo9343n1/0H+U+D/T58S
#9n9jFEAq/t9R979dbxf2n7mkFPyfcEUJ6h8ejb12tVFtErwfx4nFeD/B+Q/enf10agz7F5dHh/DP
#W/TPYe9gdIYe3sHRYd94g/L7A0oaMFJApQDqjYjGL/FH/tzr9bWlhPu/MQogDf9v1lT7n3Yh/8kp
#fan4/0kPY0BRTJZmyhSBiM1CiR7Cc971Y8kGVL/3enh2jJA70OYPi4BtK5QgnHQCePaMTuuktJnQ
#1gU6+8TobJFWTBH4zxl+z4r/Nwr+fz4pYf835gQs7f3vNiP8v06n4P/nkgr/X7L/L3b+01yAAUPw
#7aA/fAYvYATJEKvBbojLwlKiezDmICyCHoUp3UlYqF6BVpEundxHgvewzP7DUrzOozPhzyStJWoI
#Go60cDMWkxLg/8acgKXyf9oq/ddpdAr/P7kk2f/X4ubZ/X+hTHp7WR6/zM+9Vl9jSrv/m3AClnb/
#a5H4r+1Wq+D/5pIYHlM4AftzpoT7n5v8p9OK2P836kX8l1yS1v8Lx+Qzu4BhNfbqr6qdCiIdbcdS
#XcFAFtUVazUbRGbUra3iB4aIgFL9wExsH3D6iDsYYL3aHhrXzxf9UxjSkHqIAdcCWhcxUWoQYGF4
#RzbsKubvlI7JEfNJuP8bcwKDn/iV+H+tTrdb8P/ySBn2/9FOYNLhv2r/22nXCvlfLine/vf8LSfS
#nt0BzOJmpHH/shBtZy8j5rkT2Q2LUak4bsX96KCXDP+5YCGDfKPyZmxUrpP9rcAARF8uwisQ79AF
#jzqrRxfcw+NduqyUMtz/RzuBSbn/jVZDxf+6jU7h/zOXtPb9VxzAoBtq+55lTu5Xu6S/bcLrS3ho
#N+z6ZRE12E8FOmwwRuXOODsd9QeDs8FoeHF2vl9H06VOpVCe5xJXUpKLkzLkMJ65mBsuPZRgwEMs
#EXpDMf72t5eIoH9ZGvaP+wcXBoLDczPYekmdFQzOjvvGN0cGtsjgGsrGN8cvd4y9lzAs/Acbxctt
#46d3/UFfdGywRVuuG28GZyew+VDNpwXR38DaNvZZc9vGrzdgT6sOiHilWX08+taIdxrU0MUZ+q9Y
#ebz0PMsJRiDPEGeDxj01fTz2LbGMUPUlojZe9wexnaoOIFD3WL+NjYDtVDicTMvJn01SFv3kK8pb
#jBvSoP/j2Q997Kbn7FQaGW79/PL18dGBPLiwKfDBA++29SmwHB8744CHOySZpJd7nfuhP7L6y4Le
#TOZig49A9bGB2uODffi1zN7Nku6VLtwJqSnD+/9oJ0Ap73+91VDl/51uEf8ln7T2+//VOQB6grde
#ealDVz6J77MAsVUovfGXA8A9vN50WyqV8cwywUumfV3BAcD8ODeasHIV16lYnud6SbQVRXhWfiT4
#akXcHikwvfB99IiUAP/z0v9uNNqNCP+/WfB/cklfgv8frksV7wJIKHT4WlI1On8L8FJw5COcYAB4
#u4sb+EdsAVzQHL4eIbAwRL1VKjN3bCL4hvkcE8vbt8dLgIDjJc3ZR28FQDxn7E4QKNy/vHjzKmIC
#yhpfxeeQMtQU70Mhib2DgOaObp0Uh0SFG6LCDVHhhqhICUl9/xHeZG8q7gNL8KivGv+7Xtj/5pL0
#+59v/O9OU/X/2GwX+v/5pEL/X9b/x+c/Tfl/0D88eg7Nfzy4HkOo8S+sgRIW3ZPQcVYP29xl0Hn3
#/1ghvmkjnwLP7Hk30nIilG18W0GDIoSHsmE/9H8ZYpzqj669//ikh//5xv9uRt7/dr1dyH9zSeRm
#EEILPDzg/S+Rr1EjAPI9agdAv8cq9dN8TMyEqsSYtCkdYFPt4cXZoL9Pev/Py/5lXzRLIJ8RpQRg
#dnQ4OEIQl3587vX7o6eE+59j/O+I/8dmq7D/ySWRm6mq/pOv6JmMubPPPeoibSrp73++8V+bDTX+
#V6teL+5/Lgnr/49NhC8rDqCIXj+hMV5V67Vqnan14+e/0+x+F8ZyxSr7baqxX68lenKto2I6XXuF
#8gKQxCicVfXqawWAypr09z/X+B/1RlT/v94o7n8u6Vnlf6Fsy5/uGJXxjvESBF+Es1EhtLhRqZiL
#heVMXGd2b9zjuJ3UkAc0AlGzMvFRfvmBCBaxmyZJRicXTBLQKdK4YLwYuuNbxhrRTLyQs60sZ7s2
#Z35OTI4ixSYV/tNztVEJEAD1FeU/rXYR/zuXFLf/EgfQxRzstcmBNPy/UY/E/+0W/h/zSaBZN/xl
#eNE/AV/nP+z7zVLvp+Ho9eXBD33O5CO/HnAO83E+6L8F1hwtQX6REv3Tw/Ozo1Nem/0muQgrQG/u
#xbvR8OKX435YuHgOniVluv937mw5X58dkHb/a1H7r1qz0P/OJan3H2u8FdfwT5MS7z9IAB759kNK
#u//1CP+/U/h/zymB3A1R8xEJAPuuRwRYrh4JYLnxiMBzz7pILKXe/0e+/ZBS3/+mqv/faRT+H/JJ
#7K4CSh7K7cEr93OPrEh5pLj7v0kJYOr7X4v4f24V8v98Epb/0U2nEkCC8RkE8JcExADsHUDHkDu9
#YujAc0+iSGsnfv898OMx3yzjlya41Kvxf+uNWqH/n0uK7P+Nu/EjsMb+d4r4D/kk3f4fgqzTg7g2
#m+kj5f1Hz38k/ke72yne/zxSb/DWeH15dEyl+vs37sx0bvbq1Ua3Wq8Env3Jtkq4EHgCpmXGHhgq
#TGw/wG5/fIQ1moE9rkysK9t06s09x3U81w1KJeyVAGELYQ8PRm9oXC3t2aSE2z3pHZ3uV0uln84G
#PxweDYxd3xuXSgdn578YN24VoaHwj7+cf2tUd0ulweWpUanMwRByP7hfWER1aYeYaOzD4V3c3uyS
#Wgb8M3E/OmDwSJusGtVVGkkoBfPbreJvqEYFz4j6Ojh4ezbqn0Lc2MP9GgyEZMJqzhdmMDUqs8n1
#zLzx98sV36h8LBsV19h1lwGNQguqErAsoCLBFpCv/gOdSaVy7bnzfdK0WBmMt+jfpVL/9EcjDNOH
#9a6GfYP8AP0Mo9NuNxt7+L9Q+mLwC2bRGO/LQjvlDwWK95UmHfxfeC4A/02pf6bSf+0o/O8W9n/5
#pBA4sFCcJGBf6Xxw9rq/D3ZQRM2TgAgg+/aXHkQLvTy92CeKUidHbwe9i/5+CSod9IdDRER+tK5K
#P/VfMyvxffKDBvmEv6mCaKd1Ygu/mVdnrDYKTwIYmrNa5KdUUfwk1S2RJwd8POwLr4/wjOGXp5T6
#9q317tFHDS3Hj8AG/3H/i4WfkftPZb6bJAJWx/8bnWah/5NLit3/DRIBKfC/1YjE/2h1mgX8zyWp
#+P9k6dzMTH/32jOdW8tZTBcIHtYb1W4F/fmq2hZJAgTbAZ2k7kL2x+584YICcAPMBZq4yPm781H/
#5wseAwBlQXMcr5WbwLQBayaeeIBIBbrW0cfDQ/BhNkW4+z6AHG7HS03AUdu7c1BxCOzdCT7gMK0K
#9x9ZsR10HGYzy9v1rJkF7lp2GQWx++Kz0t/DLi0uN+Ibu0vf28WaFNi5HqE4YsoSkmExdoKZsZi4
#IxyCyaD/Rb9xBG6iEW24C0xv0Do3E3Bfdw1uzmbG7/bCuBrPEXVBejMXQQXRKcZygf1zkxr/438I
#3288c2IZlXvisI2NzrNAKdtyJn60Di2TVGdmX43NRaOCph3W960AfTQqnrow4SGLdrZYIjoLutI2
#yUqBVbVnzd07XJRne3PU23XoaAkVR//6gb/7LT1W2EUeOkx3oFnuyTQVO4FkuDDQ+C8C4YroJdoO
#y6z+03ed8Bea+C2nYnmTfFVhSSfWHfoDnAGhowmIBnOn54KfKJ+te2B53BEf+kA1sckPWBLi4kel
#eXmX4Gicl0O13AUC/fbvljgGrFU+N3G5qQvxjAP7zlJWD09ZswB0Icni4gyaC8NYeGgC18bLb/xf
#nZd0z16C3Y9vjeAo7Bs1/pmowY+wXjzKgAAgPI94MhrNzU8jHIMZJrBvNNphCfCvhfNpXlOo7SE0
#F4jxEb5SrMSr2AIBumT7RqcWjo3exiod4xjdZrSueFdgGJ1IQbxvjjUZIfzRdm780dXyGu0zHli0
#VTRs8Fk9w14JJ2SK0HCtVq9HSt+ZMxsu+gjecOxO3hfX8XvsbxFBr6PToxHaqwccqbo62f399wp9
#+NHo7DLZIO6PnwkD0T2dWx9d73b3zrY++prvhA8C1IAmE0FRAutY1sy9CX8Am2GxvJrZY+MK4c5o
#bczFrgjn0H2eoYPuXztGtbqrqUb+YTlhrfGCXm+O1LjjwHQsYDHtHhDbE8Dhl1fie1eBMaPbCkeR
#tqzPDPuZoifCqAyMjx8/VrBnFPYHm2RkZvKQJT5NrUZbPju46J32R4TGGe7DfZVzTno/jwb9/7zs
#Dy+GiEJi9X4+fAvG82+O3o7enZ3093eD+ULIArdjYYbAE6oxnhAbvcIQ8qflHaNcGcN/sZkOLILp
#BbZvOgZZ2T0BolcqEH50v4Zd0dUAqrlesM+cslfoSvroizxRyEOHv8KMaMIC4nwfCp7URlIs/r8p
#5s9fMsj/I/G/ms1WEf8rl9Q7P8cMCoRhTJYYpSjBp8P+68u3VCcffhMtAO4+HTQEj88QmHnXOz3t
#H+/7AUI3vBK9p1CsP9gPYUFxU7/YFHv/N8gETrn/jXpLtf9Bj1nh/yeXxJEOzv9dLiK832aTMH7p
#2WDMXywgCtExzgcW8YK5fYM9uCOKwPXGVmnYPxj0EboCQOWH/i+ZWMYNhWdMwgBGmMbgWODd2eDo
#f52d8jbEoQAV8zuCb7wM81XAPtDmm6+AtSx/ZF20mx0hD033oL//XY17LIp2inCYpbUHuA44Uofo
#MuAavkJi3TQpqgMXb7+JaAvWEBsZ+Sn5UhA/0VF1O694BhlSp1ZizmkH2mFxn7YwMrEs5bWHX2jn
#9Qb0oX6mAyAbMugjqP9a250HIXiu9uCqBXGI4RYcxW3WSiiXoB8GZ5foaOFzxjpiq0R/S8skfZPW
#KU4yILOiIryldZhkKQyyOOZYKDagt2Qf6O1Oa6+XPe0b0ZfdiD7Zhhz/2/9tZqPLKob13mOW6KKf
#LtPzzHtDcchFPkacd4EjvAIB+FJT0vt/94iYL2JKef/r9WbU/1ej0P/PJY0hqqKfzOh4JBNFiM0S
#TC3KKTBIAYj0Mrd9HB7Gxb8gOgsuhsoEU2B6k/L+1F74UsSWwPIDo/xiC1ziz2znVmGqbJeNfaOs
#5RiVpeBxMvdo4dpOgHpdBr49sfBQsPeTaNeVjzJDS2iTNUbn8xHYp1czy7i6xw3Su2aAuxSpXcw3
#8YAbagdbXEgwwuzcyVYZSwnK28Bz0mQy4UFSASxNiCuAhQwo8+9Gzdgz6tt/fSnOCT3jYVAwmAVw
#ddFM0Fo5wjZK83nu012ktBSB/4472bQSOAD1Vf2/Nwv931ySfv83qwGc+v63o/7/GoX+by5Jlf/D
#9u81WtVGvVqjZAwiW+15ug4w1Pyn32itrAWskR8uzPEtej+J/JT+gGA8t/hLJlVgop/rLOYG/P/Y
#ZsLRiU1lqtdLJ6IVDEXRRWAKuxAFbeFZvuUEobQHymDf3SA4ndvBPpGXRhsPq8xN24FQ2bBEOPgZ
#dWC29bK6K0715XYVisKr+9J2JtYn9PVlGSEyvKXPJBgulHrA+A1R0EXlaBQ8JikLC/ESOMqdTp84
#XoBLtYtD+e1q+sQHJ4cgN+JDLEQ2X1zSw/8NCn/+ksX/i6r/1eg0C/5vLun07LCvCoCee0xFyi/p
#7/9mLQDS7n87Iv9tNQv5Tz4pd/1/zLEXhDlEsBAR5lAZT2gBQOpJJgC0qsYGgNROtwEoZUJ910R7
#/wDa/5r7v7gPpq7z3P4/2+D/uaD/nz7F7f8mOQAp8L+BclX43y78/+eTVPqfbP9es1pvVbsY/Ika
#/5c/Mjg4JYDQBKXGWcWf7i7v9mogAxWU+1lpTOwv79L4ACLhubwzdvH/S/ri0AZQoKhhEK0eHfdH
#r3+56B8gHHa/TolklHd8dPoDdly+P3YX9+H3818u3oG48uynU4hQOtx3QCwt5JMgcwCyjwZnpyd9
#puRQvUOIkJ5RcU8j1VUDdz5Dk8RK3iswKIjiLJoq+j+QlJIF+N1yRF1sQdeedreCOXPWfrTbs3lj
#ggTV/LDQjecuF+YEWDD+vY9gFPrjxp4YdWAXYsEDLwoyFKXkkpcktaA8HtfYs9D4K1N3bqWprjMO
#ENbt3UfZe4wJInJCwGlWOTwicEj3XnzG/rMY04YcusvT15dv3vQH/UN+UEnG4dnpxU+Do4t+5CAn
#slnw9DiDRVXMXd7ZY9dzMN9pj8weVC4MWeXCoLq4BVvmT5zi3v9NcoDS+T+R+K+Nwv4vnxQFTwUw
#+DOluPu/SQ5QKv8nwv9tdboF/yeXlJn/QzCOr4L/w+iSUjbCJxvR84fg9kRT5P576EI8v/4HhAQr
#+D85JP3+56z/oYn/2G0W8D+PpPJ/YPv36tXvXlXrEe5PIh98vJ77N/Sg9BAo1/p/y8LdCBlEY/TF
#3fWsGxjTfVId0Fwlf1NSG1flSh/U8wP6C3g5lqDHAcHy9svY+S0a9F7lxZaPsiuO8XL3v359TzU5
#fv2wuwM/d/3d/4IKxrf7xrflX7fe/1f5w7e/bper3+7+Wt9dvDQOoFfCN/qXgV5d3FJ9+0FQ9+C+
#AQ6NMhkx80ux++IzNI4KC77fCndxRVox6eF/zvofdZX/3+jWi/gfuaTB5fBidHz2dt92rt3i2v7p
#kv7+56z/0Vbjf7Sa7UL+l0v6E/t/JFhcKQv2uzLmy9DaL54rwO9/4F4vn8L5/1/Wof9rrW67oP/z
#SPL+mx/9JzgDq+9/vdHpFvufR4ruP4n8s8lzsPr+N7rNYv9zSfH7P565y8lHMxhPH3sUVt//dq1b
#6P/lkjLtP+iRVIPrdfuATU3U/+tE4v812wX/N5fkWb679MaWUUZ7Pwr3fDRzb0ZYDasMZvu2XzY+
#lwzj2vVGljmeGvtG4PpWsHVngl9TWtTfLqEymOkppX0D6oCTyqWFCnhWYDlgaTKyndHEvAdXldBO
#+B0+lh5KJXl0vuOPAncB9vvCkMbA5qUtmDPTm48sdF5nxr/tG+Wy8XejbuwZNT6ufbCMg6KYe1rB
#FfxyQl8jf3lF/Kuiga3XMWnH9MAvqNR2FRp7X/tQRXmoHKK6A3fszmDByritMvpqORPsk8CIdhUd
#trCBcwsRL6hbKB63h7w9H8ZJWpa3T1mvF5/xTt5a9w9luqT+whxbMZtd5QVQYTogqX2pMCmASk7s
#OXOPrC8ZFkClsRN+P7DH0iDKvTsLfDDAMBeWZ7sT9Uw2azVYXmjRxKeOFPMhrwHbNkVrO3VnEyNm
#FLwAPgzzhenZPmrGXYDLVteTC7Ov0DCoIY6ov4QR9hMKA3bc4LUHNcCLQrgfxNGvn3DQ3sceqg/o
#CL7/gJpyb3k7huYgZW+q8OnwdaVM77+7DBbLwF8XBUh5/2vg7EF+/7v1Iv5nPolsLXoe2BtF3ggM
#sxLgRCyYQFCiXC6gxB8mZbr/6BTY4L9oTQiQdv9B2Kfc/2a38P+bS2Jbi9APhJeRyw8qE+juEy/1
#gGOGhUJUXyiKMQqw4dgiVbYBhbOuzeUM0GOMNAhNyFi+2oyznF9ZntRAsyY3IMAjtTYdslgbQyO1
#ti9NdG4utkjQ463PWPNCQGuFNhkGayh9SZiiMAMJjyW9hOuDUDKGJkIlF5MX5oyW2DHKb7Gtincx
#NZ0L1nwZaj5sYyornOHnh0fA2/j7b40bG+IBrs7/abaK+K/5pOT9fyTjh6YU+N9tdNT9b3W6Bf6X
#S8LUJ+F4+PMRImER6ENgp2yUl1dLJ1gSQMlYJ/iAgJKXPbZ2x6bjOjao3pGiVPtrl/ALyLcR+gAA
#8AFC5SH4uzteeh4C/7vmfNJp7U7v5rvWlV+5WTTRF7tiT3SsGAtVsoN7DTuK8hIIngo/AHVdjEf2
#hH4jPwBeIqiKI+gQCD+xOE8He1Hyp8bWrXVfcZ3Z/Q7x0Ui1AGe2Az9AgdA37MAANTrDdO4/Ti3P
#2i7j1uDbCJvUYd5BgzwKLvskfAxZPJjkD8YL0sLYnnijK9A3hKfifZla6u3WykC9P2CAf48miF6f
#Mp1JmU5FZedM5rYzgvYwTwc4Ew48uLR0ZOq3yysIShOg2ZkLu0wLyTNCl7dJM+RZCRlxM4vMjQ6f
#sEU+4DIPbI6JmwS6CLr1flXTrDf9+Ij1Th2LrxsMWxB5NOzrI4ZjiaOR+9TNXzv9Sj1zd4F5A3mf
#jVNy9dkFMx6iFxRdHAQ5bC+WO4qu14i4WYWyUQYpNKC7ykIdXUMwkhB+2SYsCcq6H03c8RJhXgEa
#kOn7S4bXAqPQmod3IeSsvS/7gb/Xw2UH7sxC60DXz3bG9sKc+fz6MGSTLumQAEN21u0J4LbXNoJ6
#uFn0iFbNufk7wu0++hB+riye+AzjB/ci+tH79iQcRn/sHbs3tlOWJmbQMXh7b62gR+J4/Y55nRfu
#reXQsbDNJCP+NjwDuh5JX+fL2axcUheRrgHu8DUQjgdTa3x7bN5bXu8OYevmlT1DcLy8EymIhneE
#nexKWejrIQ2+d+nN3rgeboqWoTskDn5mOTfBFIskUHVgZvjbxvdGDR018RswMsVpcsDK56sBrULb
#1Lnv6Go5vrUCqZv3dcom1UJeaceGpBV2cOQt85sw+TNMk4BVN/p9vpR/H6L3KbCkT8eIBHuNB0V3
#Vl4eNJyxGcRNYcd4j6ZrAAvHdoyYQsDdefEZ/fWwixZwWwbemdYRGr4yx7fLhdBuyH7Ovn6vcSP+
#2uuXsljvtQPdYdKQSA5eEPlqy0ASrjcojEl3OioqUwUuuCzIAjBswi1QKIFKAvCoxsCOKqmB/UrG
#j4bW0g0qZiBQC+eKzVQht2qDICTb4HD5+KFhuwdnjIZHFFGj40sanW5s+EWJ9kX7kV4udIgNTRJm
#JKHKFNPl0k0+dvGlYA+blAkgdnmFcK+RHRFO4QvIMilWKyPC6Ds+qFEUGfNj0W7AedStprR9aqaw
#XNLDrBme/lUXMQLOGeYN7RkOejtKeKvcgCAho4kFbyi953fuDE46DcgIHU1s/3Z0cyXmUs5NGREO
#BAJYzti7XwTWBA8v8PBWYLCENsmEnRsRHgt7yQGDGwXwDPqGmva5h9ZJOSy8WAYjdHwWqA1rNHUX
#PCplg3U1s6+t8f14xqZi3ziuZ43GU9O5IVAFnS2OWlgIvk1sjFEyCBd+SV5mWtzyPARZ5wgvBGfz
#8KgM343OL18fHx1A2BDwys7mYfz3//m/hgkbCjqrxpX7yZia4J3emJsOqo2feQh3WS3LUH0VRNCy
#ZfKMnS123OhPdj7hzXCxw1u85OiIl1N7fG56+WtLyfyfRwr+aErj/zc6qv1Pu9Ut/H/kkpj8jz8D
#9kSWAGovLrr5rCIFTXDz1WoIHJAavIxYMfKaRRvQP2sFFNhgSr7/jxT80ZRy/9Ftr6v3v1v4/8sn
#rSj/I/zU1GIcc00tKSHEWcR5QbM6A0toRaxHccQM4sSWKk4MGaaryDQJqIKg2yECp6Jv5mwGmOgW
#pqyhB0ZaC30ijHhsOlvwN/how3/sGLXtbUpeR3C83uHJ0eno4OhwMDTm6PQaV5YBv3yM4gHrGi09
#RFfyoX/3I8L9ApdwsHGuzPDF6N6DsnsSxrmGjJVxWtaWEWtYD2u3FSHV15iQLMzI0kCjVa21/gCK
#MEnw33s++W+7kP/mk5L3Pxf5b73Zjfj/7XaL+D+5JIWAR4DbsxaubyMAfJ+u+c/L2lac7r8RUf/H
#4fRGiMofzZcBlQkAyDw6Obm86L0+7pdJdwgpmGAmt9AQZuzwNnz0cjqgQ40e3mv7ZumJjzFkjkCr
#e+lPFZYQZRaBDpKuppDN+Ey9/rDR7pTjmCLh/LRsEbSqnDUUcly1axvdBUz2YIYZ/2REdOxLIucV
#+KpoDu7EovpMHlxoeBoZnwk+nHu265Glr9PPopATy4Yta2HMTB9cxcJ2w+8RXnr/gWyBT6VAaLnR
#Vo2peJR1gxdqGJjBkjDmy6ZzX+Z5WEJ4QV5RlIfbO4BvJ65ngd6TUvQU43KUISQMhZZ6YCMx+TAY
#4lm2Pi1sD6GXD4S3hUU/21/+45xDSob/+fB/2iFuwOi/duH/K58Uyp/HiFqwvBGRYAcCgBJ4Nsy7
#lsyqKb/4zEUjSiuEZ2OO8QVGXx+qk1ssia0SiAINus6DIiMvSV0yqDdaejNf7vkzgE786Oxg8Aj0
#VQwEBckDBtbf45JVuV0CtjV9hqQH6xMTc6wz/NHfiulzG3WKOwP7mS8T3CTf/1z4P7VGxP9fp1bw
#f/JJol52iMtJbBuJ0pbIYuERzsB4aSiMF3L39Ryi516WP01KuP+3m/IBsQ79D/HfC/r/6VPy/udB
#/yNkr6bC/3at8P+XT0rTPxzP0AIhhO659Shv/cfrUT77JNKUQWM1xuguZFUaQ6tVYVXW0h2Tdz2b
#DtnIDAJzPJXPDRkx1RkjI5V0s2gxrvBLW8KuEsronz1Ueg+V3sN/kOzdHl7D/g/DA1L7nHBUNqZz
#B8u3vt6dcNLWWbhwoBGOG1GwTV+Wn1zv1vJOUUN0ZXYyVhwdnB6NVqpz0DhwnQC9EpY3oLThwDIn
#Z86MtPBhu5S4/6KymbT5Ascwyk+7BUcX9HxFrUFUexAitGFfb1/5TI5DRyZ45oicS3DMQbXvCKeQ
#MReZgNNXT5KkuOdTfiLx4MGEaogcBh2skCkpFvHsOwSYWBmZb0njbLGDyIayAL1/zqocXvROD3uD
#Q86snFgLCME1wjyx98kHkE38Q3TVZ+bSGU9HDGGI3Ck0dOva/qTTzKxgLqGo6zeam4sFQvVD8wr8
#ldsZod+7n+4mJmUvWlchzI3qB+IbJyoJxqsJxigKCvpuOaoLQugy4v5j37gyfavTolzbv/2t0j+7
#wE2dHJ30Kz+S87pn1KvEruOAaEZXgHu6Z8wRfYXeJS/YndufrMlfjSt36UxM736/vLtLV7BS2d3V
#VEW7gE4AZn7jSKZV/NB+pKZD5sLmXYu5u3d1c7aYmoRvfGs7kz0DwM0BviLkVC6s8R5dcpA4z6yA
#/cRyclQu/I1W3fx07k78PcpoxjuKvqEDOvEf+AQqFfQnWZltnb4lie82urKuQe1yYoGLznvxDmlB
#Ce4salvG3kAGVShvPoQ9hLdFoUzYCDvEAgjCmRzU6IEgcQGkwhUNPJE0JjAUec+XDD5hbEW5rEwf
#dSICYaWMoMMdAs2EkvCXHwiwlNiMjM1ZKJGh/YKyA76vAnDGO2w79Pb7cHmid5p8L9ETom/D/BSC
#RwhPqHSNqi0dk5ifYN3w+lpwEfr6kE3HV14C0H4W5/dBxliDGTpPlgdo4phAVdeejMkJBL5kzKlj
#/FVoHSrAvzbCOSxPj264aKr2BIbkWGN4Zdw71IT8fEJ3MlhbtWu4NLaFGb0j4BoZDJvWoL3BdDm/
#ApQ6IEVRSYxWKQuCu6gKH7A6uY9gz+gaLbLl4SY+ZDIFWyI0Cu3N2tTMT3Yw/cm6OmIc8sx0wRtr
#Arb+7HmIUAYpu0SZ6MBDJk9ViQJRRXsc7iPrcog5af3flmhYrFfOesNPtGehyzy2tlbc5B1q/LiH
#nhb0d3n7Yc9cTsIugB9uJG38FzgBBF/1E8ARRfeowTOVYuzBc0aDje7RPivh2VqVMBVqph1HOkRe
#Ba3P3iEW2V5ZPfRtSL69Jf45djIWP6LvSUqNY/wGHIji8pQatP0emsAd2ue4DoZWcEjg44G5MMeS
#gaBY7sLy0HuBFocN+MhRJy2aDzb4OI4Ig1qfR9sCbCimCJn4BX37KD6klAX7RbGlN547Zx8GBDWE
#LRVr3fq8B0CdboTxa0wbQ4PFJCJXPUvppK5QYy1iNwJTM9ubxYw1cXx627OwzCoWaEIt/ZCFs0cR
#u8C8KWNN07GLsJ77CJVOLmwZUZjgIT4KGnYtB6DXpMx2AvDSclolYTnKUMn96JCHBIPR6Cgp+hnF
#bglg5KcKO+xSa+OvTKEEzZfOCQyP1ERpdLDD5oBTX4Qp/mB79IV5g+nbgGKVqNA1AvFWVniJSMHR
#2LeLJ7x4wjfzhIP/EXSgKmBtjOAJunIV38zMmaXHMTNrkXS2HrCVj/46zEVptPFcOVpsNa4sXeIK
#tMDYg6+HB8OjQ8++k5i0cwQ+JwR4gjOVEFaZk4nrEJtRsDSojB2b0AquYUSKoUw9PY+zgQXt2BpK
#PpmMx3VDXxR8FCXGtKCoz4geMo2yHQHyp0QH/5xtLIX1tMSdoCTXPwWdx9H5oP/m6OfRYf+4/7Z3
#cXR2Kj8QhvFTb3DCSl30Bm/7F+ERqwtGm9t62lbzFmiYfOL6afUTmaEDQteYL1ls0At/4luFIN6n
#e/aVQOOPPjv3lQk+C3HnjfBAMGxRuS/Chcq8f3I14bWiR3XE9JIELrDwYK2yjM8txls7Jct/89H/
#67bU+O/tTq3Q/8slMZU38b5pLDm1103QmGPVmRwjQxOsqK6ZDLahkfZCGQ0gCrEtid0BVsFRtKjz
#26w4ndikQBAxqKJvVCVdlHbw0Ai2k2HuiezAxP1Pvv/56P91u6r+D7r+hf5HLmlF+09BeprdCDSr
#OiEXYWS0A51bE3s5L2sayW4NqjqXlSRPGerX69oG7IiRoE4hUjdywgpbszYaeBYLWAEoxN9/BlMe
#rwS4uv5fq90t7P9ySRn2/9FKgCnwv1VrR+F/q7D/yyXFk38IAArGIBo6Grga4icN+QyaVKidCmun
#Yt4AI+IJHTeCczf05cK8GVo+fqY2pb0HD0L10XqI1LJdG4mH5sW5XgwHKroOfBLHgZLoISSJsfu7
#8CfzeZdp4sQMP4MrS8mx3+Pd+m3CqV8yCzDjlqYzB5XgSk/u8m+1gScPVi+aoa28Z0U/rCKhiVZO
#nphyyNLXm5bOY6k1A4sdjH4pSf4q60dr6IcIkF6E8MBUdse2SaOcZTwaUR0pzaOgBgkLVaNYZDCF
#Hycz6wS9KYEBmHDEqM6mnndHeMfizGO4oAmLI26m1iyeAhI6HWIZ/7RLxUPrJS8WPRJrrNBz4ylF
#epqUAf9/NBMojf/T6rQU/L9b63YL/D+PtCL/J8omTijM4VY6q0h8bkLehRwyR4l4k9HFk75DBUKv
#5lzqufdskyn+/lMvYhuwAV2D/9NqFvyfXFL6/j/eBjSN/yPk0f1vd+sF/M8lhWS7KYRoGP3uOmDT
#L+gAYJod638wXXrMxpm5Y8ZSMX+XwvX6iBqxtjiFEm0+lCT6O0ZthzhG/H2EIfK2gDFTZ0squswd
#jn8Wg9gISnRUc06sQzTo/KmJWewPxh59SmT0HxxRS5YgPFyKREvixlFWiel8jCaOP6LmWIZgXSTk
#gotHPGMj9GW1iodt2wnwREegRPfRlN1I8chHdBLcYe6KnRDBTZn59tVEu6a7VAo7jaToKGIWEpfF
#rjBxt1tsWXeMVzuk16rtTKxPcCQih4g3gM8hGpj/XqgCvBuEQ4y4/2HwB8bVDpX1n1vejbVF2hGP
#3g5lUp3qXJtpuAqks8qLz8JAHpiWp3ROsaaUNbsqcxUe7JQqdjeIaeCq25FtIzJtgfHvxiv9NsRu
#wAbWN3ahyXpkXmlyd8xZJXXJiR97xwyia03vMsoTAxhRN/YJTuxlm0hoWXPx0HftxU4fAHh6JWZ8
#IQQA99uoGNYFgE2XY01QD9v4G3XQTUsmQwst30AFS3HqZZ67DMD13xXm1ongJQl24VpM8yw8uWhR
#w8BVOJP2HjakHRdZDa0fP81F1m6UMg/xYiZNhEfIwfVjouNIG5wcEEe5xtEFAY4Sn3w4LOEjj9BB
#Df9i4z7orl7a2ih8syzPiRIQRXdKRfhChi12yScpfKQ1qef6zMPNAm8Tx0saWGvApOrTe7tPx/8f
#rwOYxv9pRvz/ddr1eoH/55GYvpno2F1UNRMhmKCehpXtEPRJqBACJ024CFU3SIr6IN32bz+oASeo
#h4QsTdALyNp47sX+AlP6/X+8DmAq/7ep0v+dbrPw/5dLWpX/y+98snZenSEi9Y4af50+nqtruIWI
#kVr3ynVnUk1M2mVhXMdO4A/gun8jKf7+e5Nn9f/XLfi/eaTk/c/F/3+r3Y7wf9ETUMD/PJLAv/Xn
#5gwcjkA4Gs+6sT5tlX/9tbqFCFbP/RfO3H5R3pHDWI5niGba1rBQJlcMQYuN2k6Ar+AmR3B+E/F7
#syoLM0PMeImiRae9LFLvd1Lw+Iyx18kIRv4NtJEtpq3kcp8viOXc2I5Fi4jBvsMi8IHpMbpitqaA
#GAacMgqE+OzyWnE9OXEySpj2dZZjf+XlSFmKxGVIXILE8PSYwCdxkzCFo0z9mcOwR86s7vCju6cN
#bBtqtIr3DgsoYI2V88MXnvwxCl1ChbmC9ycZJBj7GjghMCrBGRKR+Qs9hi7cwAAjWpKUgrywJIsU
#pQbbZS7fWL7o9k0MJAI+2AR9ZvYT5SzQiBEBxIAB+wk5mlMGt0IGeaEatAYeSkar68b2xX7fRubv
#hpzoMtFMGC+mpGf31KmgfTWjiC9xvIBKUHUIz4LLCEzkheXZ7oQ3RvMn5r2P0eSZRUqhc02Dfhji
#uqJlv7UX4KDJnI18x1z4UzeEXszdg5w9kk6ndM5xQaymuVigWdhzMPxBJ2N2r8w5ko/Dolgegktz
#EtzS8e2baeCPqCcOVO/fiEQCv2+rvjLyRQNnBvbYjPILaQY+/8IsxdMqXWtSXJZrGP9u1ImiLckF
#BggBr5Or8IipgTpZX9H7KawabXGklGDvV0KRvZhLvu6BTjmosceKH7uYA/J0pyPrxn2xsYuT8f98
#7L9btUj8306tXeD/eSTGVY033I6AFXMyARxI4smiJzBDTfxSbigEsBisBcMmNgMNO1gcCC0OPOFw
#Is+9C8+Xku9/Lvbf9W4rGv+lVfh/yCWtyP8laH/GYpktxUPwQQtRZvCjQg9ntToXib01QsOKRO4a
#1WXkKUsDk6tq0LrRG79nt3tvK2brAlWVKZSPUp3RTelbTckouRNprr6F8LDAvrO0jHyBFMkw0K4y
#S0oUpQoQCMKphCsiWHyGXiOBjnTY8xqHJYLBZp5H7P2Ph/9+c0Ps/3X4/41Oq+D/55ES938z7P+0
#97/ZqKn6H6128f7nkxS2eZMa0Uh8Q/JJ4RmuxI1nzcoRMAjvU9+VVE3UoSNRJHg7M6ZzznkAUgFq
#KUsK/Bvm1uGMEnfcHmmJN+RB/AB7zAdNxuIrDSVNlln/xim+ke+iHiedv8H5htE10OlfJi4wVcYs
#JUUI/pEzd8uNWr1Rqdcq9S7hUg+5sb4QQHgoWuyf4z5P4FGC4C+Msd6/vrbGlD9T7gGWxXLOmS8G
#yPmWfe1xTuK+IZv60wIDts6E8aJZHmqzT1j2PMpv7AZR/BQ9u7HqtmERzTYlHNOwnj44NQmKjObR
#pz6BS1o3A+FYwfAX/JnZE87MjsSvXvEqQRRo5lEDYxYxfVzdjxhGwfbf962RObuBANLTuSEFyI71
#mhrOJQyGvaHhc53m8vT+xrYc6htDs8pEbmPPAsvDkW3x5K8gfg46ki56C63AGvGAKqPlYuaak1A8
#hbDOkXkNiiS2g3BUkwqqujHyMRhinJovDkmN8Vjje6OWKhkLp0iDWbOdiJljZJaGgSuakrteMqXo
#kGg2r+q4znjpeRDbgZ7skbY1oVxKw+JBee5H8E+cEvG/zbB/U/m/9XbE/2ezVej/5pIYF5WhfRH+
#qwx5yd+Sw0udg8vos1zc8i8zJd7/zbB/0/X/m3X1/rc7hf5vLmlF/q+IMa/OQhPwgNW5aCIR9RiO
#V5HEFL3/6D6MNxb6G6fV+X+NdrvQ/80lxe7/9XI2K+K/f/Upef9B2GI5kyfW/6i11P1vt5qF/kcu
#KbA8zwQNKMJ0IfsN7LcycY3x3OMr0tOm5Pufi/0Hdvaj3H+EAhT3P48k2H9EvKgZQrQnv7m3t6dx
#k/tQjnOfYU1uNLbz8HV0DWGqR/bCp+qlzCZwTXca0KbqBYQwoAkti2gbYstKPRmRoaJGqtVd9H+K
#wWs54qxXMlIBNRElhxlDgwIqm0mYy70FcEdA4NpBkDOludUW5sGj3ifNw7r1o3PQNWwYQjgHXkT4
#VlIDUu8bpJMqXatq1Bi7RMNdc9UOIVYzfGP5VNlEyg/V+lkUBUNtgoSMFkMlyC3wiNEsHkK0BRww
#WorzoGTjb+KygxMrCNAurbsRXXlqRKRw+lltX+8FOtmvsmKaYchBFWONNNRy4YZKlkLRBqnJjM6N
#kLL11DoqGrM86zGRzIPkeiy4TXwUH51CO13uK0XRBgAKO2zKdUBlZaMTuSAvJNuccJsR/RJCdkmw
#H1H7pMdhxAr4oe/iEApj6YkyCtkKI2r9EQ43tP1gWkuaUtwsQac3z0uRLMf9KF4IyV9n/H3wm5rr
#QMXokmdxwd0zlYnLh5KL2tkAPOvG9gMWgzUWEo49DAnRTF3fRmO2LXbXxU8ACC0LHSscKJjDwfAT
#buJGNHMhTcAncVRyuIS4UfFScfBAfG0iYfBi70iMC2kRrEuOpAXzK1buM+wVlbzuGP7CGqNbJm4a
#eqDha5V6oTb2v2ejYW64SUHshBuL93RIBbGpiOSEpZlbVj545bu45nPXwdvIOJJxqz6eucvJRzMY
#T3XrLi36zGXRcGne+7IYhZf5F8RWeqHJlCDvhAbkDLhjM9ObjyyE2czCHoWPJVYmdJb2+WGHRv2G
#fWGAA/YE3RV/S3pctsGZIZWuogeFfX+ojBdL8HYmyGjDEwKC+5+Gu4PDYZlnzy3QeqEzLx+cX14G
#9sz+nUjoealginC+qTubCACFTAb1FwqX7Tkoc5JYHZ+Nw9c8dnessZcw9DIVEwtyaGlmAJEfMbU3
#nmXRUBpD7KU4w+SuUR14H7416pxe2fhsDcNdQLBh1yMDPbZ8/2JqOhdsWGW+LOy/H6rV6vY65Hoy
#/ZeL/U+92dLY/xT6f7mk9PiPSc9N5giQMY3oYkCmBGVUWoqUXikYo9KYprxsaSQiHUobLJP/Idak
#z6dc8X342AJIlx9SBM2pBJ2+qFJz4tMpNxoh0MV6HPWklk+WMiLy/sPO7kivDR0a/7RHnk/0+rNP
#PJonobu5VRlQ+xYi9OV+/olKbpV3yjvcTyUUxCZZoh/L7UhTK7TEfb6uBRb/NCkZ/rOL9bTxPzs1
#Vf7fqXUK/y+5JJn/71m/LYF/Ijh7KH+/b9Sr4M+LklK0BD8aTIP0oy+gYoKi7tT0p/bY9RZwuhjm
#IrT/v783OtVOi6mO4n+CWWpjqIi+sVa1paihsqFi7mSZTvQm9GVBCblQjYC4HCfdM84j7evcc0El
#WSYYIA3h2hB8Da4OG9uJ6SBoDqbkZQgjDLdMHt2z73/S/c/F/rPZ7Kr6fwj9K/j/uaQV9X/IVUlX
#E5LcgyYU1HgD1Ft/rhR4ZpUoxbqgwwklozaS+vFqwgAnFIxG/U1qVQrym1xw7TDGIn8soyGtwDBL
#HZ+EENNyEO3HxQYf1CiFc5lC20jOHwxVvx62t0vSXBKjA6XuMmeoJI+N8eWlsYUPkThgynAX1p2w
#kMlHXjJ1HlHGcdSIVo6YFLGkDZs3dB2onPP0xbrKfCFkLnqW4npL3/jWo7a99IyoJde35BX54eso
#QIpMsgy9v2rHVKdsqCx23lHImD0s16OiZIl6n5LQd52Fi3JUU4+EwFrVT/S5n94vIsXifzNwhbQZ
#BUBA6lbU/+sA/Vfo/z19Stn/jSgAptH/Gv2/Tq3A/3NJhf7fnzul3P+NKACm3P9GrR2R/9TbteL+
#55E2o/+3CT27OC27JB27JA07AY8s1FaElYyqrRCz/7QxNWL0VZSd08UDzKA7llQ6EjPmfQ1ULzit
#Kvj+pUqm4wbTNYxqfomFBJ2uK3SAlqL+nFiO5MLZm8xtBx9EX2lOyIF5+VPmigOdD7GcnANHdozl
#lr48wqhUkW78PS5cCj0bh/fVzy5URKU/aK+8kaCfU2ADX19Kef83ogCShv83u41I/N9WIf/LJYWu
#WLHrF9Dc1yg3kNxQpv41aEU898p/GSnl/m9EASDt/rc6Kv7fabQK+/9c0hcn/38mmT0+7n8Uof0G
#U8r934gCQMr9r7ei+j/1TmH/m0v6o8j/GUmX7no6JOsyNUpIuyzOeButaq2leuQNqb6MUnKZ/lvD
#CfCfXjK/Wfn3c1/AZ04y/L8ZLzbp+IUmAOqryf/qjVYh/8slRfefcfw218fq+9/o1ov9zyXF77/p
#Bfa1Od6ADsDq+99q15vF/ueRMuz/o2WAKfh/DZz9yfvf7na7Bf6fRwo9d9y47g22eSLbPmIcu1Eo
#epAcNDNDHY1sSRBd3YfhVMNvRLo2N7kjAoTlHp4d/NAflIn7D4QPetQ3NPPwPJ8vAyzbo8Q9xeew
#wcB4ZpkOQiSJf/PRBAa9dAwhwKFUAsRpqt9oQJErnjVG1D4h9c0x9e1c/qHfP6dOleeuDwszFvwg
#+5zNgLFs0deJLIr7MrkHGe7/o2UAafe/0Vbhf6dd2P/kk5K5+NRWmVzrhwq5mNXF7U11Yt1Rm/gF
#4a4RRQAhKBuHGWKDGYAMcRksAZAv7M58TSnD/X80DzD1/ndU/1/dWqOw/84lCf51yT3eFAtQhQBJ
#5jpa9pQRG3usAAebS/H3HztM8X/bgBPYdei/VhH/K5eUYf+fmv5rNupR++9Gof+ZS4rQfxAEZxlY
#o5uZe2XOmKcICGJFfLgRCK26P5Oc2qBDU8YqkR56AkLNvPKP5wej835/cHT6FkdzJ01T9T2Uf3R6
#0R+c9o5xZc+6tj+NZpZzE4AKZr0DvRKFQEnvjn6TvVDSuVAxxYiWocGYHBKyXiJm5ZbFmYl9hIKP
#aLkyzQr7qpJRmAuEzqJVJcHbsSbNZLSwLHgHR57p3GDlzveJy88c6OEF/qCf62+zEZeQCFHpwzmu
#5pYwzTGhpFkqrRZnAvDhpHslnFgzC5t2ISwksBjpjWl8vOpBgFaLi/dty1MHKw8hsKmdJZYE+vbv
#0R3jrp24CigtDU5g0OqqdTjHAR3cO9OemVf2DDwSCsqnYaPcN9/fjfKg//boDE61sWeU/9cZPd/a
#KQuB59nUDcNeaCOIQcZdi9fAXRN2B8llLhfZyVZPMve1QIVw+j6E5vWrzRcFDF1tB8JojQJ7bgGX
#xEX7ey/MCSBt4H+0g+lW9BDsGOXzs+HF20F/WN6mLV7ZjolaAOM/3UDSWzz5Zfifx+Vt5j2MTjU0
#JFQOFiSUid47dEVJYaZ4LfteJMvH/ktifklB+bIAIBqXL+4yg4kwur+e6wYr3F+dJ0oGDUL6Wwss
#8HhCX5RMUYb7saQxC7VeK6euH6y2J3A1voE74SxnswKjf66UAf97ev5fLeL/o1Mv9H9ySdxV2moe
#wVLhiM5HGHuS0ItGu/vi2OF/upTh/j81/69ea6jyv26t0P/NJz2N/p9kB/h4ZytavyoxLlTkmGFr
#a4pJzQA5kUVTb3JVGaPz5M4r9UrzVaumaO5F1RKNOK8dNa2iXMbAaV25ssYxilGETisSTvHw/2Zs
#PV/8r1a74P/mkpL3P5f4P81uxP6n1W0V+j+5pFieKXX6VCa+5MjbQb8Rc+19MN5Gr+CWxCXEhXeM
#2o7RrG0T+2t0vu5ZcBuxLI7BUtbyPxgXNOQ+C6xaZn0vGPPoTIOS2tXyR3U8UJGpR/uam+MphFpR
#GH+8mJiPiv/uOomtQn6JmizFFHvPegdOC3hI/jhCSMZiAewkYAotFwiP4pgLmHW7boCNIJiaE45V
#P7N/B915z5yH/C4sdaUjwX8z+y3M/oxySBn+gHZyMalcmTNYxYloHBUy09EqB5Z3Dd74qdUANuAX
#uJHcor9EVa7GIA+Q9L5gW1CJRci7Us4GjTBNfsjjmFuBCRgmNwXz/WkFIidEVpgeS7DNALTyYS/8
#HdpqPJBpXs3c8W2FSssrvEnUCCx/mXWu3CM6Ahr+IWTEyaVwCKIqCQeBBzx2F0Q8UMbkWAVgNajO
#4dgTpJ+pbc0m4FmNu+4T1486xMABdKwRHAxx3px7S4vdBYu55gCqxWBjb3A8njD6hqKSN7OvrfH9
#eMb23r5xXDSA8ZQLPPghfV/7UI2cUPwRDuQHcjYWwE92JrbEnQ6/hPdJ8bzwb9iAhhS3PA/dljk6
#J+TQl4fDd6Pzy9fHRwejH/q/GLbPzRuN//4//9cwIczGDNgUV+4nY2r6CGKh6w+2gXMLbenCDKZV
#xW5xJX3KkW3O0XgAgQcBG7gNxnOjhyucFP0ga13Gqlzq9C3Bn3143OFXqOEjGGmbEzQUfHVgUKw4
#PaU9ckjR5Ug9vWpYOFZB9lkhTV9yziLwugPXt4ItwQULZudTC3GR3R3Oks+Qtlkl1GQPjLWE2eU1
#MypJIDPjA4/apOc3/vD9T8b/con/UWvU2wr+1243C/l/Lonxf7lrB62+ZuKbKwbcoAii4HVTaSnh
#wSsYD8+Qku9/Lv7f61H97zawC4r7n0Nakf+7YSVRIH5SC3EqIbWkSHpl4ddajQrgzBPTm1QaazNr
#WwqzFqOtWbonpucV169g5H6X/m60aq3KLPAr5nzSUQ3OGYmSvmobszNPV+CN2owbK/mHzmAH/tz3
#5GtNSfB/UzbA6/B/u42C/5tHSt7/XPi/9UZNxf8L/m9eKYWQTVIgjXpE1SbJTapsNKoWlPgZS8cG
#ThejqGfWnTUbERZhyGuiLxzlHC48VMgJdKqm1DnJ39Hz7Ewtzw4g2soeQgEc1AlmYYpMq5G35Jwr
#agjKeE70YSr3rlwvOHKAMppZgXUCQtaF6QWXi5lrTqRoVlHGFeE/dVNYR0k8BTKfyL6I+jr6+L1M
#K4fkXpN4vnR1HiTOinYUMUqCyYyLH23ro8RXAsfCs9klwmP8cvG4P2dKhv/58H/qjYj/73YB//NJ
#jHODg8IkeuKMBwehV05mnvDcsypS1pR8/3Ph/9QaLdX+twP/FPc/h7Qyy2Z9/3BMErqO07jnXqav
#NiXc/9vn1P/qFPpfuaTk/c+F/m+1GlH6v4j/kk/atP4XOjVZ1b9Q0QQVMCppkKnecCgRBYH3+Dmh
#5OfMvbkBC1z0709A63vlHTE71Fqpzi30Fo1TCt0R+lXKxm6SJ54NfvHZ4E+owlH1o6a9OG0LKPQB
#v3kLyU91qPPBdDcUZQemo7FJNYax62DzR29EA+4machJanEKZ0dh5uB4tKyIz3TaQPzzoRSxvo4Y
#XYd6Y2E2+Uhcks/dO4ihS/yA464WCJkIuURUu4hksdhBpKl6SW98TLNpA4L9JgKPsuU7WLWf9i6O
#fuwDgwO2H/SCuH90oWTv8Mfe6UH/cHTYu+id9y7eUY/qMwvMp0A1yrFmlEfEfu1jA+LL496Aa5bB
#SIDHhK4hMLuCe1nji2fTNSjLbpqq/t24ak+wcTpvEiyyZmx7qBs1NhAaeNnH+ldgjott1smNxnqA
#EGFYxPp8fdnwmPq8X2YRxjrRqa5xQ2a08L60K5EiljPBRsiSKfTcxE1ja2lw1DzCCnyhtibpmISW
#Ipa892i8CCct0zxzGUwRHPjdmjA7XqajWKYjFYARcViwpUQE2ja+N2rG34339Q+IWH7/gfMFwRCZ
#cwV5x+Ew/TLPjfBfxYhDvIzaJv4Wznpf+OFzSELSQ0n8N54tGcIIftX0UEJxIIALlviJErQgI1CH
#KJjgCFEcrqh+/8FO3x+bM9A9JLOF5RCuOAUjNBA3PQuf4kqYn9j+Cxp+lAOMegKtPdP2ZD8A8H25
#uPEQHFfUH2knwmlW1YaFvqmmsOCtgEasEspE3BRIQa+iyriq+mlWjVMXTvuI6p3itt+Xp0Gw8Pd2
#dz9+/Kj4tNiF0rsR1VQZDjE1XFWxF0NSNPa3P/RHJ/2LHkBFiW+eotqaWbk1o97ql+mg8YlTMv6f
#D/+31YjEf2q3Cvw/l8T4v+wFDrWAIiqAWhiNsT9BA5C1w55ixZ8kAyUcQ41pllWXvUpKqM0qo4xD
#mUDLXGr0z3X5/5J2//PR/6t3ovHfOoX8J5f0B9D/y2pMTijC9JAz2pAtxkoKawLVkEWzrt5tVOud
#aq1a2228UtTsOAa4qsKiqhkoookZtBabNU11sC9Ir1rX1TQ/ZbFr/9PB1y89xcN/9lQ+k//PbsH/
#zyNl2P+n9v/Z6Eb4/51as/D/kksS4r+zGKtMi4xIeuP0yLDeGJfzfm/MLe/G2oKvO6g+VyKjfzxs
#x+m4RcQNcXaAJCo1zS1FpRGCsh/N0cofuBNLNt/NWSpGRqgxUqw+va0fbUhQ0ks0XJRrrznTSCuT
#eI5TdHyyEqGY+OqgYXFK7YhCJtAfVIxVhXqR5YLzKxF7D+9D9qS/MMfWw65wPj5kWi9u3qlXkSWG
#DbSsn3hqU04rMyJd0/o06/CexzyVdLSJE7vabFc5tpExfrmndgX4n+H9f/L4D+2I/W+31i7iP+SS
#ZPofn6dUClrDhvviFMbWjjKqQAmVqJXdxv3xtdTi7z9lu2xAB2wN+q9VK+i/XFL6/j9eBywF/je7
#rYj+f7fQ/80nxbrI4lzXDB6yJEUgLBUfexYoZISaO76gk+G5yyCqSmNQXRfiLD/RfVfYbDYHXjpf
#YXGlQpWlmJAQRsQrBi0pKC2Az37Qs8DqL9E+qLaJ4A+ZOQuSzNtEXZRQpQaVxs1qlE+wXpSse+Pr
#VU1EHR7MbI40Tw32IMmz0RYONUmS9EbIcsH2K4plojoGldU7ZmD83agbe0ZNtDDUbmXMzqVuVPoo
#YRhrjjQhyZPAHaWU1w6O2OLVPqSe7Pgzjn2rMd0va+QuIsaZoLd2eXE2Ojs9/gXIFrJcwhXkh8Af
#oYsPiwFVjo9Hw8vXp/2Ln84GPwxH8PvofDTonb7tD5Mv97XtWR9NcIVV/mhdRVfdXVjOCOXEr7mi
#dwStRO5z8tmgC0rnGgZpKdeq+H+7NeyADb0cN4jcpr77JEd9Jeqpj9440Cx0x0QfLxgviJrLwvUC
#rmTzqlbeMcqtVpO6dsu4RL4/jVkilJN5iaCVL3+JGo3V1sZc2PLaJCvnZVsqaHQzS6Xq8G12sTri
#UYp//9Pxv8frAKXR/61GJP4Dtv8o8L+nT9z+kwHzSaIDMM0LqraQoEEUdzeEVhRnPzFNhK+PbiS0
#jdSBqK3QsTz3luSa0u//43WAUu5/vdGMyP+69YL/l0t6mvgPmRVjGLJQ76h+rhQyZiU+nNBOiKNn
#Dn8g1Ga45tp1OXq2Wt01dZQIqLMnYgw31UcuwiKAuNzC1v3QAxPtCn0iRGhsOlvwNwT2wn/sGLXt
#7Q8kMlvEkW7v8OTodHRwdDgYGnN0o4wry4BfPvajG0wtg7MBMBZjTYzARfQKkK2Qe7u8sjxUBOFF
#CL+qllPRliJtKEXhPzZs25TrL5xW5/822s1Owf/NI8Xu//VytoHQzzitvv/NNvB/i/1/+pS8/yAM
#s5zJE9t/1Fpq/Od2q4j/l08K0FtugtkWcU5O9tso34wB8Sje4K8+Jd//fOL/RP1/tbqdenH/80iE
#2leMLChrFSH21eou+j+FJVBWmKRx4jVF2ICJDbHG3WLMDK8FUYoY9lumAQ0WxwVMzoV24CdrKLRC
#5/IwapTOTbwRpcVmzXwxJE+beW4oi04ahO5DRw2CACY+OgfPEsJz3FrWYoQdR7NxC1/EEUsamXED
#BuhdipePMSVe2Y2n0An3/ZDYya2lHgQu3xSMCZUlS1wzdaBS7CQpXJLEft83yJiYy4hqyMwsMe8R
#RkzRMAQRNdqOt88WDWzE7NA0m9nQGEoDxPyc2clEcrHpuUh+a4QDwu6woJnJ28PCt5a5/EMWgPDQ
#m4nij1jJeYKwPHk7eL+8kTCQeRhsPJo74lnADrFFxxq42NUIPpaodTyxnw/zwj0SQmmG2XJ0dxYw
#U2qBfRR3gqlIJu8EL8UWF2vZSaO/feWPeE5J9eEhLCmzapWNVsMrLS8Ku9p81lS7l+cr+r2K7lu8
#3qwc7J6OjYKmwv/jHykl43/52P93mqr8r93uFPpfuaR0+38F8khve2bD/5hGWGGxIRknUxoQnGeR
#P8SakqaxUpGZKmAoK1WKagezqlEQKdTj7xINg6R6z6VPLe2elWaPrfIZlHh4O+gdzo/yTr7/zInV
#0/p/bddU/k+niP+eU5L5Pyz84SiMuF7+ft+oV0FQR0kKWoIfDUqTEdk6J9E4OgRNTE1/ao9db7FL
#SrGAjEIv//t741W1oQRT5D7UqJKPHB0xjpJQHUUxx3Az88qaCUSk1AxFccEK0gTvYDAmuAJkRMQl
#FBgHYbEe3JWvREaVfP9z8f/RaHej979evP+5pD+A/w/GJkofHOMDZVQ96LSI7kEkxpbIMsra1ivi
#3qO2fhQtgeOTwZVGQ/Hf8Qczs9qEF5YozprkRUbjZyWhZNSRCt+FNLcpSQUlLyn6gpwdkryV4dsp
#7BpEhlOOaeq+RRks8oZEtW18y0FH2r4TnB6y5g1dB4Q1k7ruIZsmfY0klk2W4ox9I5W9Ih6/xDso
#MmL+DLaCse//zL6ZBptRAIBHfUX5f6fVLuT/eaSU/d+IAkAa/aeR/7c7jQL/yyMV8v8/d0q5/xtR
#AEi5//VuK+L/sV7Ef88nbUL+n1lKKGgARFUAuF2fIThv5pZs4kdRVJooKS3E+1rxPlCBqdL9sUa6
#r+y0JNdPkewny/YV6T4XynP6I15or/hVZ179w4+KSJiXCUXCeBvUoeCPMBYacFvKZB9pfhhnW8gP
#PyrnQ5yRIM8QjosizY0RYkSkunqJRfL9T4H/GxEApuF/zZaK/7e7jQL+55K4zRyGCSN7oZee4Vwa
#JhYV+uPI6557fb/0lHL/NyIATLv/7ZqK/3Ua9YL+yyUV8r94+R++Al+5ADDl/m9EAJhG/7VbEfv/
#euH/L5/0Ncn/ClnbU0Y8CCmqdElORjEO3oD0uA6U2MpUMKS6sghuFWHt04jCnvuKF6lIRSpSkYpU
#pCIVqUhFKlKRilSkIhWpSEUqUpGKVKQiFalIRfqTpP8fH7pUqQAoBQA=
