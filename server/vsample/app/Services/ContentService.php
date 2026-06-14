<?php

namespace App\Services;
use App\Repositories\ContentRepository;

class ContentService extends BaseService {
   
    public function __construct(
        protected ContentRepository $contentRepository,
        protected SiteInfoService $siteInfoService,
    ) { parent::__construct($contentRepository); }

    public function siteInfo () {

        return $this->successRemember('siteInfo', 'resource', callback: fn() => $this->siteInfoService->query()->findResource());

    }
    public function pageInfo ( array $params, string $page = null, string $key = null ) {

        return parent::index($params, scopes: [...($page ? ['page' => $page] : []), ...($key ? ['key' => $key] : [])]);

    }

}
