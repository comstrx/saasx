<?php

namespace App\Services;
use App\Repositories\CommissionTargetRepository;

class CommissionTargetService extends BaseService {
  
    public function __construct(
        protected CommissionTargetRepository $commissionTargetRepository,
    ) { parent::__construct($commissionTargetRepository); }

}
