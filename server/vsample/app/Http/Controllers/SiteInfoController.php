<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\SiteInfoService;

class SiteInfoController extends Controller {

    public function __construct ( protected SiteInfoService $siteInfoService ) {
        
        parent::__construct($siteInfoService);
    
    }

}
