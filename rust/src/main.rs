//! The rust service of the saasx lab: a hit counter and price quotes, kept in redis.

use std::{
    env,
    net::SocketAddr,
    sync::{Arc, OnceLock},
    time::Duration,
};

use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use redis::{AsyncCommands, aio::ConnectionManager};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

type Failure = (StatusCode, Json<Value>);

#[derive(Clone)]
struct App {
    redis: Arc<OnceLock<ConnectionManager>>,
    prefix: String,
}

impl App {
    fn redis(&self) -> Result<ConnectionManager, Failure> {
        self.redis
            .get()
            .cloned()
            .ok_or_else(|| failure(StatusCode::SERVICE_UNAVAILABLE, "redis not ready"))
    }
}

#[derive(Deserialize)]
struct QuoteRequest {
    cents: i64,
    #[serde(default = "usd")]
    currency: String,
}

#[derive(Serialize)]
struct Quote {
    cents: i64,
    fee: i64,
    tax: i64,
    total: i64,
    currency: String,
}

fn usd() -> String {
    "USD".to_owned()
}

#[tokio::main]
async fn main() {
    let app = App {
        redis: Arc::new(OnceLock::new()),
        prefix: env::var("REDIS_KEY_PREFIX").unwrap_or_default(),
    };

    match env::var("REDIS_URL").map(redis::Client::open) {
        Ok(Ok(client)) => {
            tokio::spawn(connect(client, Arc::clone(&app.redis)));
        }
        Ok(Err(error)) => eprintln!("REDIS_URL is not a redis url: {error}"),
        Err(_) => eprintln!("REDIS_URL is not bound — the counter and the quotes stay dark"),
    }

    let router = Router::new()
        .route("/health", get(|| async { Json(json!({ "status": "ok" })) }))
        .route(
            "/mesh",
            get(|| async { Json(json!({ "service": "rust", "runtime": "rust", "calls": {} })) }),
        )
        .route("/counter", get(counter))
        .route("/quotes", post(quote))
        .route("/quotes/last", get(last))
        .with_state(app);

    let port = env::var("PORT")
        .ok()
        .and_then(|port| port.parse().ok())
        .unwrap_or(8080);
    let listener = tokio::net::TcpListener::bind(SocketAddr::from(([0, 0, 0, 0], port)))
        .await
        .expect("the port is taken");

    println!("rust listening on :{port}");

    axum::serve(listener, router)
        .with_graceful_shutdown(shutdown())
        .await
        .expect("the server failed");
}

/// Connect once redis answers — the port is open long before, the redis routes wait for it.
async fn connect(client: redis::Client, cell: Arc<OnceLock<ConnectionManager>>) {
    for attempt in 1u32.. {
        match ConnectionManager::new(client.clone()).await {
            Ok(manager) => {
                let _ = cell.set(manager);
                println!("redis ready after {attempt} attempt(s)");
                return;
            }
            Err(error) if attempt % 15 == 1 => eprintln!("redis not ready ({attempt}): {error}"),
            Err(_) => {}
        }

        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}

async fn shutdown() {
    let mut term = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        .expect("no SIGTERM handler");

    tokio::select! {
        _ = tokio::signal::ctrl_c() => {}
        _ = term.recv() => {}
    }
}

async fn counter(State(app): State<App>) -> Result<Json<Value>, Failure> {
    let mut redis = app.redis()?;
    let hits: i64 = redis
        .incr(format!("{}hits", app.prefix), 1)
        .await
        .map_err(internal)?;

    Ok(Json(json!({ "hits": hits })))
}

async fn quote(
    State(app): State<App>,
    Json(request): Json<QuoteRequest>,
) -> Result<(StatusCode, Json<Quote>), Failure> {
    if !(0..=1_000_000_000_000).contains(&request.cents) || request.currency.len() != 3 {
        return Err(failure(
            StatusCode::UNPROCESSABLE_ENTITY,
            "cents (0 to 10^12) and a three-letter currency are required",
        ));
    }

    let mut redis = app.redis()?;
    let fee = request.cents * 29 / 1000 + 30;
    let tax = request.cents * 14 / 100;

    let quote = Quote {
        cents: request.cents,
        fee,
        tax,
        total: request.cents + fee + tax,
        currency: request.currency.to_uppercase(),
    };

    let body = serde_json::to_string(&quote).map_err(internal)?;
    let _: () = redis
        .set(format!("{}quotes:last", app.prefix), body)
        .await
        .map_err(internal)?;

    Ok((StatusCode::CREATED, Json(quote)))
}

async fn last(State(app): State<App>) -> Result<Json<Value>, Failure> {
    let mut redis = app.redis()?;
    let raw: Option<String> = redis
        .get(format!("{}quotes:last", app.prefix))
        .await
        .map_err(internal)?;
    let raw = raw.ok_or_else(|| failure(StatusCode::NOT_FOUND, "no quote yet"))?;

    serde_json::from_str(&raw).map(Json).map_err(internal)
}

fn failure(status: StatusCode, error: &str) -> Failure {
    (status, Json(json!({ "error": error })))
}

fn internal<E: std::fmt::Display>(error: E) -> Failure {
    eprintln!("request failed: {error}");

    failure(StatusCode::INTERNAL_SERVER_ERROR, "internal error")
}
