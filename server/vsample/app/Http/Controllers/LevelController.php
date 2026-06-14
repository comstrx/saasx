<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\LevelService;

class LevelController extends Controller {

    public function __construct ( protected LevelService $levelService ) {
        
        parent::__construct($levelService);
    
    }

}
