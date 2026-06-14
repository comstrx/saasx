<?php

namespace App\Repositories;
use App\Models\Product;

class ProductRepository extends BaseRepository {

    public function __construct( Product $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'      => integer($data['country_id']),
            'city_id'         => integer($data['city_id']),
            'category_id'     => integer($data['category_id']),
            'game_id'         => integer($data['game_id']),
            'platform_id'     => integer($data['platform_id']),
            'region_id'       => integer($data['region_id']),
            'max_quantity'    => integer($data['max_quantity']),
            'old_price'       => float($data['old_price']),
            'new_price'       => float($data['new_price']),
            'margin_price'    => float($data['margin_price']),
            'cancel_cost'     => float($data['cancel_cost']),
            'cancel_before'   => string($data['cancel_before']),
            'refund_before'   => string($data['refund_before']),
            'phone'           => string($data['phone']),
            'language'        => string($data['language']),
            'gender'          => string($data['gender']),
            'notes'           => string($data['notes']),
            'delivery_method' => string($data['delivery_method']),
            'name'            => $data['name'],
            'company'         => $data['company'],
            'location'        => $data['location'],
            'description'     => $data['description'],
            'details'         => $data['details'],
            'instructions'    => $data['instructions'],
            'includes'        => $data['includes'],
            'policy'          => $data['policy'],
            'upgrades'        => $data['upgrades'],
        ];

    }

}
