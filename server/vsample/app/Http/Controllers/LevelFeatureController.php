<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\LevelFeatureService;

class LevelFeatureController extends Controller {

    public function __construct ( protected LevelFeatureService $levelFeatureService ) {
        
        parent::__construct($levelFeatureService);
    
    }

}
