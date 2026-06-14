<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\RegionService;

class RegionController extends Controller {

    public function __construct ( protected RegionService $regionService ) {
        
        parent::__construct($regionService);
    
    }

}
