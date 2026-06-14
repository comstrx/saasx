<?php

namespace App\Repositories;
use App\Models\Reset;

class ResetRepository extends BaseRepository {

    public function __construct( Reset $model ) { parent::__construct($model); }

    public function newToken ( array $data = [] ) {

        $record = parent::updateOrCreate(['user_id' => $data['user_id'] ?? 0], ['token' => str()->random(64)]);
        return $record->token;

    }
    public function findByName ( string $token ) {

        return parent::query()->where('token', $token)->first();

    }

}
