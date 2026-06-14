<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Game extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'country' => 'category.city.country',
        'city'    => 'category.city',
        'orders'  => 'products.orders',
        'reviews' => 'products.orders.reviews',
    ];

    public function rating () { return round($this->reviews()->avg('rating'), 1); }
    public function productsCount () { return $this->products()->count(); }
    public function ordersCount () { return $this->orders()->count(); }
    public function reviewsCount () { return $this->reviews()->count(); }

}
