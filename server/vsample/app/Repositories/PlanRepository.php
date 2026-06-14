<?php

namespace App\Repositories;
use App\Models\Plan;

class PlanRepository extends BaseRepository {

    public function __construct( Plan $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'free'                => bool($data['free']),
            'recommended'         => bool($data['recommended']),
            'basic'               => bool($data['basic']),
            'popular'             => bool($data['popular']),
            'premium'             => bool($data['premium']),
            'monthly_old_price'   => float($data['monthly_old_price']),
            'yearly_old_price'    => float($data['yearly_old_price']),
            'lifetime_old_price'  => float($data['lifetime_old_price']),
            'monthly_new_price'   => float($data['monthly_new_price']),
            'yearly_new_price'    => float($data['yearly_new_price']),
            'lifetime_new_price'  => float($data['lifetime_new_price']),
            'monthly_trial_days'  => integer($data['monthly_trial_days']),
            'yearly_trial_days'   => integer($data['yearly_trial_days']),
            'lifetime_trial_days' => integer($data['lifetime_trial_days']),
            'max_subscriptions'   => integer($data['max_subscriptions']),
            'currency'            => string($data['currency']),
            'notes'               => string($data['notes']),
            'name'                => $data['name'],
            'description'         => $data['description'],
            'features'            => $data['features'],
        ];

    }
    public function price ( Plan $plan, string $duration = null ) {
        
        return $plan->free ? 0 : $plan->{"{$duration}_new_price"} ?? 0;
    
    }
    public function trialDays ( Plan $plan, string $duration = null ) {
        
        return $plan->free ? 0 : $plan->{"{$duration}_trial_days"} ?? 0;
    
    }
    public function validateDuration ( string $duration = null ) {
        
        return in_array($duration, ['monthly', 'yearly', 'lifetime']) ? $duration : null;
    
    }
    public function expiresDate ( string $duration, int $trialDays = 0 ) {

        return match ( $duration ) {
            'monthly' => now()->addMonths(1)->addDays($trialDays),
            'yearly' => now()->addYears(1)->addDays($trialDays),
            'lifetime' => now()->addYears(10)->addDays($trialDays),
            default => null,
        };

    }
    public function durationData ( string $duration, int $trialDays = 0 ) {

        return ['started_at' => now(), 'expires_at' => $this->expiresDate($duration, $trialDays)];

    }
    public function renewalData ( Plan $plan, string $duration, int $trialDays = 0 ) {

        if ( !$duration = $this->validateDuration($duration) ) return null;
       
        return [
            'duration' => $duration,
            'price' => $this->price($plan, $duration),
            ...$this->durationData($duration, $trialDays)
        ];

    }
    public function subscriptionData ( Plan $plan, string $type, array $payload = [] ) {

        $duration  = string($payload['duration'] ?? null);
        $autoRenew = bool($payload['auto_renew'] ?? true);
        $trialDays = $this->trialDays($plan, $duration);
        $renewal   = $this->renewalData($plan, $duration, $trialDays);

        if ( !$renewal || !$plan->isAvailable('max_subscriptions') ) return null;
       
        return [
            'type' => $type,
            'plan_id' => $plan->id,
            'auto_renew' => $autoRenew,
            'trial_days' => $trialDays,
            ...$renewal,
        ];

    }

}
