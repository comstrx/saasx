<?php

namespace App\Services;
use App\Repositories\SiteInfoRepository;

class SiteInfoService extends BaseService {
   
    public function __construct(
        protected SiteInfoRepository $siteInfoRepository
    ) { parent::__construct($siteInfoRepository); }

}
