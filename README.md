# saasx lab

Five services on five runtimes, six modules, one manifest — the proving ground of [infrax](https://github.com/comstrx/infrax). The services exist to prove the platform: each owns its store, and each reaches only the services it declares.

| Service   | Runtime | Uses                        | Calls                 | Answers on                                        |
| --------- | ------- | --------------------------- | --------------------- | ------------------------------------------------- |
| `laravel` | laravel | postgresql · redis · storage | go · rust · node · python | `saasx-api.zainlak.com` · `saasx-horizon.zainlak.com` |
| `go`      | go      | postgresql                  | rust                  | inside the cluster                                |
| `rust`    | rust    | redis                       | —                     | inside the cluster                                |
| `node`    | node    | mysql                       | —                     | inside the cluster                                |
| `python`  | python  | postgresql · storage        | node                  | inside the cluster                                |

Tools: `saasx-pgadmin.zainlak.com` (postgresql) · `saasx-phpmyadmin.zainlak.com` (mysql) · `saasx-grafana.zainlak.com`.

## Endpoints

| Service | Endpoints |
| ------- | --------- |
| laravel | `GET /up` · `GET /api/ping` · `GET /api/mesh` · `GET /api/stats` · `POST /api/notes` · `GET /api/notes/{id}` · `/horizon` (basic auth) |
| go      | `GET /health` · `GET /mesh` · `GET /items` · `POST /items` · `GET /items/{id}` |
| rust    | `GET /health` · `GET /mesh` · `GET /counter` · `POST /quotes` · `GET /quotes/last` |
| node    | `GET /health` · `GET /mesh` · `GET /stock` · `POST /stock` · `GET /stock/{sku}` |
| python  | `GET /health` · `GET /mesh` · `GET /reports` · `POST /reports` · `GET /reports/{id}` |

`GET /api/mesh` walks the whole call graph — laravel → go → rust, laravel → python → node — through the names infrax injects (`SERVICE_<NAME>_URL`) and the network policies that admit declared callers only.

## Release

`infrax.env` declares the platform, `infrax.<stack>.env` overlays one stack. Secrets live in the repo's GitHub secrets (`.secret` locally, never committed).

- push to `main` → **CI** (every service) → **Infra** verify → release on `light`
- **Infra** → `release` / `plan` / `destroy` on `light` or `full` by hand
