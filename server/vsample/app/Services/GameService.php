<?php

namespace App\Services;
use App\Repositories\GameRepository;

class GameService extends BaseService {
   
    public function __construct(
        protected GameRepository $gameRepository
    ) { parent::__construct($gameRepository); }

}
