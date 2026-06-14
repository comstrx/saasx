<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\VerificationService;

class VerificationController extends Controller {

    public function __construct ( protected VerificationService $verificationService ) {
        
        parent::__construct($verificationService);
    
    }

}
