<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\UserService;

class AdminController extends UserController {

    public function __construct ( protected UserService $userService ) {
        
        parent::__construct($userService);
        
        $extra = user_has('super') ? [] : ['admin_id' => user_id()];
        $this->applyScopes(['role' => 'admin', 'id' => ['!=', user_id()], ...$extra])->applyPermissions(['super' => false]);

    }

}
