<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ContentService;

class ContentController extends Controller {

    public function __construct ( protected ContentService $contentService ) {
        
        parent::__construct($contentService);
    
    }
    public function siteInfo ( Request $req ) {

        return $this->contentService->siteInfo();

    }
    public function pageInfo ( Request $req, string $page = null, string $key = null ) {

        return $this->contentService->pageInfo($req->all(), $page, $key);

    }

}
