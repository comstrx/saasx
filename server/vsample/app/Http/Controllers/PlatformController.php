<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\PlatformService;

class PlatformController extends Controller {

    public function __construct ( protected PlatformService $platformService ) {
        
        parent::__construct($platformService);
    
    }

}
