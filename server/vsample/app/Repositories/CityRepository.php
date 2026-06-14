<?php

namespace App\Repositories;
use App\Models\City;

class CityRepository extends BaseRepository {

    public function __construct( City $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'  => integer($data['country_id']),
            'code'        => string($data['code']),
            'notes'       => string($data['notes']),
            'name'        => $data['name'],
            'description' => $data['description'],
        ];

    }

}
