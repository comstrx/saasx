<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ReviewService;

class ReviewController extends Controller {

    public function __construct ( protected ReviewService $reviewService ) {
        
        parent::__construct($reviewService);
    
    }

}
