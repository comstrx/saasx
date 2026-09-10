<?php

use App\Http\Controllers\MeshController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', fn () => ['service' => 'laravel', 'runtime' => 'laravel', 'time' => now()->toIso8601String()]);
Route::get('/mesh', MeshController::class);
Route::get('/stats', StatsController::class);
Route::post('/notes', [NoteController::class, 'store']);
Route::get('/notes/{note}', [NoteController::class, 'show']);
