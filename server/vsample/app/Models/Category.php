<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Category extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'country'        => 'city.country',
        'gameProducts'   => 'games.products',
        'gameOrders'     => 'games.products.orders',
        'productOrders'  => 'products.orders',
        'gameReviews'    => 'games.products.orders.reviews',
        'productReviews' => 'products.orders.reviews',
    ];

    public function rating () { return round($this->gameReviews()->avg('rating') + $this->productReviews()->avg('rating'), 1); }
    public function childrensCount () { return $this->childrens()->count(); }
    public function gamesCount () { return $this->games()->count(); }
    public function productsCount () { return $this->products()->count() + $this->gameProducts()->count(); }
    public function ordersCount () { return $this->gameOrders()->count() + $this->productOrders()->count(); }
    public function reviewsCount () { return $this->gameReviews()->count() + $this->productReviews()->count(); }

}
