<?php

namespace App\Repositories;
use App\Models\CommissionTarget;

class CommissionTargetRepository extends BaseRepository {

    public function __construct( CommissionTarget $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'commission_id' => integer($data['commission_id']),
            'related_type'  => $this->model->getModelClass(string($data['related_name'])),
            'related_id'    => integer($data['related_id']),
            'expires_at'    => string($data['expires_at']),
        ];

    }

}
