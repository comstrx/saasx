<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\SettingService;

class SettingController extends Controller {

    public function __construct ( protected SettingService $settingService ) {
        
        parent::__construct($settingService);
    
    }

}
