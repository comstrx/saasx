<?php

namespace App\Services;
use App\Repositories\CouponRepository;
use App\Repositories\ProductRepository;
use App\Models\Product;
use App\Models\User;

class CouponService extends BaseService {
  
    public function __construct(
        protected CouponRepository $couponRepository,
        protected ProductRepository $productRepository,
    ) { parent::__construct($couponRepository); }
    
    public function apply ( Product $product, User $user = null, int|string $coupon, int $quantity = 1, bool $use = false ) {

        [$coupon, $couponUser] = $this->couponRepository->findCouponWithUser($user, $coupon);
        if ( !$coupon ) return null;

        $data = $this->couponRepository->apply($coupon, $product, $user, $quantity);
        if ( $data && $use ) $this->couponRepository->use($coupon, $user, $couponUser, ['discount' => $data['discount']]);
       
        return $data;

    }
    public function validate ( int|string $coupon, array $data = [] ) {

        $product = $this->productRepository->findOrFail(integer($data['product_id'] ?? null));

        $data = $this->apply($product, client(), $coupon, integer($data['quantity'] ?? 1));
        return $data ? success($data) : notFoundFailed('coupon');

    }
    public function redeem ( int|string $coupon, array $data = [] ) {

        $coupon = $this->couponRepository->findCoupon($coupon) ?? failNow('coupon');
        $data   = $this->couponRepository->redeem($coupon, client());

        if ( !$data ) return permissionFailed();
        return success(['item' => $data->toResource()]);

    }

}
