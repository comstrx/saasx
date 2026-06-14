<?php

namespace App\Services;
use App\Repositories\CommissionUserRepository;

class CommissionUserService extends BaseService {
  
    public function __construct(
        protected CommissionUserRepository $commissionUserRepository,
    ) { parent::__construct($commissionUserRepository); }

}
