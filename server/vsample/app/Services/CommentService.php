<?php

namespace App\Services;
use App\Repositories\CommentRepository;

class CommentService extends BaseService {
   
    public function __construct(
        protected CommentRepository $commentRepository,
    ) { parent::__construct($commentRepository); }

}
