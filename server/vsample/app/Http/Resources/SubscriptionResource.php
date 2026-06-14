<?php

namespace App\Http\Resources;

class SubscriptionResource extends BaseResource {

    public function tiny ( $data ) {

        return [
            'type'       => $data->type,
            'price'      => $data->price,
            'duration'   => $data->duration,
            'trial_days' => $data->trial_days,
            'auto_renew' => $data->auto_renew,
            'plan_id'    => $data->plan_id,
            'started_at' => $data->formatDate('started_at'),
            'expires_at' => $data->formatDate('expires_at'),
            'is_expired' => $data->isExpired(),
        ];

    }
    public function relations () {

        return [
            'plan'  => PlanResource::info( $this->plan ),
            'store' => StoreResource::info( $this->store ),
        ];

    }

}
