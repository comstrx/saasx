<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Wallet extends Model {

    use HasBaseModel;

    public function hasFees () { return $this->fee_balance > 0; }
    public function available_balance () { return format_balance($this->buy_balance + $this->withdraw_balance); }
    public function total_balance () { return format_balance($this->buy_balance + $this->withdraw_balance + $this->pending_balance); }
    public function canPay ( float $amount ) { return $this->available_balance() >= $amount && !$this->hasFees() && $this->active; }

}
