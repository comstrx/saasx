<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CommissionUserService;

class CommissionUserController extends Controller {

    public function __construct ( protected CommissionUserService $commissionUserService ) {
        
        parent::__construct($commissionUserService);
    
    }

}
