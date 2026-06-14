<?php

namespace App\Services;
use App\Repositories\LevelFeatureRepository;

class LevelFeatureService extends BaseService {
   
    public function __construct(
        protected LevelFeatureRepository $levelFeatureRepository
    ) { parent::__construct($levelFeatureRepository); }

}
