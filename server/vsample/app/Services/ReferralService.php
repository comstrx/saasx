<?php

namespace App\Services;
use App\Repositories\ReferralRepository;

class ReferralService extends BaseService {
   
    public function __construct(
        protected ReferralRepository $referralRepository
    ) { parent::__construct($referralRepository); }

}
