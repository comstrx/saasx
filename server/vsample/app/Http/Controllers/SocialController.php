<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\SocialService;

class SocialController extends Controller {

    public function __construct ( protected SocialService $socialService ) {
        
        parent::__construct($socialService);
    
    }

}
