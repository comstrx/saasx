<?php

namespace App\Repositories;
use App\Models\Category;

class CategoryRepository extends BaseRepository {

    public function __construct( Category $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'  => integer($data['country_id']),
            'city_id'     => integer($data['city_id']),
            'category_id' => integer($data['category_id']),
            'phone'       => string($data['phone']),
            'notes'       => string($data['notes']),
            'name'        => $data['name'],
            'company'     => $data['company'],
            'location'    => $data['location'],
            'description' => $data['description'],
        ];

    }

}
