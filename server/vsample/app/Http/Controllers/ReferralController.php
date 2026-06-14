<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ReferralService;

class ReferralController extends Controller {

    public function __construct ( protected ReferralService $referralService ) {
        
        parent::__construct($referralService);

        $extra = user_role() === 'admin' ? [] : ['referrer_id' => user_id()];
        $this->applyScopes($extra, strict: true);
    
    }

}
