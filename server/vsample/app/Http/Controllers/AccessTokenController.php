<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\AccessTokenService;

class AccessTokenController {

    public bool $global_route = false;

    public function __construct ( protected AccessTokenService $accessTokenService ) {}
    
    public function index ( Request $req ) {

        return $this->accessTokenService->index( $req->all() );

    }
    public function show ( Request $req, int $id ) {

        return $this->accessTokenService->show( $id );
        
    }
    public function delete ( Request $req, int $id ) {

        return $this->accessTokenService->delete( $id );
        
    }
    public function deleteBatch ( Request $req ) {

        return $this->accessTokenService->deleteBatch( parse($req->ids) );
        
    }
    public function deleteCurrent ( Request $req ) {

        return $this->accessTokenService->deleteCurrentToken();

    }
    public function deleteOthers ( Request $req ) {

        return $this->accessTokenService->deleteOtherTokens();

    }

}
