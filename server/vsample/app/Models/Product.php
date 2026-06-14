<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Product extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'country' => 'category.city.country',
        'city'    => 'category.city',
        'reviews' => 'orders.reviews',
    ];

    public function rating () { return round($this->reviews()->avg('rating'), 1); }
    public function ordersCount () { return $this->orders()->count(); }
    public function reviewsCount () { return $this->reviews()->count(); }

    public function totalPrice () { return positive($this->new_price + $this->margin_price); }

}
