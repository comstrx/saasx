<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\EntityService;

class EntityController extends Controller {

    public function __construct ( protected EntityService $entityService ) {
        
        parent::__construct($entityService);
    
    }
    public function assignPermission ( Request $req, int $id, string $permission = null ) {

        return $this->entityService->assignPermission($id, $permission, $req->all());

    }

}
