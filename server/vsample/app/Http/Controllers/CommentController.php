<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CommentService;

class CommentController extends Controller {

    public function __construct ( protected CommentService $commentService ) {
        
        parent::__construct($commentService);
    
    }

}
