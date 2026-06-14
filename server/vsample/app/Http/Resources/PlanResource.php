<?php

namespace App\Http\Resources;

class PlanResource extends BaseResource {

    protected bool $hasImage = true, $hasPermissions = true;

    public function tiny ( $data ) {

        return [
            'name'                => $data->name,
            'description'         => $data->description,
            'features'            => $data->features,
            'free'                => $data->free,
            'recommended'         => $data->recommended,
            'basic'               => $data->basic,
            'popular'             => $data->popular,
            'premium'             => $data->premium,
            'currency'            => $data->currency,
            'max_subscriptions'   => $data->max_subscriptions,
            'monthly_old_price'   => $data->monthly_old_price,
            'yearly_old_price'    => $data->yearly_old_price,
            'lifetime_old_price'  => $data->lifetime_old_price,
            'monthly_new_price'   => $data->monthly_new_price,
            'yearly_new_price'    => $data->yearly_new_price,
            'lifetime_new_price'  => $data->lifetime_new_price,
            'monthly_trial_days'  => $data->monthly_trial_days,
            'yearly_trial_days'   => $data->yearly_trial_days,
            'lifetime_trial_days' => $data->lifetime_trial_days,
        ];

    }
    public function relations () {

        return [
            'subscriptions' => $this->subscriptionsCount(),
            'stores'        => $this->storesCount(),
        ];

    }

}
