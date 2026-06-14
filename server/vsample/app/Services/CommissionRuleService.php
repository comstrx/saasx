<?php

namespace App\Services;
use App\Repositories\CommissionRuleRepository;

class CommissionRuleService extends BaseService {
  
    public function __construct(
        protected CommissionRuleRepository $commissionRuleRepository,
    ) { parent::__construct($commissionRuleRepository); }

}
