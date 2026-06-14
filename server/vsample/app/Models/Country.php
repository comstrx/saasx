<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Country extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'categories'     => 'cities.categories',
        'products'       => 'cities.categories.products',
        'games'          => 'cities.categories.games',
        'gameProducts'   => 'cities.categories.games.products',
        'gameOrders'     => 'cities.categories.games.products.orders',
        'productOrders'  => 'cities.categories.products.orders',
        'gameReviews'    => 'cities.categories.games.products.orders.reviews',
        'productReviews' => 'cities.categories.products.orders.reviews',
    ];

    public function rating () { return round($this->gameReviews()->avg('rating') + $this->productReviews()->avg('rating'), 1); }
    public function citiesCount () { return $this->cities()->count(); }
    public function categoriesCount () { return $this->categories()->count(); }
    public function gamesCount () { return $this->games()->count(); }
    public function productsCount () { return $this->products()->count() + $this->gameProducts()->count(); }
    public function ordersCount () { return $this->gameOrders()->count() + $this->productOrders()->count(); }
    public function reviewsCount () { return $this->gameReviews()->count() + $this->productReviews()->count(); }

}
