<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\FavoriteService;

class FavoriteController extends Controller {

    public function __construct ( protected FavoriteService $favoriteService ) {
        
        parent::__construct($favoriteService);
        $this->applyScopes(strict: true);
    
    }

}
