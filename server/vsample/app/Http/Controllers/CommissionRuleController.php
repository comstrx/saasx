<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CommissionRuleService;

class CommissionRuleController extends Controller {

    public function __construct ( protected CommissionRuleService $commissionRuleService ) {
        
        parent::__construct($commissionRuleService);
    
    }

}
