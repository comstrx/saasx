# Binbon ( TikTok-like Platform Production Stack )

## Tech Stack / Tools

### Mobile

```txt
Android:
Kotlin + Jetpack Compose

iOS:
Swift + SwiftUI
```

### Backend

```txt
Rust + Actix Web
```

### Workers

```txt
Rust Workers
Kafka/Redpanda Consumers
Temporal
```

### Realtime

```txt
Rust WebSocket Gateway
NATS
```

### Media

```txt
S3
CloudFront
FFmpeg
AWS MediaConvert
HLS
Multipart Uploads
Lifecycle Policies
```

### Database

```txt
PostgreSQL
PgBouncer
Read Replicas
Partitioning
Outbox Pattern
```

### Analytics

```txt
ClickHouse
```

### Cache

```txt
Redis Cluster
```

### Events

```txt
Kafka/Redpanda
```

### Search

```txt
Elasticsearch/vespa
```

### Notifications

```txt
Android:
FCM

iOS:
APNs
```

### Recommendation / Feed

```txt
Rust Feed Service
PostgreSQL
ClickHouse
Redis
Kafka/Redpanda
Future: ML Ranking Service
```

### Moderation

```txt
Admin Review Queue
Automated Media Scanning
Text Moderation
Image/Video Moderation
Abuse Reports
```

### Admin Panels

```txt
Next.js
TypeScript
React
Redux Toolkit
Radix UI
Tailwind CSS
shadcn/ui
```

### Infrastructure

```txt
Git
GitHub
OpenTofu
Docker
Kubernetes
Helm
Argo CD
HPA
KEDA
Karpenter
```

### Monitoring

```txt
Prometheus
Grafana
Loki
OpenTelemetry
Sentry
Amazon CloudWatch
SLOs
Alerts
Runbooks
```

### Hosting / AWS

```txt
EKS
EC2
Elastic Load Balancing
ECR
RDS PostgreSQL
ElastiCache Redis
S3
CloudFront
IAM
Secrets Manager
KMS
CloudWatch
```

### Cloudflare

```txt
DNS
CDN
WAF
DDoS Protection
Rate Limiting
SSL/TLS
Bot Protection
```


## Controls / Standards

### Auth Controls

```txt
OpenID Connect
JWT Access Tokens
Rotating Refresh Tokens
Device Sessions
Token Revocation
Risk-Based Abuse Detection
```

### Security Controls

```txt
Rate Limiting
IAM Least Privilege
Bot Detection
Abuse Detection
Content Moderation
Audit Logs
```

### Media Controls

```txt
Signed URLs
Signed Cookies
HLS Delivery
Upload Validation
Media Access Control
CDN Cache Control
```

### Operational Standards

```txt
SLOs
Alerts
Runbooks
Audit Logs
Incident Response
Backup Strategy
Disaster Recovery
```
