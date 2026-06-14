<?php

namespace App\Repositories;
use App\Models\Cart;

class CartRepository extends BaseRepository {

    public function __construct( Cart $model ) { parent::__construct($model); }

    public function increment ( int $id, int $quantity = 1, string|array $scope = null ) {

        $cart = parent::findOrFail($id, $scope);
        return $cart->update(['quantity' => min(positive($cart->product?->max_quantity), positive($cart->quantity + $quantity)) ?: 1]);

    }
    public function decrement ( int $id, int $quantity = 1, string|array $scope = null ) {

        $cart = parent::findOrFail($id, $scope);
        return $cart->update(['quantity' => max(1, positive($cart->quantity - $quantity))]);

    }
    public function addItem ( int $id, int $userId ) {

        return parent::updateOrCreate(['product_id' => $id, 'user_id' => $userId]);

    }
    public function removeItem ( int $id, int $userId ) {

        return parent::query()->where(['product_id' => $id, 'user_id' => $userId])->delete();

    }

}
