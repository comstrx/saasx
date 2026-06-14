<?php

namespace App\Services;
use App\Repositories\LevelRepository;

class LevelService extends BaseService {
   
    public function __construct(
        protected LevelRepository $levelRepository
    ) { parent::__construct($levelRepository); }

}
