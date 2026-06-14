<?php

namespace App\Services;
use App\Repositories\BlogRepository;

class BlogService extends BaseService {
   
    public function __construct(
        protected BlogRepository $blogRepository,
    ) { parent::__construct($blogRepository); }

}
