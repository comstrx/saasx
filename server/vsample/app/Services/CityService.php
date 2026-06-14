<?php

namespace App\Services;
use App\Repositories\CityRepository;

class CityService extends BaseService {
   
    public function __construct(
        protected CityRepository $cityRepository
    ) { parent::__construct($cityRepository); }

}
