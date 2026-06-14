<?php

namespace App\Services;
use App\Repositories\PlatformRepository;

class PlatformService extends BaseService {
   
    public function __construct(
        protected PlatformRepository $platformRepository
    ) { parent::__construct($platformRepository); }

}
