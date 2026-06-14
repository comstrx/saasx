<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Transaction extends Model {

    use HasBaseModel;

    public function walletUser () { return $this->hasOneThrough(User::class, Wallet::class, 'id', 'id', 'wallet_id', 'user_id'); }
    public function orderUser () { return $this->hasOneThrough(User::class, Order::class, 'id', 'id', 'order_id', 'user_id'); }

    public function scopeUser ( Builder $query, int $userId ) {

        return $query->where(fn($query) =>
            $query->whereHas('wallet', fn($q) => $q->where('user_id', $userId))
            ->orWhereHas('order', fn($q) => $q->where('user_id', $userId))
        );

    }
    public function refundedAmount () {
        
        return $this->transactions()->whereIn('status', ['pending', 'successful'])->sum('amount');
    
    }
    public function refundAmount ( float $amount = 0 ) {
        
        $remaind = positive($this->amount - $this->refundedAmount());
        return min(positive($amount), $remaind) ?: $remaind;
    
    }
    public function refundPaidAmount ( float $amount = 0 ) {
        
        return $this->exchange_rate > 0 ? positive($amount * $this->exchange_rate) : positive($amount);
    
    }
    public function canRefund () {
        
        return $this->active &&
            $this->allow_refund &&
            $this->type === 'deposit' &&
            $this->amount > $this->refundedAmount() &&
            in_array($this->status, ['successful', 'refunded']) &&
            now()->diffInDays($this->created_at, true) <= $this->refund_days;

    }

}
