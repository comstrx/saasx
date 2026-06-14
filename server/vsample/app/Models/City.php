<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class City extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'products'       => 'categories.products',
        'games'          => 'categories.games',
        'gameProducts'   => 'categories.games.products',
        'gameOrders'     => 'categories.games.products.orders',
        'productOrders'  => 'categories.products.orders',
        'gameReviews'    => 'categories.games.products.orders.reviews',
        'productReviews' => 'categories.products.orders.reviews',
    ];

    public function rating () { return round($this->gameReviews()->avg('rating') + $this->productReviews()->avg('rating'), 1); }
    public function categoriesCount () { return $this->categories()->count(); }
    public function gamesCount () { return $this->games()->count(); }
    public function productsCount () { return $this->products()->count() + $this->gameProducts()->count(); }
    public function ordersCount () { return $this->gameOrders()->count() + $this->productOrders()->count(); }
    public function reviewsCount () { return $this->gameReviews()->count() + $this->productReviews()->count(); }

}
