<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\WithdrawMethodService;

class WithdrawMethodController extends Controller {

    public function __construct ( protected WithdrawMethodService $withdrawMethodService ) {

        parent::__construct($withdrawMethodService);
        $this->applyScopes(strict: true);

    }
    public function withdraw ( Request $req, int $id ) {

        return $this->withdrawMethodService->withdraw($id, $this->scopes, $req->all());

    }
    
}
