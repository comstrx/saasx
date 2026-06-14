<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Services\AccountService;
use App\Services\AuthService;

class AccountController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected AccountService $accountService, protected AuthService $authService ) {
        
        parent::__construct($accountService);
    
    }
    public function index ( Request $req ) {

        return $this->accountService->getResource();

    }
    public function info ( Request $req ) {

        return $this->accountService->info();
        
    }
    public function getField ( Request $req, string $field = null ) {

        return $this->accountService->getField($field);
        
    }
    public function updateField ( UserRequest $req, string $field = null ) {

        return $this->accountService->updateField( $field, $req->all() );

    }
    public function updateAdmin ( Request $req, string $field = null ) {
        
        return is_admin() ? parent::update($req, user_id(), $field) : permissionFailed();

    }
    public function changeImage ( UserRequest $req ) {

        return $this->accountService->changeImage( $req->file('image') ?? collect($req->allFiles())->first() );

    }
    public function resetImage ( Request $req ) {

        return $this->accountService->resetImage();

    }
    public function attachSocial ( Request $req ) {

        return $this->accountService->attachSocial($req->all());

    }
    public function unattachSocial ( Request $req, string $provider = null ) {

        return $this->accountService->unattachSocial($provider);

    }
    public function unlock ( UserRequest $req ) {

        return $this->authService->unlock( $req->all() );

    }
    public function logout ( Request $req ) {

        return $this->authService->logout();

    }
    public function logoutAll ( Request $req ) {

        return $this->authService->logoutAll();

    }
    public function logoutOthers ( Request $req ) {

        return $this->authService->logoutOthers();

    }

}
