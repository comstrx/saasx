<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\BlogService;

class BlogController extends Controller {

    public function __construct ( protected BlogService $blogService ) {
        
        parent::__construct($blogService);
    
    }

}
