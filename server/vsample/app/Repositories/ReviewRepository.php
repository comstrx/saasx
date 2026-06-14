<?php

namespace App\Repositories;
use App\Models\Review;

class ReviewRepository extends BaseRepository {

    public function __construct( Review $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'user_id' => integer(data_get($data, 'user_id')),
            'title'   => string(data_get($data, 'title')),
            'content' => string(data_get($data, 'content')),
            'rating'  => float(data_get($data, 'rating')),
            'ip'      => ip(),
            'agent'   => agent(),
            ...$this->model->resolveRelated($data, forbidden: 'user_id'),
        ];

    }

}
