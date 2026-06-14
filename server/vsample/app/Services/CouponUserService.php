<?php

namespace App\Services;
use App\Repositories\CouponUserRepository;

class CouponUserService extends BaseService {
  
    public function __construct(
        protected CouponUserRepository $couponUserRepository,
    ) { parent::__construct($couponUserRepository); }

}
