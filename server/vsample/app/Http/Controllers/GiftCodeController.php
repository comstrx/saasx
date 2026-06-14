<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\GiftCodeService;
use App\Http\Requests\GiftCodeRequest;

class GiftCodeController extends Controller {

    public function requestForm () { return GiftCodeRequest::class; }

    public function __construct ( protected GiftCodeService $giftCodeService ) {
        
        parent::__construct($giftCodeService);
        $this->applyScopes(strict: true);
    
    }

}
