<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ReplyService;

class ReplyController extends Controller {

    public function __construct ( protected ReplyService $replyService ) {
        
        parent::__construct($replyService);
    
    }

}
