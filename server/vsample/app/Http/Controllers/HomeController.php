<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\HomeService;

class HomeController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected HomeService $homeService ) {
        
        parent::__construct($homeService);
    
    }
    public function recentlyOffers ( Request $req ) {

        return $this->homeService->recentlyOffers( $req->all(), $this->scopes, $this->permissions );

    }
    public function recentlyCategories ( Request $req ) {

        return $this->homeService->recentlyCategories( $req->all(), $this->scopes, $this->permissions );

    }
    public function recentlyGames ( Request $req ) {

        return $this->homeService->recentlyGames( $req->all(), $this->scopes, $this->permissions );

    }
    public function recentlyProducts ( Request $req ) {

        return $this->homeService->recentlyProducts( $req->all(), $this->scopes, $this->permissions );

    }
    public function recentlyGiftCards ( Request $req ) {

        return $this->homeService->recentlyGiftCards( $req->all(), $this->scopes, $this->permissions );

    }

}
