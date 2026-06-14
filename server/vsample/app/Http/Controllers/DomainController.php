<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\DomainService;

class DomainController extends Controller {

    public function __construct ( protected DomainService $domainService ) {
        
        parent::__construct($domainService);
    
    }

}
