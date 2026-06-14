<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CartService;

class CartController extends Controller {

    public function __construct ( protected CartService $cartService ) {
        
        parent::__construct($cartService);
        $this->applyScopes(strict: true);
    
    }
    public function increment ( Request $req, int $id ) {

        return $this->cartService->increment( $id, $req->all(), $this->scopes );

    }
    public function decrement ( Request $req, int $id ) {

        return $this->cartService->decrement( $id, $req->all(), $this->scopes );

    }
    public function coupon ( Request $req, int $id, int|string $coupon ) {

        return $this->cartService->coupon( $id, $coupon, $this->scopes );

    }
    public function checkout ( Request $req, int $id ) {

        return $this->cartService->checkout( $id, $req->all(), $this->scopes );
        
    }
    public function checkoutAll ( Request $req ) {

        return $this->cartService->checkoutAll( $req->all(), $this->scopes );
        
    }

}
