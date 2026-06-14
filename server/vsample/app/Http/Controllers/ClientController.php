<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\UserService;

class ClientController extends UserController {

    public function __construct ( protected UserService $userService ) {
        
        parent::__construct($userService);
        $this->applyScopes(['role' => 'client']);
        
    }

}
