<?php

namespace App\Repositories;
use App\Models\Referral;
use App\Models\User;

class ReferralRepository extends BaseRepository {

    public function __construct( Referral $model ) { parent::__construct($model); }

    public function newReferral ( User $referred, User $referrer = null ) {

        if ( !$referrer?->has('allow_referrals') || $referrer->id === $referred->id ) return;
      
        $record = parent::firstOrCreate(['referrer_id' => $referrer->id, 'referred_id' => $referred->id]);
        $this->model->deleteCacheTag();

        return $record;
        
    }
    public function findReferrer ( User $user ) {

        $referral = $this->findBy('referred_id', $user->id);
        return $referral?->isAvailable() ? $referral->referrer : null;

    }

}
