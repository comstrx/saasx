<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class StatsController extends Controller
{
    /**
     * One number from every store in the platform — each service reads its own, laravel only asks.
     */
    public function __invoke(): array
    {
        $mesh = config('services.mesh');

        $asks = array_filter([
            'go' => $mesh['go'] ? $mesh['go'].'/items' : null,
            'rust' => $mesh['rust'] ? $mesh['rust'].'/counter' : null,
            'node' => $mesh['node'] ? $mesh['node'].'/stock' : null,
            'python' => $mesh['python'] ? $mesh['python'].'/reports' : null,
        ]);

        $responses = Http::pool(fn (Pool $pool) => array_map(
            fn (string $name) => $pool->as($name)->timeout(5)->get($asks[$name]),
            array_keys($asks),
        ));

        return [
            'laravel' => ['notes' => Note::count(), 'indexed' => (int) Cache::get('notes:indexed', 0)],
            ...array_map(fn ($response) => MeshController::answer($response), $responses),
        ];
    }
}
