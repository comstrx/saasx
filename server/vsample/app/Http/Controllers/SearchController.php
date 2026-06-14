<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\SearchService;

class SearchController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected SearchService $searchService ) {
        
        parent::__construct($searchService);
    
    }

}
