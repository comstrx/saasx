<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\GiftCodeUsageService;

class GiftCodeUsageController extends Controller {

    public function __construct ( protected GiftCodeUsageService $giftCodeUsageService ) {
        
        parent::__construct($giftCodeUsageService);
        $this->applyScopes(strict: true);
    
    }

}
