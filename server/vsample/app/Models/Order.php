<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Order extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'country' => 'product.category.city.country',
        'city'    => 'product.category.city',
        'game'    => 'product.game',
    ];

    public function reviewsCount () { return $this->reviews()->count(); }

    public function remainingAmount () { return positive($this->amount - $this->paid_amount); }
    public function remainingRefundAmount () { return positive($this->paid_amount - $this->refunded_amount - $this->cancel_cost); }
    public function payAmount ( float $amount = 0 ) { return min(positive($amount), $this->remainingAmount()) ?: $this->remainingAmount(); }
    public function refundAmount ( float $amount = 0 ) { return min(positive($amount), $this->remainingRefundAmount()) ?: $this->remainingRefundAmount(); }

    public function isFinished () { return in_array($this->status, ['completed', 'cancelled']); }
    public function isPaid () { return $this->paid && $this->paid_amount >= $this->amount; }
    public function canPayLater () { return $this->active && $this->allow_pay_later; }
    public function canPay () { return $this->active && $this->status !== 'cancelled' && $this->paid_amount < $this->amount; }
    
    public function canCancel () {

        return $this->active &&
            in_array($this->status, ['pending', 'confirmed']) &&
            $this->allow_cancel &&
            (!$this->cancel_before || $this->cancel_before > now());

    }
    public function canRefund () {

        return $this->active &&
            in_array($this->status, ['pending', 'confirmed']) &&
            $this->allow_refund &&
            $this->paid_amount &&
            (!$this->refund_before || $this->refund_before > now()) &&
            $this->refunded_amount < $this->remainingRefundAmount();

    }

}
