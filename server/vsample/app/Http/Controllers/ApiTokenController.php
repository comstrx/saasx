<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ApiTokenService;

class ApiTokenController extends Controller {

    public function __construct ( protected ApiTokenService $apiTokenService ) {
        
        parent::__construct($apiTokenService);
        $this->applyScopes(strict: true);
    
    }
    public function current ( Request $req ) {

        return $this->apiTokenService->current();
        
    }
    public function new ( Request $req ) {

        return $this->apiTokenService->new( $req->all() );
        
    }
    public function reset ( Request $req ) {

        return $this->apiTokenService->reset( $req->all() );
        
    }
    public function newAccessToken ( Request $req ) {

        return $this->apiTokenService->newAccessToken( $req->header() );
        
    }

}
