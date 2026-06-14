<?php

namespace App\Services;
use App\Repositories\ResetRepository;

class ResetService extends BaseService {
   
    public function __construct(
        protected ResetRepository $resetRepository
    ) { parent::__construct($resetRepository); }

}
