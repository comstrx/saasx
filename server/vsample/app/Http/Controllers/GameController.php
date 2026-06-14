<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\GameService;

class GameController extends Controller {

    public function __construct ( protected GameService $gameService ) {
        
        parent::__construct($gameService);
    
    }
    public function giftCardIndex ( Request $req ) {

        $this->applyScopes(['type' => 'gift_card']);
        return parent::index($req);

    }
    public function giftCardShow ( Request $req, int $id ) {

        $this->applyScopes(['type' => 'gift_card']);
        return parent::show($req, $id);

    }

}
