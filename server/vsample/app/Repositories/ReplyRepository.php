<?php

namespace App\Repositories;
use App\Models\Reply;

class ReplyRepository extends BaseRepository {

    public function __construct( Reply $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'user_id' => integer(data_get($data, 'user_id')),
            'title'   => string(data_get($data, 'title')),
            'content' => string(data_get($data, 'content')),
            'ip'      => ip(),
            'agent'   => agent(),
            ...$this->model->resolveRelated($data, forbidden: 'user_id'),
        ];

    }

}
