<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ResetService;

class ResetController extends Controller {

    public function __construct ( protected ResetService $resetService ) {
        
        parent::__construct($resetService);
    
    }

}
