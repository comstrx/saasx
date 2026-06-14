<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\LikeService;

class LikeController extends Controller {

    public function __construct ( protected LikeService $likeService ) {
        
        parent::__construct($likeService);
    
    }

}
