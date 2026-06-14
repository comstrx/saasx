<?php

namespace App\Repositories;
use App\Models\GiftCode;
use App\Models\Product;
use App\Models\User;

class GiftCodeRepository extends BaseRepository {

    public function __construct( GiftCode $model, protected GiftCodeUsageRepository $giftCodeUsage ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'game_id'     => integer($data['game_id']),
            'product_id'  => integer($data['product_id']),
            'user_id'     => integer($data['user_id']),
            'code'        => string($data['code']),
            'description' => string($data['description']),
            'notes'       => string($data['notes']),
            'type'        => string($data['type'] ?? 'public'),
            'expires_at'  => string($data['expires_at']),
            'used_at'     => string($data['used_at']),
        ];

    }
    public function findByProduct ( Product $product ) {

        return parent::query()
            ->notExpired()
            ->notUsed()
            ->active()
            ->where(fn($q) => $q->where('product_id', $product->id)->orWhere('game_id', $product->game_id))
            ->first();
        
    }
    public function canApply ( GiftCode $giftCode, Product $product, User $user ) {

        return (
            ($giftCode->product_id === $product->id || $giftCode->game_id === $product->game_id) &&
            ($giftCode->isPublic() || ($giftCode->isPrivate() && $giftCode->user_id === $user->id)) &&
            !$giftCode->isExpired() &&
            !$giftCode->isUsed() &&
            $giftCode->has('allow_usages') &&
            $user->has('allow_gift_codes') &&
            $product->has('allow_gift_codes') &&
            (!$product->game || $product->game->has('allow_gift_codes'))
        );

    }
    public function apply ( GiftCode $giftCode, Product $product, User $user ) {

        if ( !$this->canApply($giftCode, $product, $user) ) return null;
        
        $this->giftCodeUsage->create([
            'gift_code_id' => $giftCode->id,
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $giftCode->setUsed();
        return $giftCode;

    }

}
