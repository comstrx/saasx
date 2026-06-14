<?php

namespace App\Repositories;
use App\Models\Report;

class ReportRepository extends BaseRepository {

    public function __construct( Report $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'user_id' => integer(data_get($data, 'user_id')),
            'title'   => string(data_get($data, 'title')),
            'content' => string(data_get($data, 'content')),
            'reason'  => string(data_get($data, 'reason')),
            'ip'      => ip(),
            'agent'   => agent(),
            ...$this->model->resolveRelated($data, forbidden: 'user_id'),
        ];

    }
    
}
