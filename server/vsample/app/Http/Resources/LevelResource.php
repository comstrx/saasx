<?php

namespace App\Http\Resources;

class LevelResource extends BaseResource {

    protected bool $hasImage = true;
    
    public function tiny ( $data ) {

        return [
            'rank' => $data->rank,
            'name' => $data->name,
        ];

    }
    public function data () {

        return [
            'color'         => $this->color,
            'type'          => $this->type,
            'conditions'    => $this->conditions,
            'description'   => $this->description,
            'cashback_type' => $this->cashback_type,
            'cashback'      => $this->cashback,
            'max_cashback'  => $this->max_cashback,
            'min_points'    => $this->min_points,
            'min_orders'    => $this->min_orders,
            'min_deposits'  => $this->min_deposits,
            'min_referrals' => $this->min_referrals,
        ];

    }
    public function relations () {

        return [
            'features' => LevelFeatureResource::collectionInfo( $this->levelFeatures ),
        ];

    }

}
