#!/usr/bin/env bash
# shellcheck disable=SC1090,SC1091,SC2016,SC2317,SC2119,SC2120
set -Eeuo pipefail
shopt -s inherit_errexit

INFRAX_NAME="infrax"
INFRAX_VERSION="0.2.7"
INFRAX_TEMPLATE_SHA="c900a5617eb7be8d6a46fd04bc2ac759789a06131361c33e85748cd972e8e7fd"
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
INFRAX_VERSION=0.2.7
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
#5LaEAYP3hK+Cokyj/7COziM1wZLpv3odgr0o/J96vbD/zyU9kv6jbHRm1W/fAMrO0QeBCCSUikrX
#ZeU48QsJx3ETPCYNqgwXoOpP8YnfMxaeVcFmfbPZDvy9XKCpTaxIycpHy76Zggp1pVmO5k7A7M6q
#LChSdmVdu6gxMgsgZGxqlWJ6N+54UoV/0GL9E+hKMo5zzxreO+OkQmonr3En71DOQUoXPmq58tG8
#s+jwn5zzpvxJ5Qm6U6K6p7kCki5kAfyHe5VyUnhrwAVAzw9Y5W+GCbD5k9NY7+Ts4F/+cjy2rAm1
#c/wCDhKaDaMYwXzNvb6mnAmw0zXHgX1nHSI0boYQI451EXO8IJjRL71rRPi9sR3bn1pYWEzycyG1
#y/zolJOobZEqpq4jGO11CsZcGyeFNRoctHedvoqQFWqthPomQraglqLm67RSSNLqplBcKoHo5Uur
#pXcJkaqnOo33/nTH2CUKydjbImkIXZgPQvEITcl6fnc2vFDQVkGwjF15RSSncgtUHB3Tgiqa1rXQ
#//mifzo8OjsdxreDdtZyYGIi969cTmv63dlJX9/objBfaKsMzs4uRpfD/kBXL0oBQyIU6Q/WvZaC
#FcBwCHA1VCxLODy9fhTSGM97w+FPZ4PD5x+ndiRsrFTd4qmWlL9sVwgSxY0SpkSe4/g1ZeM87F30
#XhPtjOceq3Yo6nif8BisOl7NUJ6YASDEIzfGi+We0a7Nd9ATOHfB/LfTOrENGTDgmOa4OCvUaHeU
#UhnofQJu4+n9XblEPFUeaYjz0+SetVeTVlbQR0mxVKU9NoFD0ja/SJyx/lXhjPU4nLEejzN+9yXh
#jPSofFkY45cp+AhvFUtrSTweI47YlOSBbztna0ckDU8vaJB5ImJLm5A25Pik1WvimxZ9rnSPWrfz
#Cpf6Kpixz5BS+b8L89F2wCn6P/V6S/X/3W63Cv5vLknxqMPVdaofrauIFg417bWdm927BnP97Xr2
#7wATZufupMeNf1fXHEQdPoqly15X3P8FDrnDIZ9Olwi+R/SJJNCYPtq57QxE9R3uvypcKYSYUrfj
#c/OTVBhcZ8VV0H5H5UlDxOUG85HL1dQxkA3xC/wzBLk0qMJiyb+QuERRrs5lYM/s30PkjSSEqYEs
#TMiMnTLqROH2PvcxL1JMSoP/9Kw96g1I0//u1iPyv1aziP+TSxLM7hTf3FUwMMv2MDw2ak2KfexG
#XoV1oxGkjk1fWdAKJU9FTPgaQTmHG/RpN4L3FQ0r9BgYm3b/0YQQaf84FDDl/jfaLVX/u9PoFv5f
#ckkrSfux/hQ2353ZPjdGX10HHJR8Qu1vufF9uExwounvaMGoLHlDcUxkPdbHw5zHBEGRx7JuIJTI
#CFhKCEKSbURcW0t8OUiYKKaqRTeQFn+OKC0UeMUFa1F0JsWzLI5cBNeysWMW20plieiQEKI8g0Dy
#aWuUvIH9TwvY/ahfUKiKZRb6zYxwg9wFwu2hD+PIiWQSm3A898D9D9914iaT78JK3H86EvpiRvY6
#18OnGfNzQ/n4lPb+LyZXT83/qXVq9Qj/p1kv3v88kgZEyaj+1k1gbIFJVgyrYtuob6tvMHmupMih
#h7bvLbEnudfYKdzz8YfQmHuhMVM9C22wtlQI1OW3jWrEaujLAQ1p9/9xkR9JSsP/m03V/1un3ij8
#/+aSFP6vjMGtqg38YkrcbIjIP2lR8cOhAoxHhpjcOOKeHqKSTCtjoEqpsAYRjaAzpIIQozIsu2bg
#SlEwKnXCy0WVFoQ4a6vTeXz1qU+niPXrtkjaUaMWGFGIs20skGZoWCt2EHM6Ii5j+KnWSrrTgnPG
#GyOzFJonSaTuGlhwhEm34XXcfYZ10y1U3Bp9Oc/qHyalvf9sd5+Q/19vdFT5b6dV+H/JJ+Xu/yHC
#+9PaA1GRQQyVoDdKFYAG+pPajsZDYCjDYOnz+IWQ6Y4n8AzQYtxDL1AwGVHsEP/8MBHxeVIRNPNz
#zw3csTsTd0dShJLdCcrrNG2Mw+2CcYUbo1hZFuB98ykj/DeJDuJ6z0Aa/6fVUvw/N+BjAf/zSEnQ
#lyqe5iuw1aC1ss+RqqBLHaNcHaMFKrTPBEcZVG2fe4eeNqXef2p//6T6H42I/LfVqhX3P4+k8H80
#7ha0EOJc51JhdZ5u6F/hSUy5mRIct064tSyC9sTZI7gL0oxx7i0dax9DgJ1DbOJAfnDkDb2ICOk6
#cSdYJDtApO5Pnh1YZ87YAsEsndkBRJ4+VZlHbJVxXGrKa5F1pLluNOP6kBraVnBU4XXRI/3931Tk
#N5LS6L9OxP9nq9D/yCmRa1oul3hoBPQ3cci/h48liw+AM4AguNkz8NMAyrILweHU0fWpG5yjcwx6
#tFGX/sb7D6XSElsid9rtZqNE6I5XtVe1EqYPKFFCvJjvGbvkj1IJbDWMzw+l0n8zgimEIEJgiTAs
#wWbmnsUg+itESKXmslPLs4yP7nI2MQjVZDuBi8N4k5gQwdQMDAeqoyroEkLUdDsocVqV9CcIuqjc
#iJiwz81PxMseNlrotksl6soO03TE2R2IlZai07xaqcTucIkZ7kwER/sACdDCuqi/CjDnoCl0r8Eo
#4q1doiZ3aFUAvEKHy0DfUCQMH/8khM0L8yRuMt7gkG8MO6b6uKYASfBiDfEhxkHlwjMdH7a0wuxC
#9mChKmjC+816G4yxan9lUH24vDp056btMGuTnyvYqN1B7dwvrMoZg8KO6zv29TUv9cZDIwuzD/un
#v9C8gXVteZ7lVdhxdNyKR79RiIq9WRvvf0ZFPqIDMqm8vkdHkmgOYK5/ljiEXPtaKIjXjSpBkHNO
#zYKg1dB+HX3nVuu0WKjITZT/4O7J2O6e8r7Bydzk/Zfhf+C6sw0H//vLOvGf0APQKOI/5ZE0+7/Z
#4H9/Scf/G21V/6PZbBX831ySNv4fHINo8D9zApYpkMfj/4Gwduaakx38C0DlhAT7wzI/eK5dZ3Zv
#TFzX81ER0DNDMD8hyF89GuSvXgT5e8Kkuf+bDf73l3Xgf7PVqBXwP4+UuP+bCP73lwz830Zb2f92
#t1Xo/+SSxKA5sPsbD/6HG1018p8wkk2E/SOeRJK7+JOGpEm8/5sI/vCX9PgPnU40/me3wP9ySXpp
#f/T+PTYWQxKLVwIRsUp5YZyEeiku9kGzlBo24DGGgMJkVnMrk9Wmhi2NJP4iMnixSAjZFhZz7Zdg
#PJEWFwB8+8n26/hL5pgAObg4jCyK1pNhJh+IkVqC/0Mx7zouQ+P/e+N+EvUKcIKnRNGrv1wo6pYX
#nLWGslRgx/aZ+1aWtA5xMrqADZM4euIpTcrOEqwudom1g/Ksa3FIMZPLOrBNOZFL8SSIXaSjgWeZ
#s/bjY339i/6J5JaT3OtLwUeFwahWy3IYUnnUKd0DZLMD25wdWjPzXu+SP9lhfyT45pcw/u8Sx98U
#c2MBIKT0eL1hikbuDZMYw1fOiYBZ1IwfXQpzMpHMAaMltOc2PbYBV03PHt1AgHPk1WK/PqJ1lGMR
#QYp3eahIwkljMXAEZypTloMgSM2cm7oDBZftzJndK89V7PJJ8A8W5ROCgNg3gAAC9bMOR87ysTIk
#biQ6MCWcw0Iz+mzAavUtiviPTNuVuB1J8y7JgbVcUTOvNRc964IjPDK4P7Q9LNlJXMknUX1MpP82
#Yfz1l1T6r9mtRfg/rVYh/88lrWf/lUQf5mPLlY1mLAy5VEOuJ7AGepQlj4JLqS572WHCsngsoCcH
#yZwtpmaorkqQpsc69sh2pgLmWo6v6A2hE2MPPp24evZjXqQSrKhvj3tLtilA6/Kl5eVBRcwGzZWy
#6RjWp4Xro7+xdM6xrInPJXKUgCkrxwUR7dMYfVtSYGxPmE8HKAtu/gi2iQdCOcG9MUFADy3nHn8X
#jhosjUnze4C68gOw8NCa2wtzJh668cxGa31wdDhIwA81+KASlSlfXzAZwdCzO4J5el8rGZ2sVOLv
#Pt5IGvFtc7sY+2Y9964mDCx1l0F7aDMoYSL+twnjv79k8P9aU/3/tbvNAv/LJa2O32Wz0dsc8JQZ
#9lnBZCaLNz0nR7F504EpHUWqPj4rxzZjlOia66UJ3gUtInL1yp3ci+SqQERD//DTgPhd/+JdkipJ
#ljOFLd7XkTTwf7PK/3/JoP/RVe1/mp16Yf+XS+L6/1S2hP4SFPOJvj76BnxgjHVw9fwS9R6NdZaZ
#jj4XwBANeiZYfChxNiiqSUMVlBhnjOhCh8xhXDVHDXegbpgSN9A8XFU7XRv8uXfv8Um+/+Tqb1oD
#HC71ivrfXQQuCv2/HJJ2/xne/zi1P57S8P9uxP9Hq17Yf+aTCPx/8XnY7x+OTnsn/YfQEox+HVye
#XhxBht4sjJY6Oum97WPNGLAQK9OvF723DwBYVzEUo1XPL4+PR8P+waB/MXxgpmM0D2LbPdCHihU/
#G1w8MEsy9m1w9hqNib1ZbFDv+r3ji3cP9N2iH/unPz6UBBOwsImD/nDYH8YYhLE16p8fHx30hqOT
#o1NYBGwjFsnr/Qx52GyM5h2cX6I1GrztXzzozMhoqeHlgKytZFLG1uK092Pv6Lj3+hi2SGdkRgv+
#eHZ8eYKbodZm0vfRwXFvOIRcYncmZw6P/ieuSc3Q2EqenKGzAQsZfa7Z5M8uL3DNTM82rfS2d9H/
#qfcLPo/D894BbkB6yNnC9A8ujs5OZTY5y4SIn7Bt8RZe4R7/rHSmMfJiU+5fDI4OhkJxyfqL7Wvv
#+Lg/gN51pmCsqaO3gx6sjmgXFo7px6MhnpvGTEwey0O61Rit0Ds4wDsWIi4c/t++2vi7z9Lq73+t
#0WgX738eSdp/MOWp/tPfdB8p738D4XsR+79uQf/lkuw55msBdwwLDYyXt51d+PXyryWa95loihoP
#vADKKyEqzg8w1DX2jRE8n9Xjsx6Bun+luQD4UO7pcn5leVtCIQB726wUwDTw+y8WOO9dvBsa//qX
#8XL35XbVX8zsYOvlDvoTEZIBauu1684s00FtlED0hUZJ2qL+G1BrnzEzy3awRpU1vLUXF8fDHy3P
#vqYKNztEjmWjF92bDKiV82t3AgpTQgF/jJ40z3aBLuVSjMAzr6/tsfgJkvUJdYbdqL/0zPkC4QkV
#0/NshFVXYCle7kilcQDIAbwNxglagurYsmdbeMl2jXptWy4MGNmlAzrOL+u+0tDCs0C+Ngbzux8v
#0UCjC/7j5VBpEGEoCWWNb41WZLQ3mGRW5EMGOh+TpUcV0aQ9PjnfYTGmyFF42Mla+fASHRH0+iU3
#8CH8SXPoP8EUoZdTdzaRdg2O9cizfhtdIxwKcJT3L6HVv9WqtfpLoS1eLhza+5eLre/a23+rI/jE
#iqK+HsLzx0xjrpcOxlOMrW3UNS4YHnN0LvFpf483/Hrmut4W/tNDeIE734J1xwWqM8u5CabbH/4q
#tIDmhBqA0VXRkmz948VnuH4PLz5DlYd/wGXAheG2bqHCO2h1X5qOj63dX+4ZW962sf+94VXRXgZL
#3/ib0a7VjAeoV3Bx/6Qp+v5v0PCbprT3v9lV/b80akX8r3zSyvGx4YyUJP2oF59/eCXSQzGRnGuE
#AlrMLE6TkKf+7BCTnQvTAyJqZvvzSF5YDxwuQZSSCXprYRyyHU7GCMsANnsz2/RlNSh7gUkr3DMh
#ykdH5w9l4ckRWcdKScB7HspMoTrJtuO2I7RI2e60Lc5EYQk9ftCXt3R2eKh1hqbvGJWKv0QkpXdf
#CTzLmVQArqPPZfPuZge/V/Df77Z30FtfhtKOW1n6qL8K8G+8QNT+jhiAsNFypE55uqkSWBmeI39v
#d1e3GvENYvwupkW291AkqQ1AIpObgBKj8/4AzlFSSwzbSG6NlUoe08l52phOzpNaQNhXcgOogFQ/
#Lbqy0hrmPrG2Ds4vlbEYPLJyu944saU8Gn05pnz9rVg6Xs+ezZacZrWxUPWcHfeS2KDmOkXaSVT9
#hrtToVWeG/Z+CUl6/wFkut4GNL7llPL+t7qtyPvfqRX2v7mkld//F58H/eHF2aBPpQXJqICszRKn
#vBO2eXJ2eHncf6gA6rBcxFQSPGvTE5uAcoAG6p11aJmTGXqPQ6urTg1yg2BGP/WuA8t7Yzu2PwXS
#8FWnRQpsxM43cYKZJwkFM2I4Mjv4NMsg1rbNzWZ6G/ZOhDdSEWppG1fmOrkAGN0dJCBc1xY61zqc
#izX2pn9x8C6KfAn8ernkwdnJSe/0UDWgjZTDMiWpTNTEtEL1s7XWpWT8ZJsqqBQoY9loTyIFCd8L
#gsIqtmTPaFCYjgKA7m4CAiBkJ+HT4vUgKbLB8Vv73p8KmDV7AP1pJtw4AS2OXDY9ygdSy9QWsGhT
#X394djk4iMeCWQukWEwbBGVPbYOKKWPGcZGE+PJhXMQjv2+OjmPmgc/BrnC3jo6lvRT34ySujWC+
#0FYZnJ1dYGCiq/cYg/AotE0xC9ePRBrneW84/OlscPhljFUzmq8E2sj1ZDpEVzUjpaL0EK46WsUf
#opaj0X4TKRvNJtIGkvA/Gf9fOk/A/kvl/3Vbqv1nvdso8P9c0jr4/+XpZnF/1B4Cez8eHfQzxNJB
#ZzQB24/F50k3FxfHm3Peoxl5ptFDoceh8dFuN+eCR6ePBR3K6lhseI8lCVDDieRAJP86PjMRR1yK
#ca1D/BA1kYj2o/wYZF/7VBydvhn0fmabE48PCRuox4ZoQ1T7TN+QPKesOCVspYpPxhAm/LlJoE3k
#yVSobrfcTiqBozQSRT6eEa9IY6+CegRR6MOH5fzyYYezRMm3k/7J2eCXB0PGWSkzFVXXlR4dH50c
#Xch1JAyHlQZ1Ln4fGeZBM4nu3jBRtsvff+Ij8UlUwOBRX1H/u1Yr9L9ySer+z+/93zbtAn71/W/U
#24X/91ySfv8Bh8nN/qve7kTtvxqF/D+XJHn2FKIhKS42eoKzdh1NEJoPVKi2cknjdTIu6tJHEyJz
#lOvl0LYeZVtjQbt/cPYf/YMLrAeOn2PSIMixLwfHxLoXpNCoHup/ai39CqBxSwchDdUbO5gur3Cs
#SWs2r4whvgHBLvCfe4ZQC5//CtHpomg4c/gRamif/DL8z+NR/2dApPqD0Y/9wZBqoZPYUwxVIOY0
#Z1d4KvwlX7iTqKsF1aWnZJHBCuHBibVAHyGmLDNzlswjwkzJnIKzniQk95PtB7Zzc276/kfXmxB6
#QM95ELZfxzlK4BlRCufEdWzFKwW3JFA42hLJGaOSXwIHJTB6wWMJ9ARzZkdFoNGo7l7VvxuX9F3I
#lgjozFJqjRxrIL5A+ZINfwHBw6SB+9bs+p3F+fPPfevDpIf/V+jSV2emh+7lDHzvPK6PFPhfazRU
#/e92o1HYf+WSDl8jAvf0lNjR7OPdL6FvINnYf/H59dEpUf55gI8AQ9hHAk/Qx8PeRe91b9hnGew3
#zgSYAleHZRIYA01ROMCbo78LPdScU8L9X3obuPuQ0u5/LWr/2Sri/+aTCCqDcCh+RQfH6IbSSyxm
#nA+OTnqDX0iB5x52kTaU9PcfNCo2xwRYnf5v1usF/yeXlLD/N57pIJz4t0dzAdLgf70Zif/aLfy/
#5pPeDnqnF0bv+NhA8P3Ho+P+2/7QODs1vq1+a1ycGS8jFOLL//Hym5fGT0cX7wxS9+wcUMe/lt4c
#Xw7fCa38tXgk/gBJf//Jj81gf+n3v91S/f+16u0i/lcu6QeE2u0DN+/K9K1S//Tt0WmfkoEnZ4f9
#4f54hlbI8gwacKt00jvtve0f7mM+BpadkuJ7r6qtar1Om2A8sX36FZOOzWatUwIgsv/dd9+VOEjZ
#J7yvEviY2G9AuOOD88v9Rrs2LxFh2H638+rELomSsf0GKjYcHsMYRwcI8lygdvgHNsbS4eXJ+T7M
#hfHq9uNZfYDqkpmAMUtIru4pJCpCgI8e/odIG++JNPFuhA5+7i1OTPr7z/QhN9PHGvhfp1Uv8L88
#UvL+E83jqj99VB9p8L9bV+U/7VarkP/kkv7bvwGzZ9eflnwrMCrWkhu0E87A+U+H+6A2IjLvsb+Z
#wJwvUM7WBOzyK0vj37/55Zv5N5PKN+++OflmuI2KXLuewV4Ww3aMF58ZTBzuVR7+akxcYq8+v53Y
#nlFZgHrK2SWGoKwa1VLBh3KynC+MyhRKEetCo3IOP4g2CwyBjROD7TJYR9rOzcyqBBCbnngiRx/B
#VRHEOEJ/Bp59c2N58CeafeUmsCeVBXhemuyfvXlj/BqqEVU8y1/OAuyjdV8zTvQ3XpEHoJfKMBJl
#CtZ46hpl8r4YQq7xX//3/zPEysbWi62PY6MyNv6mWxC5o23j6j6wfFjtieusI1dIvv/cL9GjQEDK
#/a83ayr/r9Mo5L/5pHXvP7o6lr9fK5XAWdyM3FASIBzcnqx8T2eWE4QQgTT+YmsL/2H8u1Hf3sYZ
#76Eu/gj1ZoHxXc34AG5iPosXzDADg3a+R/s1HNCqNMzx2FpAkHITlNsc4lGs/FeQdQZG/a9U3cqf
#WdbCaNA7VSJtrjKjv/0NLV3pYNDvXfQNBvSMozfG6dmF0f/5aHgxNH79B5DWWOMtxBV//cdfWTVo
#SqnyMqwhkOJHh/3Ti6M3R/1D4/UvYhm+XS//WuodI+SXtPmIVuKYBTFzEVgIan86dgGsWUmBk1JN
#w/3o+IamqyI6/NopGf6H9lCP6SMN/teaEflvp6D/80nrwn8MiZlJmPFv+9gnIbUyk0GyZ10vAREz
#ApeZ6hkuAOOXvMZL47/+z//DWjguRtJsHwHoiTWzryzs9gnhbhKQfm9UfOgQW4Ip3RGSBTeOrc1e
#Gu611JXjBsa1u3QmUpNrQPmKZZTTYTxdo1//UV6jC3GN/xbOOAomyeQMNmm20BOEd6Nl563gdb7D
#TtAMO9gxgqnl0HW3hAWf3RcQ9U+S9PCfhgDIx/9zo6bh/3brBfzPI2n8P8+xiyXu4fcQfeIGM6Kr
#Z41+ocZJszmZkJBFzGlt7/Bw0B8OmftlhHFTHQRUPCwlQMGSEFaAl5YepKhyIX28YvJxrBRqu3ln
#ersI7pGDX6IOpEvElyPR5wttxUMqZweTOTsImO8Y9Ua3WkP/q+9wUkaKZ1DSWosw98+SuQhVZwzt
#RXRWIkKh0ExEdPy8gntn4te5RGKvCe6Lj4/62K4k6gc5XueyRLFG5jp7eDA4OscemEGczL4enR6B
#r2vyTOs8Rr/uHfxweY5HOp5aAJTCU0HyUMvv+tyonjmIlIswp9oGZ0GFs+NsKOx2DMc3jHRxPui/
#OfoZd2BSn8pKD9yXMui3WotD895Xi/zQ75+j3n7BHS0X4HvIojqu8o26PAd3TP2BaIymeovmZSSD
#NOp3Qi5B/U4IRyLtUCjHgq0zPh3PDaKK9IRJff8XNxi+tTZpAoR5/KvZ/7TrtUL+k0eK3f8NqgCk
#4H+1RluV/7Ta9UaB/+WRsPwfwn7J4v4SeT/3F64fQMhJhBoRWf9kgV4Ufkr2vqvWu0S43661a0S4
#j/866J0P90tYjZxI+o/P3h6dEq0BEn9jf3du++NdwKOwwF+Q96MDocr7iQrAc6/W15di7/8GScA0
#/l+3o/r/aLVbBf2XS9LQf48g9kiYOB4D5XwYBt+RY++UFKydx8ChJOH5297hydEpuvzDiz7xWBCi
#6Nx/ASt12H/Tuzy+GPVPekfHYTn8UyoIkgOEH//H8OwUu5Hi0eh2iXWYX/2n7zpiy0dDCKyDuhxe
#IHoAtQ0QTCVJ1XGEdGdIcpJYeCVmh0Z64jE3y0PytYxIvXId/xdorrIYSYnwAXeMMvaAIWQx40jI
#e4cAtr4WBDQtKwtOlhJlnpi2EyBKzBlbh6+hPgP8UBO8dTi60VACHRUBzSt3gksAQWV55YeH1Kh/
#nPamQGcHu+l6Btr5C45exMITMubJJVweHqiQLcXRIY41lDW+kXD/I/B/upjf4914Xv1/kP8U+P/T
#p4T93xgFkIr/d9T9b9fbhf1nLikF/ydcUYL6h0djr11tVJsE78dxYjHeT3D+g3dnP50aw/7F5dEh
#/PMW/XPYOxidoYd3cHTYN96g/P6AkgaMFFApgHojovFL/JE/93p9bSnh/m+MAkjD/5s11f6nXch/
#ckpfKv5/0sMYUBSTpZkyRSBis1Cih/Ccd/1YsgHV770enh0j5A60+cMiYNsKJQgnnQCePaPTOilt
#JrR1gc4+MTpbpBVTBP5zht+z4v+Ngv+fT0rY/405AUt7/7vNCP+v0yn4/7mkwv+X7P+Lnf80F2DA
#EHw76A+fwQsYQTLEarAb4rKwlOgejDkIi6BHYUp3EhaqV6BVpEsn95HgPSyz/7AUr/PoTPgzSWuJ
#GoKGIy3cjMWkBPi/MSdgqfyftkr/dRqdwv9PLkn2/7W4eXb/XyiT3l6Wxy/zc6/V15jS7v8mnICl
#3f9aJP5ru9Uq+L+5JIbHFE7A/pwp4f7nJv/ptCL2/416Ef8ll6T1/8Ix+cwuYFiNvfqraqeCSEfb
#sVRXMJBFdcVazQaRGXVrq/iBISKgVD8wE9sHnD7iDgZYr7aHxvXzRf8UhjSkHmLAtYDWRUyUGgRY
#GN6RDbuK+TulY3LEfBLu/8acwOAnfiX+X6vT7Rb8vzxShv1/tBOYdPiv2v922rVC/pdLirf/PX/L
#ibRndwCzuBlp3L8sRNvZy4h57kR2w2JUKo5bcT866CXDfy5YyCDfqLwZG5XrZH8rMADRl4vwCsQ7
#dMGjzurRBffweJcuK6UM9//RTmBS7n+j1VDxv26jU/j/zCWtff8VBzDohtq+Z5mT+9Uu6W+b8PoS
#HtoNu35ZRA32U4EOG4xRuTPOTkf9weBsMBpenJ3v19F0qVMplOe5xJWU5OKkDDmMZy7mhksPJRjw
#EEuE3lCMv/3tJSLoX5aG/eP+wYWB4PDcDLZeUmcFg7PjvvHNkYEtMriGsvHN8csdY+8lDAv/wUbx
#ctv46V1/0BcdG2zRluvGm8HZCWw+VPNpQfQ3sLaNfdbctvHrDdjTqgMiXmlWH4++NeKdBjV0cYb+
#K1YeLz3PcoIRyDPE2aBxT00fj31LLCNUfYmojdf9QWynqgMI1D3Wb2MjYDsVDifTcvJnk5RFP/mK
#8hbjhjTo/3j2Qx+76Tk7lUaGWz+/fH18dCAPLmwKfPDAu219CizHx8444OEOSSbp5V7nfuiPrP6y
#oDeTudjgI1B9bKD2+GAffi2zd7Oke6ULd0JqyvD+P9oJUMr7X281VPl/p1vEf8knrf3+f3UOgJ7g
#rVde6tCVT+L7LEBsFUpv/OUAcA+vN92WSmU8s0zwkmlfV3AAMD/OjSasXMV1KpbnuV4SbUURnpUf
#Cb5aEbdHCkwvfB89IiXA/7z0vxuNdiPC/28W/J9c0pfg/4frUsW7ABIKHb6WVI3O3wK8FBz5CCcY
#AN7u4gb+EVsAFzSHr0cILAxRb5XKzB2bCL5hPsfE8vbt8RIg4HhJc/bRWwEQzxm7EwQK9y8v3ryK
#mICyxlfxOaQMNcX7UEhi7yCguaNbJ8UhUeGGqHBDVLghKlJCUt9/hDfZm4r7wBI86qvG/64X9r+5
#JP3+5xv/u9NU/T8224X+fz6p0P+X9f/x+U9T/h/0D4+eQ/MfD67HEGr8C2ughEX3JHSc1cM2dxl0
#3v0/Vohv2sinwDN73o20nAhlG99W0KAI4aFs2A/9X4YYp/qja+8/Punhf77xv5uR979dbxfy31wS
#uRmE0AIPD3j/S+Rr1AiAfI/aAdDvsUr9NB8TM6EqMSZtSgfYVHt4cTbo75Pe//Oyf9kXzRLIZ0Qp
#AZgdHQ6OEMSlH597/f7oKeH+5xj/O+L/sdkq7H9ySeRmqqr/5Ct6JmPu7HOPukibSvr7n2/812ZD
#jf/VqteL+59Lwvr/YxPhy4oDKKLXT2iMV9V6rVpnav34+e80u9+FsVyxyn6bauzXa4meXOuomE7X
#XqG8ACQxCmdVvfpaAaCyJv39zzX+R70R1f+vN4r7n0t6VvlfKNvypztGZbxjvATBF+FsVAgtblQq
#5mJhORPXmd0b9zhuJzXkAY1A1KxMfJRffiCCReymSZLRyQWTBHSKNC4YL4bu+JaxRjQTL+RsK8vZ
#rs2ZnxOTo0ixSYX/9FxtVAIEQH1F+U+rXcT/ziXF7b/EAXQxB3ttciAN/2/UI/F/u4X/x3wSaNYN
#fxle9E/A1/kP+36z1PtpOHp9efBDnzP5yK8HnMN8nA/6b4E1R0uQX6RE//Tw/OzolNdmv0kuwgrQ
#m3vxbjS8+OW4HxYunoNnSZnu/507W87XZwek3f9a1P6r1iz0v3NJ6v3HGm/FNfzTpMT7DxKAR779
#kNLufz3C/+8U/t9zSiB3Q9R8RALAvusRAZarRwJYbjwi8NyzLhJLqff/kW8/pNT3v6nq/3cahf+H
#fBK7q4CSh3J78Mr93CMrUh4p7v5vUgKY+v7XIv6fW4X8P5+E5X9006kEkGB8BgH8JQExAHsH0DHk
#Tq8YOvDckyjS2onffw/8eMw3y/ilCS71avzfeqNW6P/nkiL7f+Nu/Aissf+dIv5DPkm3/4cg6/Qg
#rs1m+kh5/9HzH4n/0e52ivc/j9QbvDVeXx4dU6n+/o07M52bvXq10a3WK4Fnf7KtEi4EnoBpmbEH
#hgoT2w+w2x8fYY1mYI8rE+vKNp16c89xHc91g1IJeyVA2ELYw4PRGxpXS3s2KeF2T3pHp/vVUumn
#s8EPh0cDY9f3xqXSwdn5L8aNW0VoKPzjL+ffGtXdUmlweWpUKnMwhNwP7hcWUV3aISYa+3B4F7c3
#u6SWAf9M3I8OGDzSJqtGdZVGEkrB/Har+BuqUcEzor4ODt6ejfqnEDf2cL8GAyGZsJrzhRlMjcps
#cj0zb/z9csU3Kh/LRsU1dt1lQKPQgqoELAuoSLAF5Kv/QGdSqVx77nyfNC1WBuMt+nep1D/90QjD
#9GG9q2HfID9AP8PotNvNxh7+L5S+GPyCWTTG+7LQTvlDgeJ9pUkH/xeeC8B/U+qfqfRfOwr/u4X9
#Xz4pBA4sFCcJ2Fc6H5y97u+DHRRR8yQgAsi+/aUH0UIvTy/2iaLUydHbQe+iv1+CSgf94RARkR+t
#q9JP/dfMSnyf/KBBPuFvqiDaaZ3Ywm/m1RmrjcKTAIbmrBb5KVUUP0l1S+TJAR8P+8LrIzxj+OUp
#pb59a7179FFDy/EjsMF/3P9i4Wfk/lOZ7yaJgNXx/0anWej/5JJi93+DREAK/G81IvE/Wp1mAf9z
#SSr+P1k6NzPT3732TOfWchbTBYKH9Ua1W0F/vqq2RZIAwXZAJ6m7kP2xO1+4oADcAHOBJi5y/u58
#1P/5gscAQFnQHMdr5SYwbcCaiSceIFKBrnX08fAQfJhNEe6+DyCH2/FSE3DU9u4cVBwCe3eCDzhM
#q8L9R1ZsBx2H2czydj1rZoG7ll1GQey++Kz097BLi8uN+Mbu0vd2sSYFdq5HKI6YsoRkWIydYGYs
#Ju4Ih2Ay6H/RbxyBm2hEG+4C0xu0zs0E3Nddg5uzmfG7vTCuxnNEXZDezEVQQXSKsVxg/9ykxn//
#78L3G8+cWEblnjhsY6PzLFDKtpyJH61DyyTVmdlXY3PRqKBph/V9K0AfjYqnLkx4yKKdLZaIzoKu
#tE2yUmBV7Vlz9w4X5dneHPV2HTpaQsXRv37g735LjxV2kYcO0x1olnsyTcVOIBkuDDT+i0C4InqJ
#tsMyq//0XSf8hSZ+y6lY3iRfVVjSiXWH/gBnQOhoAqLB3Om54CfKZ+seWB53xIc+UE1s8gOWhLj4
#UWle3iU4GuflUC13gUC//bsljgFrlc9NXG7qQjzjwL6zlNXDU9YsAF1Isrg4g+bCMBYemsC18fIb
#/1fnJd2zl2D341sjOAr7Ro1/JmrwI6wXjzIgAAjPI56MRnPz0wjHYIYJ7BuNdlgC/GvhfJrXFGp7
#CM0FYnyErxQr8Sq2QIAu2b7RqYVjo7exSsc4RrcZrSveFRhGJ1IQ75tjTUYIf7SdG390tbxG+4wH
#Fm0VDRt8Vs+wV8IJmSI0XKvV65HSd+bMhos+gjccu5P3xXX8HvtbRNDr6PRohPbqAUeqrk52f/+9
#Qh9+NDq7TDaI++NnwkB0T+fWR9e73b2zrY++5jvhgwA1oMlEUJTAOpY1c2/CH8BmWCyvZvbYuEK4
#M1obc7Erwjl0n2fooPvXjlGt7mqqkX9YTlhrvKDXmyM17jgwHQtYTLsHxPYEcPjllfjeVWDM6LbC
#UaQt6zPDfqboiTAqA+Pjx48V7BmF/cEmGZmZPGSJT1Or0ZbPDi56p/0RoXGG+3Bf5ZyT3s+jQf8/
#L/vDiyGikFi9nw/fgvH8m6O3o3dnJ/393WC+ELLA7ViYIfCEaownxEavMIT8aXnHKFfG8F9spgOL
#YHqB7ZuOQVZ2T4DolQqEH92vYVd0NYBqrhfsM6fsFbqSPvoiTxTy0OGvMCOasIA434eCJ7WRFIv/
#b4r585cM8v9I/K9ms1XE/8ol9c7PMYMCYRiTJUYpSvDpsP/68i3VyYffRAuAu08HDcHjMwRm3vVO
#T/vH+36A0A2vRO8pFOsP9kNYUNzULzbF3v8NMoFT7n+j3lLtf9BjVvj/ySVxpIPzf5eLCO+32SSM
#X3o2GPMXC4hCdIzzgUW8YG7fYA/uiCJwvbFVGvYPBn2ErgBQ+aH/SyaWcUPhGZMwgBGmMTgWeHc2
#OPqfZ6e8DXEoQMX8juAbL8N8FbAPtPnmK2Atyx9ZF+1mR8hD0z3o739X4x6Lop0iHGZp7QGuA47U
#IboMuIavkFg3TYrqwMXbbyLagjXERkZ+Sr4UxE90VN3OK55BhtSplZhz2oF2WNynLYxMLEt57eEX
#2nm9AX2on+kAyIYM+gjqv9Z250EInqs9uGpBHGK4BUdxm7USyiXoh8HZJTpa+Jyxjtgq0d/SMknf
#pHWKkwzIrKgIb2kdJlkKgyyOORaKDegt2Qd6u9Pa62VP+0b0ZTeiT7Yhx//2f5vZ6LKKYb33mCW6
#6KfL9Dzz3lAccpGPEedd4AivQAC+1JT0/t89IuaLmFLe/3q9GfX/1Sj0/3NJY4iq6CczOh7JRBFi
#swRTi3IKDFIAIr3MbR+Hh3HxL4jOgouhMsEUmN6kvD+1F74UsSWw/MAov9gCl/gz27lVmCrbZWPf
#KGs5RmUpeJzMPVq4thOgXpeBb08sPBTs/STadeWjzNAS2mSN0fl8BPbp1cwyru5xg/SuGeAuRWoX
#80084IbawRYXEowwO3eyVcZSgvI28Jw0mUx4kFQASxPiCmAhA8r8u1Ez9oz69l9finNCz3gYFAxm
#AVxdNBO0Vo6wjdJ8nvt0FyktReC/4042rQQOQH1V/+/NQv83l6Tf/81qAKe+/+2o/79Gof+bS1Ll
#/7D9e41WtVGv1igZg8hWe56uAww1/+k3WitrAWvkhwtzfIveTyI/pT8gGM8t/pJJFZjo5zqLuQH/
#P7aZcHRiU5nq9dKJaAVDUXQRmMIuREFbeJZvOUEo7YEy2Hc3CE7ndrBP5KXRxsMqc9N2IFQ2LBEO
#fkYdmG29rO6KU325XYWi8Oq+tJ2J9Ql9fVlGiAxv6TMJhgulHjB+QxR0UTkaBY9JysJCvASOcqfT
#J44X4FLt4lB+u5o+8cHJIciN+BALkc0Xl/Twf4PCn79k8f+i6n81Os2C/5tLOj077KsCoOceU5Hy
#S/r7v1kLgLT7347If1vNQv6TT8pd/x9z7AVhDhEsRIQ5VMYTWgCQepIJAK2qsQEgtdNtAEqZUN81
#0d4/gPa/5v4v7oOp6zy3/882+H8u6P+nT3H7v0kOQAr8b6BcFf63C///+SSV/ifbv9es1lvVLgZ/
#osb/5Y8MDk4JIDRBqXFW8ae7y7u9GshABeV+VhoT+8u7ND6ASHgu74xd/P+Svji0ARQoahhEq0fH
#/dHrXy76BwiH3a9TIhnlHR+d/oAdl++P3cV9+P38l4t3IK48++kUIpQO9x0QSwv5JMgcgOyjwdnp
#SZ8pOVTvECKkZ1Tc00h11cCdz9AksZL3CgwKojiLpor+DySlZAF+txxRF1vQtafdrWDOnLUf7fZs
#3pggQTU/LHTjucuFOQEWjH/vIxiF/rixJ0Yd2IVY8MCLggxFKbnkJUktKI/HNfYsNP7K1J1baarr
#jAOEdXv3UfYeY4KInBBwmlUOjwgc0r0Xn7H/LMa0IYfu8vT15Zs3/UH/kB9UknF4dnrx0+Dooh85
#yIlsFjw9zmBRFXOXd/bY9RzMd9ojsweVC0NWuTCoLm7BlvkTp7j3f5McoHT+TyT+a6Ow/8snRcFT
#AQz+TCnu/m+SA5TK/4nwf1udbsH/ySVl5v8QjOOr4P8wuqSUjfDJRvT8Ibg90RS5/x66EM+v/wEh
#wQr+Tw5Jv/85639o4j92mwX8zyOp/B/Y/r169btX1XqE+5PIBx+v5/4NPSg9BMq1/t+ycDdCBtEY
#fXF3PesGxnSfVAc0V8nflNTGVbnSB/X8gP4CXo4l6HFAsLz9MnZ+iwa9V3mx5aPsimO83P1fv76n
#mhy/ftjdgZ+7/u7/ggrGt/vGt+Vft97/r/KHb3/dLle/3f21vrt4aRxAr4Rv9C8Dvbq4pfr2g6Du
#wX0DHBplMmLml2L3xWdoHBUWfL8V7uKKtGLSw/+c9T/qKv+/0a0X8T9ySYPL4cXo+Oztvu1cu8W1
#/dMl/f3PWf+jrcb/aDXbhfwvl/Qn9v9IsLhSFux3ZcyXobVfPFeA3//AvV4+hfP/v6xD/9da3XZB
#/+eR5P03P/pPcAZW3/96o9Mt9j+PFN1/Evlnk+dg9f1vdJvF/ueS4vd/PHOXk49mMJ4+9iisvv/t
#WrfQ/8slZdp/0COpBtfr9gGbmqj/14nE/2u2C/5vLsmzfHfpjS2jjPZ+FO75aObejLAaVhnM9m2/
#bHwuGca1640sczw19o3A9a1g684Ev6a0qL9dQmUw01NK+wbUASeVSwsV8KzAcsDSZGQ7o4l5D64q
#oZ3wO3wsPZRK8uh8xx8F7gLs94UhjYHNS1swZ6Y3H1novM6Mf9s3ymXj70bd2DNqfFz7YBkHRTH3
#tIIr+OWEvkb+8or4V0UDW69j0o7pgV9Qqe0qNPa+9qGK8lA5RHUH7tidwYKVcVtl9NVyJtgngRHt
#KjpsYQPnFiJeULdQPG4PeXs+jJO0LG+fsl4vPuOdvLXuH8p0Sf2FObZiNrvKC6DCdEBS+1JhUgCV
#nNhz5h5ZXzIsgEpjJ/x+YI+lQZR7dxb4YIBhLizPdifqmWzWarC80KKJTx0p5kNeA7ZtitZ26s4m
#RswoeAF8GOYL07N91Iy7AJetricXZl+hYVBDHFF/CSPsJxQG7LjBaw9qgBeFcD+Io18/4aC9jz1U
#H9ARfP8BNeXe8nYMzUHK3lTh0+HrSpnef3cZLJaBvy4KkPL+18DZg/z+d+tF/M98Etla9DywN4q8
#ERhmJcCJWDCBoES5XECJP0zKdP/RKbDBf9GaECDt/oOwT7n/zW7h/zeXxLYWoR8ILyOXH1Qm0N0n
#XuoBxwwLhai+UBRjFGDDsUWqbAMKZ12byxmgxxhpEJqQsXy1GWc5v7I8qYFmTW5AgEdqbTpksTaG
#RmptX5ro3FxskaDHW5+x5oWA1gptMgzWUPqSMEVhBhIeS3oJ1wehZAxNhEouJi/MGS2xY5TfYlsV
#72JqOhes+TLUfNjGVFY4w88Pj4C38fffGjc2xANcnf/TbBXxX/NJyfv/SMYPTSnwv9voqPvf6nQL
#/C+XhKlPwvHw5yNEwiLQh8BO2Sgvr5ZOsCSAkrFO8AEBJS97bO2OTcd1bFC9I0Wp9tcu4ReQbyP0
#AQDgA4TKQ/B3d7z0PAT+d835pNPand7Nd60rv3KzaKIvdsWe6FgxFqpkB/cadhTlJRA8FX4A6roY
#j+wJ/UZ+ALxEUBVH0CEQfmJxng72ouRPja1b677iOrP7HeKjkWoBzmwHfoACoW/YgQFqdIbp3H+c
#Wp61XcatwbcRNqnDvIMGeRRc9kn4GLJ4MMkfjBekhbE98UZXoG8IT8X7MrXU262VgXp/wAD/Hk0Q
#vT5lOpMynYrKzpnMbWcE7WGeDnAmHHhwaenI1G+XVxCUJkCzMxd2mRaSZ4Qub5NmyLMSMuJmFpkb
#HT5hi3zAZR7YHBM3CXQRdOv9qqZZb/rxEeudOhZfNxi2IPJo2NdHDMcSRyP3qZu/dvqVeubuAvMG
#8j4bp+TqswtmPEQvKLo4CHLYXix3FF2vEXGzCmWjDFJoQHeVhTq6hmAkIfyyTVgSlHU/mrjjJcK8
#AjQg0/eXDK8FRqE1D+9CyFl7X/YDf6+Hyw7cmYXWga6f7YzthTnz+fVhyCZd0iEBhuys2xPAba9t
#BPVws+gRrZpz83eE2330IfxcWTzxGcYP7kX0o/ftSTiM/tg7dm9spyxNzKBj8PbeWkGPxPH6HfM6
#L9xby6FjYZtJRvxteAZ0PZK+zpezWbmkLiJdA9zhayAcD6bW+PbYvLe83h3C1s0re4bgeHknUhAN
#7wg72ZWy0NdDGnzv0pu9cT3cFC1Dd0gc/MxyboIpFkmg6sDM8LeN740aOmriN2BkitPkgJXPVwNa
#hbapc9/R1XJ8awVSN+/rlE2qhbzSjg1JK+zgyFvmN2HyZ5gmAatu9Pt8Kf8+RO9TYEmfjhEJ9hoP
#iu6svDxoOGMziJvCjvEeTdcAFo7tGDGFgLvz4jP662EXLeC2DLwzrSM0fGWOb5cLod2Q/Zx9/V7j
#Rvy11y9lsd5rB7rDpCGRHLwg8tWWgSRcb1AYk+50VFSmClxwWZAFYNiEW6BQApUE4FGNgR1VUgP7
#lYwfDa2lG1TMQKAWzhWbqUJu1QZBSLbB4fLxQ8N2D84YDY8ookbHlzQ63djwixLti/YjvVzoEBua
#JMxIQpUppsulm3zs4kvBHjYpE0Ds8grhXiM7IpzCF5BlUqxWRoTRd3xQoygy5sei3YDzqFtNafvU
#TGG5pIdZMzz9qy5iBJwzzBvaMxz0dpTwVrkBQUJGEwveUHrP79wZnHQakBE6mtj+7ejmSsylnJsy
#IhwIBLCcsXe/CKwJHl7g4a3AYAltkgk7NyI8FvaSAwY3CuAZ9A017XMPrZNyWHixDEbo+CxQG9Zo
#6i54VMoG62pmX1vj+/GMTcW+cVzPGo2npnNDoAo6Wxy1sBB8m9gYo2QQLvySvMy0uOV5CLLOEV4I
#zubhURm+G51fvj4+OoCwIeCVnc3D+K//8/8MEzYUdFaNK/eTMTXBO70xNx1UGz/zEO6yWpah+iqI
#oGXL5Bk7W+y40Z/sfMKb4WKHt3jJ0REvp/b43PTy15aS+T+PFPzRlMb/b3RU+592q1v4/8glMfkf
#fwbsiSwB1F5cdPNZRQqa4Oar1RA4IDV4GbFi5DWLNqB/1goosMGUfP8fKfijKeX+o9teV+9/t/D/
#l09aUf5H+KmpxTjmmlpSQoiziPOCZnUGltCKWI/iiBnEiS1VnBgyTFeRaRJQBUG3QwRORd/M2Qww
#0S1MWUMPjLQW+kQY8dh0tuBv8NGG/9gxatvblLyO4Hi9w5Oj09HB0eFgaMzR6TWuLAN++RjFA9Y1
#WnqIruRD/+5HhPsFLuFg41yZ4YvRvQdl9ySMcw0ZK+O0rC0j1rAe1m4rQqqvMSFZmJGlgUarWmv9
#ARRhkuC/93zy33Yh/80nJe9/LvLferMb8f/b7Rbxf3JJCgGPALdnLVzfRgD4Pl3zn5e1rTjdfyOi
#/o/D6Y0QlT+aLwMqEwCQeXRycnnRe33cL5PuEFIwwUxuoSHM2OFt+OjldECHGj281/bN0hMfY8gc
#gVb30p8qLCHKLAIdJF1NIZvxmXr9YaPdKccxRcL5adkiaFU5ayjkuGrXNroLmOzBDDP+yYjo2JdE
#zivwVdEc3IlF9Zk8uNDwNDI+E3w492zXI0tfp59FISeWDVvWwpiZPriKhe2G3yO89P4D2QKfSoHQ
#cqOtGlPxKOsGL9QwMIMlYcyXTee+zPOwhPCCvKIoD7d3AN9OXM8CvSel6CnG5ShDSBgKLfXARmLy
#YTDEs2x9WtgeQi8fCG8Li362v/zHOYeUDP/z4f+0Q9yA0X/twv9XPimUP48RtWB5IyLBDgQAJfBs
#mHctmVVTfvGZi0aUVgjPxhzjC4y+PlQnt1gSWyUQBRp0nQdFRl6SumRQb7T0Zr7c82cAnfjR2cHg
#EeirGAgKkgcMrL/HJatyuwRsa/oMSQ/WJybmWGf4o78V0+c26hR3BvYzXya4Sb7/ufB/ao2I/79O
#reD/5JNEvewQl5PYNhKlLZHFwiOcgfHSUBgv5O7rOUTPvSx/mpRw/2835QNiHfof4r8X9P/Tp+T9
#z4P+R8heTYX/7Vrh/y+flKZ/OJ6hBUII3XPrUd76j9ejfPZJpCmDxmqM0V3IqjSGVqvCqqylOybv
#ejYdspEZBOZ4Kp8bMmKqM0ZGKulm0WJc4Ze2hF0llNE/e6j0Hiq9h/8g2bs9vIb9H4YHpPY54ahs
#TOcOlm99vTvhpK2zcOFAIxw3omCbviw/ud6t5Z2ihujK7GSsODo4PRqtVOegceA6AXolLG9AacOB
#ZU7OnBlp4cN2KXH/RWUzafMFjmGUn3YLji7o+Ypag6j2IERow77evvKZHIeOTPDMETmX4JiDat8R
#TiFjLjIBp6+eJElxz6f8ROLBgwnVEDkMOlghU1Is4tl3CDCxMjLfksbZYgeRDWUBev+cVTm86J0e
#9gaHnFk5sRYQgmuEeWLvkw8gm/iH6KrPzKUzno4YwhC5U2jo1rX9SaeZWcFcQlHXbzQ3FwuE6ofm
#FfgrtzNCv3c/3U1Myl60rkKYG9UPxDdOVBKMVxOMURQU9N1yVBeE0GXE/ce+cWX6VqdFubZ/+1ul
#f3aBmzo5OulXfiTndc+oV4ldxwHRjK4A93TPmCP6Cr1LXrA7tz9Zk78aV+7SmZje/X55d5euYKWy
#u6upinYBnQDM/MaRTKv4of1ITYfMhc27FnN37+rmbDE1Cd/41nYmewaAmwN8RcipXFjjPbrkIHGe
#WQH7ieXkqFz4G626+encnfh7lNGMdxR9Qwd04j/wCVQq6E+yMts6fUsS3210ZV2D2uXEAhed9+Id
#0oIS3FnUtoy9gQyqUN58CHsIb4tCmbARdogFEIQzOajRA0HiAkiFKxp4ImlMYCjyni8ZfMLYinJZ
#mT7qRATCShlBhzsEmgkl4S8/EGApsRkZm7NQIkP7BWUHfF8F4Ix32Hbo7ffh8kTvNPleoidE34b5
#KQSPEJ5Q6RpVWzomMT/BuuH1teAi9PUhm46vvASg/SzO74OMsQYzdJ4sD9DEMYGqrj0ZkxMIfMmY
#U8f4q9A6VIB/bYRzWJ4e3XDRVO0JDMmxxvDKuHeoCfn5hO5ksLZq13BpbAszekfANTIYNq1Be4Pp
#cn4FKHVAiqKSGK1SFgR3URU+YHVyH8Ge0TVaZMvDTXzIZAq2RGgU2pu1qZmf7GD6k3V1xDjkmemC
#N9YEbP3Z8xChDFJ2iTLRgYdMnqoSBaKK9jjcR9blEHPS+r8t0bBYr5z1hp9oz0KXeWxtrbjJO9T4
#cQ89Lejv8vbDnrmchF0AP9xI2vgvcAIIvuongCOK7lGDZyrF2IPnjAYb3aN9VsKztSphKtRMO450
#iLwKWp+9QyyyvbJ66NuQfHtL/HPsZCx+RN+TlBrH+A04EMXlKTVo+z00gTu0z3EdDK3gkMDHA3Nh
#jiUDQbHcheWh9wItDhvwkaNOWjQfbPBxHBEGtT6PtgXYUEwRMvEL+vZRfEgpC/aLYktvPHfOPgwI
#aghbKta69XkPgDrdCOPXmDaGBotJRK56ltJJXaHGWsRuBKZmtjeLGWvi+PS2Z2GZVSzQhFr6IQtn
#jyJ2gXlTxpqmYxdhPfcRKp1c2DKiMMFDfBQ07FoOQK9Jme0E4KXltErCcpShkvvRIQ8JBqPRUVL0
#M4rdEsDITxV22KXWxl+ZQgmaL50TGB6pidLoYIfNAae+CFP8wfboC/MG07cBxSpRoWsE4q2s8BKR
#gqOxbxdPePGEb+YJB/8j6EBVwNoYwRN05Sq+mZkzS49jZtYi6Ww9YCsf/XWYi9Jo47lytNhqXFm6
#xBVogbEHXw8PhkeHnn0nMWnnCHxOCPAEZyohrDInE9chNqNgaVAZOzahFVzDiBRDmXp6HmcDC9qx
#NZR8MhmP64a+KPgoSoxpQVGfET1kGmU7AuRPiQ7+OdtYCutpiTtBSa5/CjqPo/NB/83Rz6PD/nH/
#be/i6OxUfiAM46fe4ISVuugN3vYvwiNWF4w2t/W0reYt0DD5xPXT6icyQweErjFfstigF/7EtwpB
#vE/37CuBxh99du4rE3wW4s4b4YFg2KJyX4QLlXn/5GrCa0WP6ojpJQlcYOHBWmUZn1uMt3ZKlv/m
#o//Xbanx39udWqH/l0tiKm/ifdNYcmqvm6Axx6ozOUaGJlhRXTMZbEMj7YUyGkAUYlsSuwOsgqNo
#Uee3WXE6sUmBIGJQRd+oSroo7eChEWwnw9wT2YGJ+598//PR/+t2Vf0fdP0L/Y9c0or2n4L0NLsR
#aFZ1Qi7CyGgHOrcm9nJe1jSS3RpUdS4rSZ4y1K/XtQ3YESNBnUKkbuSEFbZmbTTwLBawAlCIv/8M
#pjxeCXB1/b9Wu1vY/+WSMuz/o5UAU+B/q9aOwv9WYf+XS4on/xAAFIxBNHQ0cDXETxryGTSpUDsV
#1k7FvAFGxBM6bgTnbujLhXkztHz8TG1Kew8ehOqj9RCpZbs2Eg/Ni3O9GA5UdB34JI4DJdFDSBJj
#93fhT+bzLtPEiRl+BleWkmO/x7v124RTv2QWYMYtTWcOKsGVntzl32oDTx6sXjRDW3nPin5YRUIT
#rZw8MeWQpa83LZ3HUmsGFjsY/VKS/FXWj9bQDxEgvQjhgansjm2TRjnLeDSiOlKaR0ENEhaqRrHI
#YAo/TmbWCXpTAgMw4YhRnU09747wjsWZx3BBExZH3EytWTwFJHQ6xDL+aZeKh9ZLXix6JNZYoefG
#U4r0NCkD/v9oJlAa/6fVaSn4f7fW7Rb4fx5pRf5PlE2cUJjDrXRWkfjchLwLOWSOEvEmo4snfYcK
#hF7NudRz79kmU/z9p17ENmADugb/p9Us+D+5pPT9f7wNaBr/R8ij+9/u1gv4n0sKyXZTCNEw+t11
#wKZf0AHANDvW/2C69JiNM3PHjKVi/i6F6/URNWJtcQol2nwoSfR3jNoOcYz4+whD5G0BY6bOllR0
#mTsc/ywGsRGU6KjmnFiHaND5UxOz2B+MPfqUyOg/OKKWLEF4uBSJlsSNo6wS0/kYTRx/RM2xDMG6
#SMgFF494xkboy2oVD9u2E+CJjkCJ7qMpu5HikY/oJLjD3BU7IYKbMvPtq4l2TXepFHYaSdFRxCwk
#LotdYeJut9iy7hivdkivVduZWJ/gSEQOEW8An0M0MP+9UAV4NwiHGHH/w+APjKsdKus/t7wba4u0
#Ix69HcqkOtW5NtNwFUhnlRefhYE8MC1P6ZxiTSlrdlXmKjzYKVXsbhDTwFW3I9tGZNoC49+NV/pt
#iN2ADaxv7EKT9ci80uTumLNK6pITP/aOGUTXmt5llCcGMKJu7BOc2Ms2kdCy5uKh79qLnT4A8PRK
#zPhCCADut1ExrAsAmy7HmqAetvE36qCblkyGFlq+gQqW4tTLPHcZgOu/K8ytE8FLEuzCtZjmWXhy
#0aKGgatwJu09bEg7LrIaWj9+mous3ShlHuLFTJoIj5CD68dEx5E2ODkgjnKNowsCHCU++XBYwkce
#oYMa/sXGfdBdvbS1UfhmWZ4TJSCK7pSK8IUMW+yST1L4SGtSz/WZh5sF3iaOlzSw1oBJ1af3dp+O
#/z9eBzCN/9OM+P/rtOv1Av/PIzF9M9Gxu6hqJkIwQT0NK9sh6JNQIQROmnARqm6QFPVBuu3fflAD
#TlAPCVmaoBeQtfHci/0FpvT7/3gdwFT+b1Ol/zvdZuH/L5e0Kv+X3/lk7bw6Q0TqHTX+On08V9dw
#CxEjte6V686kmpi0y8K4jp3AH8B1/0ZS/P33Js/q/69b8H/zSMn7n4v//1a7HeH/oieggP95JIF/
#68/NGTgcgXA0nnVjfdoq//prdQsRrJ77L5y5/aK8I4exHM8QzbStYaFMrhiCFhu1nQBfwU2O4Pwm
#4vdmVRZmhpjxEkWLTntZpN7vpODxGWOvkxGM/BtoI1tMW8nlPl8Qy7mxHYsWEYN9h0XgA9NjdMVs
#TQExDDhlFAjx2eW14npy4mSUMO3rLMf+ysuRshSJy5C4BInh6TGBT+ImYQpHmfozh2GPnFnd4Ud3
#TxvYNtRoFe8dFlDAGivnhy88+WMUuoQKcwXvTzJIMPY1cEJgVIIzJCLzF3oMXbiBAUa0JCkFeWFJ
#FilKDbbLXL6xfNHtmxhIBHywCfrM7CfKWaARIwKIAQP2E3I0pwxuhQzyQjVoDTyUjFbXje2L/b6N
#zN8NOdFlopkwXkxJz+6pU0H7akYRX+J4AZWg6hCeBZcRmMgLy7PdCW+M5k/Mex+jyTOLlELnmgb9
#MMR1Rct+ay/AQZM5G/mOufCnbgi9mLsHOXsknU7pnOOCWE1zsUCzsOdg+INOxuxemXMkH4dFsTwE
#l+YkuKXj2zfTwB9RTxyo3r8RiQR+31Z9ZeSLBs4M7LEZ5RfSDHz+hVmKp1W61qS4LNcw/t2oE0Vb
#kgsMEAJeJ1fhEVMDdbK+ovdTWDXa4kgpwd6vhCJ7MZd83QOdclBjjxU/djEH5OlOR9aN+2JjFyfj
#//nYf7dqkfi/nVq7wP/zSIyrGm+4HQEr5mQCOJDEk0VPYIaa+KXcUAhgMVgLhk1sBhp2sDgQWhx4
#wuFEnnsXni8l3/9c7L/r3VY0/kur8P+QS1qR/0vQ/ozFMluKh+CDFqLM4EeFHs5qdS4Se2uEhhWJ
#3DWqy8hTlgYmV9WgdaM3fs9u995WzNYFqipTKB+lOqOb0reaklFyJ9JcfQvhYYF9Z2kZ+QIpkmGg
#XWWWlChKFSAQhFMJV0Sw+Ay9RgId6bDnNQ5LBIPNPI/Y+x8P//3mhtj/6/D/G51Wwf/PIyXu/2bY
#/2nvf7NRU/U/Wu3i/c8nKWzzJjWikfiG5JPCM1yJG8+alSNgEN6nviupmqhDR6JI8HZmTOec8wCk
#AtRSlhT4N8ytwxkl7rg90hJvyIP4AfaYD5qMxVcaSposs/6NU3wj30U9Tjp/g/MNo2ug079MXGCq
#jFlKihD8I2fulhu1eqNSr1XqXcKlHnJjfSGA8FC02D/HfZ7AowTBXxhjvX99bY0pf6bcAyyL5Zwz
#XwyQ8y372uOcxH1DNvWnBQZsnQnjRbM81GafsOx5lN/YDaL4KXp2Y9VtwyKabUo4pmE9fXBqEhQZ
#zaNPfQKXtG4GwrGC4S/4M7MnnJkdiV+94lWCKNDMowbGLGL6uLofMYyC7b/vWyNzdgMBpKdzQwqQ
#Hes1NZxLGAx7Q8PnOs3l6f2NbTnUN4ZmlYncxp4Flocj2+LJX0H8HHQkXfQWWoE14gFVRsvFzDUn
#oXgKYZ0j8xoUSWwH4agmFVR1Y+RjMMQ4NV8ckhrjscb3Ri1VMhZOkQazZjsRM8fILA0DVzQld71k
#StEh0Wxe1XGd8dLzILYDPdkjbWtCuZSGxYPy3I/gnzgl4n+bYf+m8n/r7Yj/z2ar0P/NJTEuKkP7
#IvxXGfKSvyWHlzoHl9FnubjlX2ZKvP+bYf+m6/836+r9b3cK/d9c0or8XxFjXp2FJuABq3PRRCLq
#MRyvIokpev/RfRhvLPQ3Tqvz/xrtdqH/m0uK3f/r5WxWxH//6lPy/oOwxXImT6z/UWup+99uNQv9
#j1xSYHmeCRpQhOlC9hvYb2XiGuO5x1ekp03J9z8X+w/s7Ee5/wgFKO5/Hkmw/4h4UTOEaE9+c29v
#T+Mm96Ec5z7DmtxobOfh6+gawlSP7IVP1UuZTeCa7jSgTdULCGFAE1oW0TbElpV6MiJDRY1Uq7vo
#/xSD13LEWa9kpAJqIkoOM4YGBVQ2kzCXewvgjoDAtYMgZ0pzqy3Mg0e9T5qHdetH56Br2DCEcA68
#iPCtpAak3jdIJ1W6VtWoMXaJhrvmqh1CrGb4xvKpsomUH6r1sygKhtoECRkthkqQW+ARo1k8hGgL
#OGC0FOdBycbfxGUHJ1YQoF1adyO68tSISOH0s9q+3gt0sl9lxTTDkIMqxhppqOXCDZUshaINUpMZ
#nRshZeupdVQ0ZnnWYyKZB8n1WHCb+Cg+OoV2utxXiqINABR22JTrgMrKRidyQV5ItjnhNiP6JYTs
#kmA/ovZJj8OIFfBD38UhFMbSE2UUshVG1PojHG5o+8G0ljSluFmCTm+elyJZjvtRvBCSv874++A3
#NdeBitElz+KCu2cqE5cPJRe1swF41o3tBywGaywkHHsYEqKZur6Nxmxb7K6LnwAQWhY6VjhQMIeD
#4SfcxI1o5kKagE/iqORwCXGj4qXi4IH42kTC4MXekRgX0iJYlxxJC+ZXrNxn2Csqed0x/IU1RrdM
#3DT0QMPXKvVCbex/z0bD3HCTgtgJNxbv6ZAKYlMRyQlLM7esfPDKd3HN566Dt5FxJONWfTxzl5OP
#ZjCe6tZdWvSZy6Lh0rz3ZTEKL/MviK30QpMpQd4JDcgZcMdmpjcfWQizmYU9Ch9LrEzoLO3zww6N
#+g37wgAH7Am6K/6W9LhsgzNDKl1FDwr7/lAZL5bg7UyQ0YYnBAT3Pw13B4fDMs+eW6D1QmdePji/
#vAzsmf07kdDzUsEU4XxTdzYRAAqZDOovFC7bc1DmJLE6PhuHr3ns7lhjL2HoZSomFuTQ0swAIj9i
#am88y6KhNIbYS3GGyV2jOvA+fGvUOb2y8dkahruAYMOuRwZ6bPn+xdR0LtiwynxZ2H8/VKvV7XXI
#9WT6Lxf7n3qzpbH/KfT/cknp8R+TnpvMESBjGtHFgEwJyqi0FCm9UjBGpTFNednSSEQ6lDZYJv9D
#rEmfT7ni+/CxBZAuP6QImlMJOn1RpebEp1NuNEKgi/U46kktnyxlROT9h53dkV4bOjT+aY88n+j1
#Z594NE9Cd3OrMqD2LUToy/38E5XcKu+Ud7ifSiiITbJEP5bbkaZWaIn7fF0LLP5pUjL8ZxfraeN/
#dmqq/L9T6xT+X3JJMv/fs35bAv9EcPZQ/n7fqFfBnxclpWgJfjSYBulHX0DFBEXdqelP7bHrLeB0
#McxFaP9/f290qp0WUx3F/wSz1MZQEX1jrWpLUUNlQ8XcyTKd6E3oy4IScqEaAXE5TrpnnEfa17nn
#gkqyTDBAGsK1IfgaXB02thPTQdAcTMnLEEYYbpk8umff/6T7n4v9Z7PZVfX/EPpX8P9zSSvq/5Cr
#kq4mJLkHTSio8Qaot/5cKfDMKlGKdUGHE0pGbST149WEAU4oGI36m9SqFOQ3ueDaYYxF/lhGQ1qB
#YZY6PgkhpuUg2o+LDT6oUQrnMoW2kZw/GKp+PWxvl6S5JEYHSt1lzlBJHhvjy0tjCx8iccCU4S6s
#O2Ehk4+8ZOo8oozjqBGtHDEpYkkbNm/oOlA55+mLdZX5Qshc9CzF9Za+8a1HbXvpGVFLrm/JK/LD
#11GAFJlkGXp/1Y6pTtlQWey8o5Axe1iuR0XJEvU+JaHvOgsX5aimHgmBtaqf6HM/vV9EisX/ZuAK
#aTMKgIDUraj/1wH6r9D/e/qUsv8bUQBMo/81+n+dWoH/55IK/b8/d0q5/xtRAEy5/41aOyL/qbdr
#xf3PI21G/28TenZxWnZJOnZJGnYCHlmorQgrGVVbIWb/aWNqxOirKDuniweYQXcsqXQkZsz7Gqhe
#cFpV8P1LlUzHDaZrGNX8EgsJOl1X6AAtRf05sRzJhbM3mdsOPoi+0pyQA/Pyp8wVBzofYjk5B47s
#GMstfXmEUaki3fh7XLgUejYO76ufXaiISn/QXnkjQT+nwAa+vpTy/m9EASQN/292G5H4v61C/pdL
#Cl2xYtcvoLmvUW4guaFM/WvQinjulf8yUsr934gCQNr9b3VU/L/TaBX2/7mkL07+/0wye3zc/yhC
#+w2mlPu/EQWAlPtfb0X1f+qdwv43l/RHkf8zki7d9XRI1mVqlJB2WZzxNlrVWkv1yBtSfRml5DL9
#t4YT4D+9ZH6z8u/nvoDPnGT4fzNebNLxC00A1FeT/9UbrUL+l0uK7j/j+G2uj9X3v9GtF/ufS4rf
#f9ML7GtzvAEdgNX3v9WuN4v9zyNl2P9HywBT8P8aOPuT97/d7XYL/D+PFHruuHHdG2zzRLZ9xDh2
#o1D0IDloZoY6GtmSILq6D8Opht+IdG1uckcECMs9PDv4oT8oE/cfCB/0qG9o5uF5Pl8GWLZHiXuK
#z2GDgfHMMh2ESBL/5qMJDHrpGEKAQ6kEiNNUv9GAIlc8a4yofULqm2Pq27n8Q79/Tp0qz10fFmYs
#+EH2OZsBY9mirxNZFPdlcg8y3P9HywDS7n+jrcL/Truw/8knJXPxqa0yudYPFXIxq4vbm+rEuqM2
#8QvCXSOKAEJQNg4zxAYzABniMlgCIF/YnfmaUob7/2geYOr976j+v7q1RmH/nUsS/OuSe7wpFqAK
#AZLMdbTsKSM29lgBDjaX4u8/dpji/7YBJ7Dr0H+tIv5XLinD/j81/dds1KP2341C/zOXFKH/IAjO
#MrBGNzP3ypwxTxEQxIr4cCMQWnV/Jjm1QYemjFUiPfQEhJp55R/PD0bn/f7g6PQtjuZOmqbqeyj/
#6PSiPzjtHePKnnVtfxrNLOcmABXMegd6JQqBkt4d/SZ7oaRzoWKKES1DgzE5JGS9RMzKLYszE/sI
#BR/RcmWaFfZVJaMwFwidRatKgrdjTZrJaGFZ8A6OPNO5wcqd7xOXnznQwwv8QT/X32YjLiERotKH
#c1zNLWGaY0JJs1RaLc4E4MNJ90o4sWYWNu1CWEhgMdIb0/h41YMArRYX79uWpw5WHkJgUztLLAn0
#7d+jO8ZdO3EVUFoanMCg1VXrcI4DOrh3pj0zr+wZeCQUlE/DRrlvvr8b5UH/7dEZnGpjzyj/zzN6
#vrVTFgLPs6kbhr3QRhCDjLsWr4G7JuwOkstcLrKTrZ5k7muBCuH0fQjN61ebLwoYutoOhNEaBfbc
#Ai6Ji/b3XpgTQNrA/2gH063oIdgxyudnw4u3g/6wvE1bvLIdE7UAxn+6gaS3ePLL8D+Py9vMexid
#amhIqBwsSCgTvXfoipLCTPFa9r1Ilo/9l8T8koLyZQFANC5f3GUGE2F0fz3XDVa4vzpPlAwahPS3
#Fljg8YS+KJmiDPdjSWMWar1WTl0/WG1P4Gp8A3fCWc5mBUb/XCkD/vf0/L9axP9Hp17o/+SSuKu0
#1TyCpcIRnY8w9iShF41298Wxw/90KcP9f2r+X73WUOV/3Vqh/5tPehr9P8kO8PHOVrR+VWJcqMgx
#w9bWFJOaAXIii6be5KoyRufJnVfqlearVk3R3IuqJRpxXjtqWkW5jIHTunJljWMUowidViSc4uH/
#zdh6vvhfrXbB/80lJe9/LvF/mt2I/U+r2yr0f3JJsTxT6vSpTHzJkbeDfiPm2vtgvI1ewS2JS4gL
#7xi1HaNZ2yb21+h83bPgNmJZHIOlrOV/MC5oyH0WWLXM+l4w5tGZBiW1q+WP6nigIlOP9jU3x1MI
#taIw/ngxMR8V/911EluF/BI1WYop9p71DpwW8JD8cYSQjMUC2EnAFFouEB7FMRcw63bdABtBMDUn
#HKt+Zv8OuvOeOQ/5XVjqSkeC/2b2W5j9GeWQMvwB7eRiUrkyZ7CKE9E4KmSmo1UOLO8avPFTqwFs
#wC9wI7lFf4mqXI1BHiDpfcG2oBKLkHelnA0aYZr8kMcxtwITMExuCub70wpEToisMD2WYJsBaOXD
#Xvg7tNV4INO8mrnj2wqVlld4k6gRWP4y61y5R3QENPxDyIiTS+EQRFUSDgIPeOwuiHigjMmxCsBq
#UJ3DsSdIP1Pbmk3Asxp33SeuH3WIgQPoWCM4GOK8OfeWFrsLFnPNAVSLwcbe4Hg8YfQNRSVvZl9b
#4/vxjO29feO4aADjKRd48EP6vvahGjmh+CMcyA/kbCyAn+xMbIk7HX4J75PieeHfsAENKW55Hrot
#c3ROyKEvD4fvRueXr4+PDkY/9H8xbJ+bNxr/9X/+n2FCmI0ZsCmu3E/G1PQRxELXH2wD5xba0oUZ
#TKuK3eJK+pQj25yj8QACDwI2cBuM50YPVzgp+kHWuoxVudTpW4I/+/C4w69Qw0cw0jYnaCj46sCg
#WHF6SnvkkKLLkXp61bBwrILss0KavuScReB1B65vBVuCCxbMzqcW4iK7O5wlnyFts0qoyR4Yawmz
#y2tmVJJAZsYHHrVJz2/84fufjP/lEv+j1qi3Ffyv3W4W8v9cEuP/ctcOWn3NxDdXDLhBEUTB66bS
#UsKDVzAeniEl3/9c/L/Xo/rfbWAXFPc/h7Qi/3fDSqJA/KQW4lRCakmR9MrCr7UaFcCZJ6Y3qTTW
#Zta2FGYtRluzdE9MzyuuX8HI/S793WjVWpVZ4FfM+aSjGpwzEiV91TZmZ56uwBu1GTdW8g+dwQ78
#ue/J15qS4P+mbIDX4f92GwX/N4+UvP+58H/rjZqK/xf837xSCiGbpEAa9YiqTZKbVNloVC0o8TOW
#jg2cLkZRz6w7azYiLMKQ10RfOMo5XHiokBPoVE2pc5K/o+fZmVqeHUC0lT2EAjioE8zCFJlWI2/J
#OVfUEJTxnOjDVO5duV5w5ABlNLMC6wSErAvTCy4XM9ecSNGsoowrwn/qprCOkngKZD6RfRH1dfTx
#e5lWDsm9JvF86eo8SJwV7ShilASTGRc/2tZHia8EjoVns0uEx/jl4nF/zpQM//Ph/9QbEf/f7QL+
#55MY5wYHhUn0xBkPDkKvnMw84blnVaSsKfn+58L/qTVaqv1vB/4p7n8OaWWWzfr+4ZgkdB2ncc+9
#TF9tSrj/t8+p/9Up9L9yScn7nwv932o1ovR/Ef8ln7Rp/S90arKqf6GiCSpgVNIgU73hUCIKAu/x
#c0LJz5l7cwMWuOjfn4DW98o7YnaotVKdW+gtGqcUuiP0q5SN3SRPPBv84rPBn1CFo+pHTXtx2hZQ
#6AN+8xaSn+pQ54PpbijKDkxHY5NqDGPXweaP3ogG3E3SkJPU4hTOjsLMwfFoWRGf6bSB+OdDKWJ9
#HTG6DvXGwmzykbgkn7t3EEOX+AHHXS0QMhFyiah2EclisYNIU/WS3viYZtMGBPtNBB5ly3ewaj/t
#XRz92AcGB2w/6AVx/+hCyd7hj73Tg/7h6LB30TvvXbyjHtVnFphPgWqUY80oj4j92scGxJfHvQHX
#LIORAI8JXUNgdgX3ssYXz6ZrUJbdNFX9u3HVnmDjdN4kWGTN2PZQN2psIDTwso/1r8AcF9uskxuN
#9QAhwrCI9fn6suEx9Xm/zCKMdaJTXeOGzGjhfWlXIkUsZ4KNkCVT6LmJm8bW0uCoeYQV+EJtTdIx
#CS1FLHnv0XgRTlqmeeYymCI48Ls1YXa8TEexTEcqACPisGBLiQi0bXxv1Iy/G+/rHxCx/P4D5wuC
#ITLnCvKOw2H6ZZ4b4b+KEYd4GbVN/C2c9b7ww+eQhKSHkvhvPFsyhBH8qumhhOJAABcs8RMlaEFG
#oA5RMMERojhcUf3+g52+PzZnoHtIZgvLIVxxCkZoIG56Fj7FlTA/sf0XNPwoBxj1BFp7pu3JfgDg
#+3Jx4yE4rqg/0k6E06yqDQt9U01hwVsBjVgllIm4KZCCXkWVcVX106wapy6c9hHVO8Vtvy9Pg2Dh
#7+3ufvz4UfFpsQuldyOqqTIcYmq4qmIvhqRo7G9/6I9O+hc9gIoS3zxFtTWzcmtGvdUv00HjE6dk
#/D8f/m+rEYn/1G4V+H8uifF/2QscagFFVAC1MBpjf4IGIGuHPcWKP0kGSjiGGtMsqy57lZRQm1VG
#GYcygZa51Oif6/L/Je3+56P/V+9E4791CvlPLukPoP+X1ZicUITpIWe0IVuMlRTWBKohi2Zdvduo
#1jvVWrW223ilqNlxDHBVhUVVM1BEEzNoLTZrmupgX5Beta6raX7KYtf+p4OvX3qKh//sqXwm/5/d
#gv+fR8qw/0/t/7PRjfD/O7Vm4f8llyTEf2cxVpkWGZH0xumRYb0xLuf93phb3o21BV93UH2uREb/
#eNiO03GLiBvi7ABJVGqaW4pKIwRlP5qjlT9wJ5ZsvpuzVIyMUGOkWH16Wz/akKCkl2i4KNdec6aR
#VibxHKfo+GQlQjHx1UHD4pTaEYVMoD+oGKsK9SLLBedXIvYe3ofsSX9hjq2HXeF8fMi0Xty8U68i
#SwwbaFk/8dSmnFZmRLqm9WnW4T2PeSrpaBMndrXZrnJsI2P8ck/tCvA/w/v/5PEf2hH7326tXcR/
#yCXJ9D8+T6kUtIYN98UpjK0dZVSBEipRK7uN++NrqcXff8p22YAO2Br0X6tW0H+5pPT9f7wOWAr8
#b3ZbEf3/bqH/m0+KdZHFua4ZPGRJikBYKj72LFDICDV3fEEnw3OXQVSVxqC6LsRZfqL7rrDZbA68
#dL7C4kqFKksxISGMiFcMWlJQWgCf/aBngdVfon1QbRPBHzJzFiSZt4m6KKFKDSqNm9Uon2C9KFn3
#xtermog6PJjZHGmeGuxBkmejLRxqkiTpjZDlgu1XFMtEdQwqq3fMwPi7UTf2jJpoYajdypidS92o
#9FHCMNYcaUKSJ4E7SimvHRyxxat9SD3Z8Wcc+1Zjul/WyF1EjDNBb+3y4mx0dnr8C5AtZLmEK8gP
#gT9CFx8WA6ocH4+Gl69P+xc/nQ1+GI7g99H5aNA7fdsfJl/ua9uzPprgCqv80bqKrrq7sJwRyolf
#c0XvCFqJ3Ofks0EXlM41DNJSrlXx/3Zr2AEbejluELlNffdJjvpK1FMfvXGgWeiOiT5eMF4QNZeF
#6wVcyeZVrbxjlFutJnXtlnGJfH8as0QoJ/MSQStf/hI1Gqutjbmw5bVJVs7LtlTQ6GaWStXh2+xi
#dcSjFP/+p+N/j9cBSqP/W41I/Ads/1Hgf0+fuP0nA+aTRAdgmhdUbSFBgyjubgitKM5+YpoIXx/d
#SGgbqQNRW6Fjee4tyTWl3//H6wCl3P96oxmR/3XrBf8vl/Q08R8yK8YwZKHeUf1cKWTMSnw4oZ0Q
#R88c/kCozXDNtety9Gy1umvqKBFQZ0/EGG6qj1yERQBxuYWt+6EHJtoV+kSI0Nh0tuBvCOyF/9gx
#atvbH0hktogj3d7hydHp6ODocDA05uhGGVeWAb987Ec3mFoGZwNgLMaaGIGL6BUgWyH3dnlleagI
#wosQflUtp6ItRdpQisJ/bNi2KddfOK3O/220m52C/5tHit3/6+VsA6GfcVp9/5tt4P8W+//0KXn/
#QRhmOZMntv+otdT4z+1WEf8vnxSgt9wEsy3inJzst1G+GQPiUbzBX31Kvv/5xP+J+v9qdTv14v7n
#kQi1rxhZUNYqQuyr1V30fwpLoKwwSePEa4qwARMbYo27xZgZXguiFDHst0wDGiyOC5icC+3AT9ZQ
#aIXO5WHUKJ2beCNKi82a+WJInjbz3FAWnTQI3YeOGgQBTHx0Dp4lhOe4tazFCDuOZuMWvogjljQy
#4wYM0LsULx9jSryyG0+hE+77IbGTW0s9CFy+KRgTKkuWuGbqQKXYSVK4JIn9vm+QMTGXEdWQmVli
#3iOMmKJhCCJqtB1vny0a2IjZoWk2s6ExlAaI+Tmzk4nkYtNzkfzWCAeE3WFBM5O3h4VvLXP5hywA
#4aE3E8UfsZLzBGF58nbwfnkjYSDzMNh4NHfEs4AdYouONXCxqxF8LFHreGI/H+aFeySE0gyz5eju
#LGCm1AL7KO4EU5FM3gleii0u1rKTRn/7yh/xnJLqw0NYUmbVKhuthldaXhR2tfmsqXYvz1f0exXd
#t3i9WTnYPR0bBU2F/8c/UkrG//Kx/+80Vflfu90p9L9ySen2/wrkkd72zIb/MY2wwmJDMk6mNCA4
#zyJ/iDUlTWOlIjNVwFBWqhTVDmZVoyBSqMffJRoGSfWeS59a2j0rzR5b5TMo8fB20DucH+WdfP+Z
#E6un9f/arqn8n04R/z2nJPN/WPjDURhxvfz9vlGvgqCOkhS0BD8alCYjsnVOonF0CJqYmv7UHrve
#YpeUYgEZhV7+9/fGq2pDCabIfahRJR85OmIcJaE6imKO4WbmlTUTiEipGYrighWkCd7BYExwBciI
#iEsoMA7CYj24K1+JjCr5/ufi/6PR7kbvf714/3NJfwD/H4xNlD44xgfKqHrQaRHdg0iMLZFllLWt
#V8S9R239KFoCxyeDK42G4r/jD2ZmtQkvLFGcNcmLjMbPSkLJqCMVvgtpblOSCkpeUvQFOTskeSvD
#t1PYNYgMpxzT1H2LMljkDYlq2/iWg460fSc4PWTNG7oOCGsmdd1DNk36GkksmyzFGftGKntFPH6J
#d1BkxPwZbAVj3/+ZfTMNNqMAAI/6ivL/TqtdyP/zSCn7vxEFgDT6TyP/b3caBf6XRyrk/3/ulHL/
#N6IAkHL/691WxP9jvYj/nk/ahPw/s5RQ0ACIqgBwuz5DcN7MLdnEj6KoNFFSWoj3teJ9oAJTpftj
#jXRf2WlJrp8i2U+W7SvSfS6U5/RHvNBe8avOvPqHHxWRMC8TioTxNqhDwR9hLDTgtpTJPtL8MM62
#kB9+VM6HOCNBniEcF0WaGyPEiEh19RKL5PufAv83IgBMw/+aLRX/b3cbBfzPJXGbOQwTRvZCLz3D
#uTRMLCr0x5HXPff6fukp5f5vRACYdv/bNRX/6zTqBf2XSyrkf/HyP3wFvnIBYMr934gAMI3+a7ci
#9v/1wv9fPulrkv8VsranjHgQUlTpkpyMYhy8AelxHSixlalgSHVlEdwqwtqnEYU99xUvUpGKVKQi
#FalIRSpSkYpUpCIVqUhFKlKRilSkIhWpSEUq0p8o/f/5VdcZACgFAA==
