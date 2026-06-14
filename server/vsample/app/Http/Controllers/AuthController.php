<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\AuthRequest;
use App\Services\AuthService;

class AuthController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected AuthService $authService ) {
        
        parent::__construct($authService);
    
    }
    public function register ( AuthRequest $req ) {

        return $this->authService->register( 'client', $req->all() );

    }
    public function login ( AuthRequest $req ) {

        return $this->authService->login( 'client', $req->all() );

    }
    public function adminLogin ( AuthRequest $req ) {

        return $this->authService->login( 'admin', $req->all(), verify: false );

    }
    public function socialLogin ( AuthRequest $req ) {

        return $this->authService->socialLogin( 'client', $req->all() );

    }
    public function confirmCode ( Request $req, string $code ) {

        return $this->authService->confirmCode( 'client', $code );

    }
    public function recoveryAccount ( Request $req, string $email ) {

        return $this->authService->recoveryAccount( 'client', $email );

    }
    public function resetPassword ( AuthRequest $req, string $token ) {

        return $this->authService->resetPassword( 'client', $token, $req->password );

    }
    public function checkEmail ( Request $req, string $email ) {

        return $this->authService->checkEmail( $email );

    }
    public function checkResetToken ( Request $req, string $token ) {

        return $this->authService->checkResetToken( $token );

    }

}
