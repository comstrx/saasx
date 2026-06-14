<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ViewService;

class ViewController extends Controller {

    public function __construct ( protected ViewService $viewService ) {
        
        parent::__construct($viewService);
    
    }

}
