<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\CouponRequest;
use App\Services\CouponService;

class CouponController extends Controller {

    public function requestForm () { return CouponRequest::class; }

    public function __construct ( protected CouponService $couponService ) {
        
        parent::__construct($couponService);
    
    }
    public function available ( Request $req ) {

        $this->applyScopes(['type' => 'public']);
        return $this->couponService->index( $req->all(), $this->scopes );

    }
    public function validate ( Request $req, int|string $coupon ) {

        return $this->couponService->validate( $coupon, $req->all() );

    }
    public function redeem ( Request $req, int|string $coupon ) {

        return $this->couponService->redeem( $coupon, $req->all() );

    }

}
