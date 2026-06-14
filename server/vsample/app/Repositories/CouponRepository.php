<?php

namespace App\Repositories;
use App\Models\Coupon;
use App\Models\CouponUser;
use App\Models\Product;
use App\Models\User;

class CouponRepository extends BaseRepository {

    public function __construct(
        Coupon $model,
        protected CouponUserRepository $couponUserRepository,
        protected CouponUsageRepository $couponUsageRepository,
        protected WalletRepository $walletRepository
    ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'    => integer($data['country_id']),
            'city_id'       => integer($data['city_id']),
            'category_id'   => integer($data['category_id']),
            'game_id'       => integer($data['game_id']),
            'product_id'    => integer($data['product_id']),
            'campaign_id'   => integer($data['campaign_id']),
           
            'code'          => string($data['code']),
            'type'          => string($data['type']),
            'points'        => integer($data['points']),

            'discount_type' => string($data['discount_type']),
            'discount'      => float($data['discount']),
            'max_discount'  => float($data['max_discount']),
            'min_price'     => float($data['min_price']),
            'max_price'     => float($data['max_price']),
            'max_usages'    => integer($data['max_usages']),
            'max_uses'      => integer($data['max_uses']),
            'min_orders'    => integer($data['min_orders']),
            'min_level'     => integer($data['min_level']),
            'expires_at'    => string($data['expires_at']),
            'notes'         => string($data['notes']),
           
            'name'          => $data['name'],
            'description'   => $data['description'],
            'conditions'    => $data['conditions'],
        ];

    }
    public function findCoupon ( int|string $value ) {

        return is_numeric($value) ? parent::find($value, ['active']) : parent::findBy('code', $value, ['active']);

    }
    public function findCouponUser ( User $user, string $column, int $value ) {

        return $user->couponUsers()
            ->notUsed()
            ->notExpired()
            ->where($column, $value)
            ->active()
            ->orderByDesc('id')
            ->first();

    }
    public function findCouponWithUser ( User $user, int|string $value ) {

        if ( is_numeric($value) ) {

            $couponUser = $this->findCouponUser($user, 'id', $value);
            $coupon = $couponUser ? $this->findCoupon($couponUser->coupon_id) : null;

        }
        else {

            $coupon = $this->findCoupon($value);
            $couponUser = $coupon ? $this->findCouponUser($user, 'coupon_id', $coupon->id) : null;

        }
        
        if ( !$coupon || (!$couponUser && $coupon->couponUsages()->where('user_id', $user->id)->exists()) ) return null;
        else return [$coupon, $couponUser];

    }

    public function canRedeem ( Coupon $coupon, User $user ) {

        return (
            $coupon->isAvailable() &&
            $user->hasFeature('allow_coupons', ['city', 'country']) &&
            $user->level >= $coupon->min_level &&
            $user->orders()->count() >= $coupon->min_orders &&
            ( !$coupon->max_usages || $coupon->couponUsages()->count() < $coupon->max_usages ) &&
            ( !$coupon->max_uses || $coupon->couponUsers()->where('user_id', $user->id)->count() < $coupon->max_uses ) &&
            !$this->findCouponUser($user, 'coupon_id', $coupon->id)
        );

    }
    public function redeemPoints ( Coupon $coupon, User $user ) {

        if ( $coupon->points && !$user->wallet ) return false;
        return !$coupon->points || $this->walletRepository->removePoints($user->wallet, $coupon->points);

    }
    public function redeem ( Coupon $coupon, User $user, array $data = [] ) {

        if ( !$this->canRedeem($coupon, $user) || !$this->redeemPoints($coupon, $user) ) return null;

        return $this->couponUserRepository->create([
            'user_id'    => $user->id,
            'coupon_id'  => $coupon->id,
            'points'     => $coupon->points,
            'expires_at' => $data['expires_at'] ?? $coupon->formatDate('expires_at'),
        ]);

    }
    public function usage ( Coupon $coupon, User $user, array $data = [] ) {

        return $this->couponUsageRepository->create([
            'user_id'   => $user->id,
            'coupon_id' => $coupon->id,
            'code'      => $coupon->code,
            'discount'  => $data['discount'] ?? 0,
            'snapshot'  => $coupon->toArray(),
        ]);

    }
    public function use ( Coupon $coupon, User $user, CouponUser $couponUser = null, array $data = [] ) {

        $this->usage($coupon, $user, $data);
        $couponUser?->update(['used_at' => utc_date()]);

    }

    public function canApplyProduct ( Coupon $coupon, Product $product ) {

        $couponAllowed = $coupon->isBelongsToChain([
            'product_id'  => $product->id,
            'game_id'     => $product->game_id,
            'category_id' => $product->category_id ?: $product->game?->category_id,
            'city_id'     => 
                $product->city_id ?:
                $product->game?->city_id ?:
                $product->category?->city_id ?:
                $product->game?->category?->city_id,
            'country_id'  => 
                $product->country_id ?:
                $product->city?->country_id ?:
                $product->category?->country_id ?: 
                $product->category?->city?->country_id ?:
                $product->game?->country_id ?:
                $product->game?->city?->country_id ?:
                $product->game?->category?->country_id ?:
                $product->game?->category?->city?->country_id,
        ]);
        $featureAllowed = $product->hasFeature('allow_coupons', [
            'game',
            'category',
            'city',
            'country',
            'city.country',
            'game.category',
            'game.city',
            'game.country',
            'game.city.country',
            'game.category.country',
            'game.category.city',
            'game.category.city.country',
        ]);

        return $couponAllowed && $featureAllowed;

    }
    public function canApplyDiscount ( Coupon $coupon, User $user = null, float $price = 0 ) {

        return (
            $coupon->isAvailable() &&
            $price >= $coupon->min_price &&
            $price <= $coupon->max_price &&
            ( $user?->level ?? 0 ) >= $coupon->min_level &&
            ( $user?->orders()?->count() ?? 0 ) >= $coupon->min_orders &&
            ( !$user || $user->hasFeature('allow_coupons', ['city', 'country']) ) &&
            ( !$coupon->max_usages || $coupon->couponUsages()->count() < $coupon->max_usages ) &&
            (
                !$user ||
                !$coupon->max_uses ||
                $this->findCouponUser($user, 'coupon_id', $coupon->id) ||
                $coupon->couponUsages()->where('user_id', $user->id)->count() < $coupon->max_uses
            )
        );

    }
    public function applyDiscount ( Coupon $coupon, Product $product, User $user = null, float $price = 0 ) {

        if ( !$this->canApplyProduct($coupon, $product) || !$this->canApplyDiscount($coupon, $user, $price) ) return 0;
       
        $discount = $coupon->discount_type === 'fixed' ? positive($coupon->discount) : positive($price * ($coupon->discount / 100));
        if ( $coupon->max_discount > 0 ) $discount = min($discount, $coupon->max_discount);

        return round(positive($price - $discount), 2);

    }
    public function apply ( Coupon $coupon, Product $product, User $user = null, int $quantity = 1 ) {

        $maxQuantity = $product->max_quantity;
        $quantity    = min($maxQuantity, max(1, $quantity));
        $basePrice   = $product->totalPrice() * $quantity;
        $totalPrice  = $this->applyDiscount($coupon, $product, $user, $basePrice);

        return !$totalPrice ? null : [
            'coupon_id'    => $coupon->id,
            'coupon_code'  => $coupon->code,
            'coupon_type'  => $coupon->type,
            'quantity'     => $quantity,
            'max_quantity' => $maxQuantity,
            'base_price'   => $basePrice,
            'total_price'  => $totalPrice,
            'unit_price'   => round($totalPrice / $quantity, 2),
            'discount'     => round($basePrice - $totalPrice, 2),
        ];

    }

}
