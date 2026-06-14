<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CountryService;

class CountryController extends Controller {

    public function __construct ( protected CountryService $countryService ) {
        
        parent::__construct($countryService);
    
    }

}
