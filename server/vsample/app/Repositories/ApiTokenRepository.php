<?php

namespace App\Repositories;
use App\Models\ApiToken;

class ApiTokenRepository extends BaseRepository {

    public function __construct( ApiToken $model ) { parent::__construct($model); }

    public function findByHeader ( string $header = null ) {

        if ( !$header || !str_starts_with($header, 'Basic ') ) return null;

        $decoded = base64_decode(substr($header, 6), true);
        if ( !$decoded || !str_contains($decoded, ':') ) return null;

        [$api_key, $secret_key] = array_map('trim', explode(':', $decoded, 2));

        $token = $this->query()->where(['key' => $api_key, 'secret' => $secret_key])->active()->first();
        return $token?->isAvailable() ? $token : null;

    }
    public function findByKey ( string $apiKey ) {

        $token = $this->query()->where('key', $apiKey)->active()->first();
        return $token?->isAvailable() ? $token : null;

    }
    public function findUser ( string $apiKey = null, string $header = null ) {

        return $header ? $this->findByHeader($header)?->user : $this->findByKey($apiKey)?->user;

    }

}
