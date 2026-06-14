<?php

namespace App\Repositories;
use App\Models\Verification;
use App\Models\User;

class VerificationRepository extends BaseRepository {

    public function __construct( Verification $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {
        
        $data = optional($data);

        return [
            'user_id'    => integer($data['user_id']),
            'type'       => string($data['type']),
            'over'       => string($data['over']),
            'code'       => $this->generateCode(),
            'expires_at' => now()->addMinutes(5),
            'ip'         => ip(),
            'agent'      => agent(),
            'attempts'   => 0,
        ];

    }
    public function generateCode () {

        do { $code = random_int(100000, 999999); }
        while ( parent::query()->where('code', $code)->exists() );
        return $code;

    }
    public function newVerification ( User $user, string $type = null, string $over = null ) {

        $data = ['user_id' => $user->id, 'type' => $type, 'over' => $over, 'verified' => false];
        return parent::updateOrCreate($data, $this->fields($data));

    }
    public function findByType ( string $type = null ) {
        
        return parent::query()
            ->where('verified', false)
            ->when($type, fn($q) => $q->where('type', $type))
            ->active()->latest()->first();

    }
    public function verified ( Verification $verification ) {

        $verification->update(['verified' => true, 'verified_at' => utc_date()]);
        return $verification;

    }
    public function regenerate ( Verification $verification ) {

        $verification->increment('attempts');
        if ( $verification->attempts < 3 ) return;

        $verification->update(['code' => $this->generateCode(), 'attempts' => 0, 'expires_at' => now()->addMinutes(5)]);

    }
    public function confirm ( string $code, string $type = null ) {

        $verification = $this->findByType($type);
        $isValid = $verification && $verification->code === $code && $verification->isAvailable() && $verification->attempts < 3;
     
        if ( $isValid ) return $this->verified($verification);
        if ( !$verification ) return null;
       
        $this->regenerate($verification);
       
    }

}
