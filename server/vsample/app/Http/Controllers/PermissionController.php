<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\PermissionService;

class PermissionController extends Controller {

    public function __construct ( protected PermissionService $permissionService ) {
        
        parent::__construct($permissionService);
    
    }

}
