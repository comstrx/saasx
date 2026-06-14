<?php

namespace App\Services;
use App\Repositories\UserRepository;

class UserService extends BaseService {

    public function __construct(
        protected UserRepository $userRepository
    ) { parent::__construct($userRepository); }

}
