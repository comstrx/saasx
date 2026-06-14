<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRequest;
use App\Services\StoreService;

class StoreController extends Controller {

    public function requestForm () { return StoreRequest::class; }

    public function __construct ( protected StoreService $storeService ) {
        
        parent::__construct($storeService);
        $this->applyScopes(['parent_id' => store_id()], strict: true);
    
    }
    public function renew ( Request $req, int $id ) {

        return $this->storeService->renew($id, $this->scopes);
        
    }

}
