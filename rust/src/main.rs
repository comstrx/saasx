//! The rust service of the saasx lab: a hit counter and price quotes, kept in redis.

use std::{env, net::SocketAddr, time::Duration};

use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use redis::{AsyncCommands, aio::ConnectionManager};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Clone)]
struct App {
    redis: ConnectionManager,
    prefix: String,
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
    let url = env::var("REDIS_URL").expect("REDIS_URL is bound by infrax");
    let client = redis::Client::open(url).expect("REDIS_URL is not a redis url");

    let app = App {
        redis: connect(client).await,
        prefix: env::var("REDIS_KEY_PREFIX").unwrap_or_default(),
    };

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

async fn connect(client: redis::Client) -> ConnectionManager {
    for attempt in 1..=30 {
        match ConnectionManager::new(client.clone()).await {
            Ok(manager) => return manager,
            Err(error) => eprintln!("redis not ready ({attempt}): {error}"),
        }

        tokio::time::sleep(Duration::from_secs(2)).await;
    }

    panic!("redis never answered");
}

async fn shutdown() {
    let mut term = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        .expect("no SIGTERM handler");

    tokio::select! {
        _ = tokio::signal::ctrl_c() => {}
        _ = term.recv() => {}
    }
}

async fn counter(State(mut app): State<App>) -> Result<Json<Value>, StatusCode> {
    let hits: i64 = app
        .redis
        .incr(format!("{}hits", app.prefix), 1)
        .await
        .map_err(internal)?;

    Ok(Json(json!({ "hits": hits })))
}

async fn quote(
    State(mut app): State<App>,
    Json(request): Json<QuoteRequest>,
) -> Result<(StatusCode, Json<Quote>), StatusCode> {
    if !(0..=1_000_000_000_000).contains(&request.cents) || request.currency.len() != 3 {
        return Err(StatusCode::UNPROCESSABLE_ENTITY);
    }

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
    let _: () = app
        .redis
        .set(format!("{}quotes:last", app.prefix), body)
        .await
        .map_err(internal)?;

    Ok((StatusCode::CREATED, Json(quote)))
}

async fn last(State(mut app): State<App>) -> Result<Json<Value>, StatusCode> {
    let raw: Option<String> = app
        .redis
        .get(format!("{}quotes:last", app.prefix))
        .await
        .map_err(internal)?;
    let raw = raw.ok_or(StatusCode::NOT_FOUND)?;

    serde_json::from_str(&raw).map(Json).map_err(internal)
}

fn internal<E: std::fmt::Display>(error: E) -> StatusCode {
    eprintln!("request failed: {error}");

    StatusCode::INTERNAL_SERVER_ERROR
}
