<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CouponUsageService;

class CouponUsageController extends Controller {

    public function __construct ( protected CouponUsageService $couponUsageService ) {
        
        parent::__construct($couponUsageService);
        $this->applyScopes(strict: true);
    
    }

}
