<?php

namespace App\Services;
use App\Repositories\GiftCodeRepository;
use App\Models\Product;
use App\Models\User;

class GiftCodeService extends BaseService {
   
    public function __construct(
        protected GiftCodeRepository $giftCodeRepository,
    ) { parent::__construct($giftCodeRepository); }

    public function apply ( Product $product, User $user ) {

        $giftCode = $this->giftCodeRepository->findByProduct($product);
        return $giftCode ? $this->giftCodeRepository->apply($giftCode, $product, $user) : null;

    }

}
