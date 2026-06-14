<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\SubscriptionService;

class SubscriptionController extends Controller {

    public function __construct ( protected SubscriptionService $subscriptionService ) {
        
        parent::__construct($subscriptionService);
    
    }

}
