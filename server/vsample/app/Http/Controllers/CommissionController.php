<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\CommissionRequest;
use App\Services\CommissionService;

class CommissionController extends Controller {

    public function requestForm () { return CommissionRequest::class; }

    public function __construct ( protected CommissionService $commissionService ) {
        
        parent::__construct($commissionService);
    
    }

}
