<?php

namespace App\Repositories;
use App\Models\Country;

class CountryRepository extends BaseRepository {

    public function __construct( Country $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'iso'         => string($data['iso']),
            'code'        => string($data['code']),
            'notes'       => string($data['notes']),
            'name'        => $data['name'],
            'description' => $data['description'],
        ];

    }

}
