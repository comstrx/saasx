<?php

namespace App\Repositories;
use App\Models\GiftCodeUsage;

class GiftCodeUsageRepository extends BaseRepository {

    public function __construct( GiftCodeUsage $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'gift_code_id' => integer($data['gift_code_id']),
            'product_id'   => integer($data['product_id']),
            'user_id'      => integer($data['user_id']),
        ];

    }

}
