<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\QrcodeService;

class QrcodeController extends Controller {

    public function __construct ( protected QrcodeService $qrcodeService ) {
        
        parent::__construct($qrcodeService);
    
    }

}
