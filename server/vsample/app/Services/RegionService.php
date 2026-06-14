<?php

namespace App\Services;
use App\Repositories\RegionRepository;

class RegionService extends BaseService {
   
    public function __construct(
        protected RegionRepository $regionRepository
    ) { parent::__construct($regionRepository); }

}
