<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\GatewayService;

class GatewayController extends Controller {

    public function __construct ( protected GatewayService $gatewayService ) {
        
        parent::__construct($gatewayService);
        $this->applyScopes(strict: true);
    
    }
    public function deposit ( Request $req, int $id ) {

        return $this->gatewayService->deposit($id, $this->scopes, $req->all());

    }

}
