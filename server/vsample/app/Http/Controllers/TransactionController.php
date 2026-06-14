<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\TransactionService;

class TransactionController extends Controller {

    public function __construct ( protected TransactionService $transactionService ) {
        
        parent::__construct($transactionService);
        $this->applyScopes(strict: true);
    
    }
    public function refund ( Request $req, int $id ) {

        return $this->transactionService->refund($id, $req->all(), $this->scopes);

    }

}
