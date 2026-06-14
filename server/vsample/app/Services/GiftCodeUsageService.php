<?php

namespace App\Services;
use App\Repositories\GiftCodeUsageRepository;

class GiftCodeUsageService extends BaseService {
   
    public function __construct(
        protected GiftCodeUsageRepository $giftCodeUsageRepository
    ) { parent::__construct($giftCodeUsageRepository); }

}
