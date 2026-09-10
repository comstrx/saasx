<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class MeshController extends Controller
{
    /**
     * Ask every service laravel calls for its own mesh — each answers with the services it calls in turn.
     */
    public function __invoke(): array
    {
        $callees = array_filter(config('services.mesh'));

        $responses = Http::pool(fn (Pool $pool) => array_map(
            fn (string $name) => $pool->as($name)->timeout(5)->get($callees[$name].'/mesh'),
            array_keys($callees),
        ));

        return [
            'service' => 'laravel',
            'runtime' => 'laravel',
            'calls' => array_map(fn ($response) => self::answer($response), $responses),
        ];
    }

    public static function answer(mixed $response): array
    {
        if ($response instanceof ConnectionException) {
            return ['error' => $response->getMessage()];
        }

        if (! $response instanceof Response || ! is_array($response->json())) {
            return ['error' => 'no json answer'];
        }

        return $response->json();
    }
}
