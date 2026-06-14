<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\WalletService;

class WalletController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected WalletService $walletService ) {

        parent::__construct($walletService);
        $this->applyScopes(strict: true);
    
    }
    public function balance ( Request $req ) {

        return $this->walletService->balance( $req->route('field') );

    }
    public function increment ( Request $req ) {

        return $this->walletService->increment( float($req->amount), string($req->balance) );

    }
    public function decrement ( Request $req ) {

        return $this->walletService->decrement( float($req->amount), string($req->balance) );

    }
    public function suspend ( Request $req ) {

        return $this->walletService->suspend( float($req->amount) );

    }
    public function release ( Request $req ) {

        return $this->walletService->release( float($req->amount) );

    }
    public function freeze ( Request $req ) {

        return $this->walletService->freeze();

    }
    public function unfreeze ( Request $req ) {

        return $this->walletService->unfreeze();

    }
    public function reset ( Request $req ) {

        return $this->walletService->reset();

    }

}
