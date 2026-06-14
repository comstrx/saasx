<?php

namespace App\Services;
use App\Repositories\ReplyRepository;

class ReplyService extends BaseService {
   
    public function __construct(
        protected ReplyRepository $replyRepository
    ) { parent::__construct($replyRepository); }

}
