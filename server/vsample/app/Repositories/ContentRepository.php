<?php

namespace App\Repositories;
use App\Models\Content;

class ContentRepository extends BaseRepository {

    public function __construct( Content $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'type'        => string(data_get($data, 'type') ?? 'page'),
            'key'         => string(data_get($data, 'key') ?? 'content'),
            'location'    => string(data_get($data, 'location') ?? 'free'),
            'page'        => string(data_get($data, 'page')),
            'sort'        => integer(data_get($data, 'sort')),
            'value'       => string(data_get($data, 'value')),
            'url'         => string(data_get($data, 'url')),
            'notes'       => string(data_get($data, 'notes')),
            'expires_at'  => string(data_get($data, 'expires_at')),
            'title'       => data_get($data, 'title'),
            'content'     => data_get($data, 'content'),
            'description' => data_get($data, 'description'),
        ];

    }

}
