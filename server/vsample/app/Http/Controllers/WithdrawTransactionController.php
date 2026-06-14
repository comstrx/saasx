<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\WithdrawTransactionService;

class WithdrawTransactionController extends Controller {

    public function __construct ( WithdrawTransactionService $withdrawTransactionService ) {

        parent::__construct($withdrawTransactionService);
        $this->applyScopes(strict: true);

    }

}
