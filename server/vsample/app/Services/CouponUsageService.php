<?php

namespace App\Services;
use App\Repositories\CouponUsageRepository;

class CouponUsageService extends BaseService {
  
    public function __construct(
        protected CouponUsageRepository $couponUsageRepository,
    ) { parent::__construct($couponUsageRepository); }

}
