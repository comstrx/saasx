<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Cart extends Model {

    use HasBaseModel;

    public function price () { return ($this->product?->total_price() ?? 0) * $this->quantity; }
    public function discount ( $user, $coupon ) { return $this->apply_discount( $user, $coupon ) ?: $this->price(); }
    public function discount_rate ( $user, $coupon ) { return $this->apply_discount( $user, $coupon ) ? $coupon->discount : 0; }
    public function apply_discount ( $user, $coupon ) { return (calculate_discount($this->product, $user, $coupon) ?? 0) * $this->quantity; }

}
