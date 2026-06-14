<?php

namespace App\Repositories;
use App\Models\Commission;

class CommissionRepository extends BaseRepository {

    public function __construct( Commission $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'  => integer($data['country_id']),
            'city_id'     => integer($data['city_id']),
            'category_id' => integer($data['category_id']),
            'game_id'     => integer($data['game_id']),
            'product_id'  => integer($data['product_id']),
            'coupon_id'   => integer($data['coupon_id']),
            'priority'    => integer($data['priority']),
            'role'        => string($data['role'] ?? 'client'),
            'type'        => string($data['type'] ?? 'points'),
            'amount_type' => string($data['amount_type'] ?? 'percentage'),
            'amount'      => float($data['amount']),
            'amount_cap'  => float($data['amount_cap']),
            'max_price'   => float($data['max_price']),
            'min_price'   => float($data['min_price']),
            'min_orders'  => integer($data['min_orders']),
            'min_level'   => integer($data['min_level']),
            'expires_at'  => string($data['expires_at']),
            'name'        => string($data['name']),
            'description' => string($data['description']),
            'notes'       => string($data['notes']),
            'conditions'  => $data['conditions'],
        ];

    }

}
