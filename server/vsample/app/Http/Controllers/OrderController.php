<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\OrderService;

class OrderController extends Controller {

    public function __construct ( protected OrderService $orderService ) {
        
        parent::__construct($orderService);
        $this->applyScopes(strict: true);
    
    }
    public function pay ( Request $req, int $id ) {

        return $this->orderService->pay( $id, $req->all(), $this->scopes );

    }
    public function cancel ( Request $req, int $id ) {

        return $this->orderService->cancel( $id, $req->all(), $this->scopes );

    }
    public function ticket ( Request $req, int $id ) {

        return $this->orderService->ticket( $id, $req->all(), $this->scopes );

    }
    public function verify ( Request $req, int $id ) {

        return $this->orderService->verify( $id, $this->scopes );

    }
    public function confirm ( Request $req, int $id, string $code ) {

        return $this->orderService->confirm( $id, $this->scopes, $code );

    }

}
