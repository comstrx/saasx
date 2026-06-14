<?php

namespace App\Services;
use App\Repositories\ViewRepository;

class ViewService extends BaseService {
   
    public function __construct(
        protected ViewRepository $viewRepository
    ) { parent::__construct($viewRepository); }

}
