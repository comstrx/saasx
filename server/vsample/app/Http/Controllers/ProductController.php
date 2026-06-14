<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ProductService;

class ProductController extends Controller {

    public function __construct ( protected ProductService $productService ) {
        
        parent::__construct($productService);
    
    }
    public function cart ( Request $req, int $id ) {

        return $this->productService->cart( $id, $this->scopes );

    }
    public function discart ( Request $req, int $id ) {

        return $this->productService->discart( $id, $this->scopes );

    }
    public function order ( Request $req, int $id ) {

        return $this->productService->order( $id, $this->scopes );

    }
    public function coupon ( Request $req, int $id, int|string $coupon ) {

        return $this->productService->coupon( $id, $coupon, $req->all(), $this->scopes );

    }
    public function checkout ( Request $req, int $id ) {

        return $this->productService->checkout( $id, $req->all(), $this->scopes );
        
    }

}
