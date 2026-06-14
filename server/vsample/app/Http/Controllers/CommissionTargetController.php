<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CommissionTargetService;

class CommissionTargetController extends Controller {

    public function __construct ( protected CommissionTargetService $commissionTargetService ) {
        
        parent::__construct($commissionTargetService);
    
    }

}
