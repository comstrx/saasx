<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MeshTest extends TestCase
{
    public function test_the_mesh_asks_every_callee_by_name(): void
    {
        config(['services.mesh' => ['go' => 'http://go:8080', 'rust' => 'http://rust:8080', 'node' => null, 'python' => 'http://python:8080']]);

        Http::fake([
            'go:8080/mesh' => Http::response(['service' => 'go', 'calls' => ['rust' => ['service' => 'rust']]]),
            'rust:8080/mesh' => Http::response(['service' => 'rust', 'calls' => []]),
            'python:8080/mesh' => Http::response('down', 503),
        ]);

        $this->getJson('/api/mesh')
            ->assertOk()
            ->assertJsonPath('service', 'laravel')
            ->assertJsonPath('calls.go.calls.rust.service', 'rust')
            ->assertJsonPath('calls.rust.service', 'rust')
            ->assertJsonPath('calls.python.error', 'no json answer')
            ->assertJsonMissingPath('calls.node');
    }

    public function test_ping_names_the_service(): void
    {
        $this->getJson('/api/ping')->assertOk()->assertJsonPath('service', 'laravel');
    }
}
