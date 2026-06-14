<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CityService;

class CityController extends Controller {

    public function __construct ( protected CityService $cityService ) {
        
        parent::__construct($cityService);
    
    }

}
