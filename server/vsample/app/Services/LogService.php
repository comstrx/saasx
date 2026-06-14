<?php

namespace App\Services;
use App\Repositories\LogRepository;

class LogService extends BaseService {
   
    public function __construct(
        protected LogRepository $logRepository
    ) { parent::__construct($logRepository); }

}
