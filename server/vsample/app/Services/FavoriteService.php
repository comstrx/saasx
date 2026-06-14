<?php

namespace App\Services;
use App\Repositories\FavoriteRepository;

class FavoriteService extends BaseService {
   
    public function __construct(
        protected FavoriteRepository $favoriteRepository
    ) { parent::__construct($favoriteRepository); }

}
