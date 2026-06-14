<?php

namespace App\Services;
use App\Repositories\VerificationRepository;
use App\Models\User;

class VerificationService extends BaseService {

    public function __construct(
        protected VerificationRepository $verificationRepository
    ) { parent::__construct($verificationRepository); }

    public function verify ( User $user, string $type = null, string $over = null ) {
     
        $verification = $this->verificationRepository->newVerification($user, $type, $over);
        
        return match ( $over ) {
            'email' => send_email($user, $verification->code, 'otp'),
            'whatsapp' => send_whatsapp($user, $verification->code),
            default => send_sms($user, $verification->code),
        };

    }
    public function confirm ( string $code, string $type = null ) {

        return $this->verificationRepository->confirm($code, $type);

    }

}
