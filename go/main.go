// Package main is the go service of the saasx lab: a catalog of items in its own postgresql database.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const schema = `CREATE TABLE IF NOT EXISTS items (
	id         BIGSERIAL   PRIMARY KEY,
	name       TEXT        NOT NULL,
	price      BIGINT      NOT NULL CHECK (price >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`

type item struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Price     int64     `json:"price"`
	CreatedAt time.Time `json:"created_at"`
}

type app struct {
	db     *pgxpool.Pool
	client *http.Client
	rust   string
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		slog.Error("database unreachable", "err", err)
		os.Exit(1)
	}
	defer db.Close()

	a := &app{db: db, client: &http.Client{Timeout: 5 * time.Second}, rust: os.Getenv("SERVICE_RUST_URL")}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /mesh", a.mesh)
	mux.HandleFunc("GET /items", a.list)
	mux.HandleFunc("POST /items", a.create)
	mux.HandleFunc("GET /items/{id}", a.show)

	srv := &http.Server{Addr: ":" + env("PORT", "8080"), Handler: mux, ReadHeaderTimeout: 5 * time.Second}

	go func() {
		<-ctx.Done()

		shutdown, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		_ = srv.Shutdown(shutdown)
	}()

	slog.Info("go listening", "addr", srv.Addr)

	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Error("server failed", "err", err)
		os.Exit(1)
	}
}

func connect(ctx context.Context, url string) (*pgxpool.Pool, error) {
	db, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}

	for attempt := 1; ; attempt++ {
		if _, err = db.Exec(ctx, schema); err == nil || attempt == 30 {
			break
		}

		slog.Warn("database not ready", "attempt", attempt, "err", err)

		select {
		case <-ctx.Done():
			db.Close()
			return nil, ctx.Err()
		case <-time.After(2 * time.Second):
		}
	}

	if err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}

func (a *app) health(w http.ResponseWriter, _ *http.Request) {
	reply(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *app) mesh(w http.ResponseWriter, r *http.Request) {
	reply(w, http.StatusOK, map[string]any{
		"service": "go",
		"runtime": "go",
		"calls":   map[string]any{"rust": a.call(r.Context(), a.rust+"/mesh")},
	})
}

func (a *app) call(ctx context.Context, url string) any {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return map[string]string{"error": err.Error()}
	}

	res, err := a.client.Do(req)
	if err != nil {
		return map[string]string{"error": err.Error()}
	}
	defer res.Body.Close()

	var body any

	if err := json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(&body); err != nil {
		return map[string]string{"error": fmt.Sprintf("%s answered %d without json", url, res.StatusCode)}
	}

	return body
}

func (a *app) list(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `SELECT id, name, price, created_at FROM items ORDER BY id DESC LIMIT 100`)
	if err != nil {
		fail(w, err)
		return
	}

	items, err := pgx.CollectRows(rows, pgx.RowToStructByPos[item])
	if err != nil {
		fail(w, err)
		return
	}

	reply(w, http.StatusOK, map[string]any{"items": items, "count": len(items)})
}

func (a *app) create(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Name  string `json:"name"`
		Price int64  `json:"price"`
	}

	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<16)).Decode(&in); err != nil || in.Name == "" || len(in.Name) > 200 || in.Price < 0 {
		reply(w, http.StatusUnprocessableEntity, map[string]string{"error": "name (1-200 chars) and price (>= 0) are required"})
		return
	}

	var it item

	err := a.db.QueryRow(r.Context(), `INSERT INTO items (name, price) VALUES ($1, $2) RETURNING id, name, price, created_at`, in.Name, in.Price).
		Scan(&it.ID, &it.Name, &it.Price, &it.CreatedAt)
	if err != nil {
		fail(w, err)
		return
	}

	reply(w, http.StatusCreated, it)
}

func (a *app) show(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		reply(w, http.StatusNotFound, map[string]string{"error": "no such item"})
		return
	}

	var it item

	err = a.db.QueryRow(r.Context(), `SELECT id, name, price, created_at FROM items WHERE id = $1`, id).
		Scan(&it.ID, &it.Name, &it.Price, &it.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		reply(w, http.StatusNotFound, map[string]string{"error": "no such item"})
		return
	}
	if err != nil {
		fail(w, err)
		return
	}

	reply(w, http.StatusOK, it)
}

func reply(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(body)
}

func fail(w http.ResponseWriter, err error) {
	slog.Error("request failed", "err", err)
	reply(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
