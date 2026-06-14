<?php

namespace App\Services;
use App\Repositories\PermissionRepository;

class PermissionService extends BaseService {
   
    public function __construct(
        protected PermissionRepository $permissionRepository
    ) { parent::__construct($permissionRepository); }

}
