<?php

namespace App\Services;
use App\Repositories\LikeRepository;

class LikeService extends BaseService {
   
    public function __construct(
        protected LikeRepository $likeRepository
    ) { parent::__construct($likeRepository); }

}
