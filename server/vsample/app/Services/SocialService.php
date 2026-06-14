<?php

namespace App\Services;
use App\Repositories\SocialRepository;

class SocialService extends BaseService {

    public function __construct(
        protected SocialRepository $socialRepository
    ) { parent::__construct($socialRepository); }

}
