<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CouponUserService;

class CouponUserController extends Controller {

    public function __construct ( protected CouponUserService $couponUserService ) {
        
        parent::__construct($couponUserService);
        $this->applyScopes(strict: true);
    
    }

}
