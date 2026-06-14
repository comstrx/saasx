<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\AttachmentService;

class AttachmentController extends Controller {

    public function __construct ( protected AttachmentService $attachmentService ) {
        
        parent::__construct($attachmentService);
    
    }

}
