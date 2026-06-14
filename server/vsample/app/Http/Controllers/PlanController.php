<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\PlanService;

class PlanController extends Controller {

    public function __construct ( protected PlanService $planService ) {
        
        parent::__construct($planService);
    
    }

}
