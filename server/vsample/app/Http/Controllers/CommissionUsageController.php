<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CommissionUsageService;

class CommissionUsageController extends Controller {

    public function __construct ( protected CommissionUsageService $commissionUsageService ) {
        
        parent::__construct($commissionUsageService);
    
    }

}
