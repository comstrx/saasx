<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\LogService;

class LogController extends Controller {

    public function __construct ( protected LogService $logService ) {
        
        parent::__construct($logService);
    
    }

}
