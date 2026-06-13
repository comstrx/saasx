use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde_json::json;

#[get("/health")]
async fn health() -> impl Responder {

    HttpResponse::Ok().json(json!({ "status": "ok" }))

}

#[get("/v1/categories")]
async fn categories() -> impl Responder {

    HttpResponse::Ok().json(json!({
        "data": [
            { "id": "0197a001-0000-7000-8000-000000000001", "name": "Electronics", "slug": "electronics" },
            { "id": "0197a001-0000-7000-8000-000000000002", "name": "Books", "slug": "books" },
        ],
        "meta": { "total": 2 }
    }))

}

#[get("/v1/categories/{id}")]
async fn category(path: web::Path<String>) -> impl Responder {

    let id = path.into_inner();

    HttpResponse::Ok().json(json!({
        "data": { "id": id, "name": "Electronics", "slug": "electronics" }
    }))

}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    println!("engine listening on http://127.0.0.1:8000");

    HttpServer::new(|| {

        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE"])
            .allowed_headers(vec![
                "accept",
                "accept-language",
                "authorization",
                "content-type",
                "idempotency-key",
                "x-currency",
                "x-timezone",
            ])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(health)
            .service(categories)
            .service(category)

    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await

}
