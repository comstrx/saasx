<?php

namespace App\Services;
use App\Repositories\ReviewRepository;

class ReviewService extends BaseService {
   
    public function __construct(
        protected ReviewRepository $reviewRepository,
    ) { parent::__construct($reviewRepository); }

}
