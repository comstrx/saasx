<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\UserService;

class UserController extends Controller {

    public function requestForm () { return UserRequest::class; }

    public function __construct ( protected UserService $userService ) {

        parent::__construct($userService);
        $this->applyScopes(['role' => ['!=', 'admin']]);
    
    }

}
