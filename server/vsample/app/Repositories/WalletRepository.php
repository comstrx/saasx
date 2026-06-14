<?php

namespace App\Repositories;
use Illuminate\Support\Facades\DB;
use App\Models\Wallet;
use App\Models\User;

class WalletRepository extends BaseRepository {
 
    public function __construct( Wallet $model ) { parent::__construct($model); }
    
    public function executeTransaction ( Wallet $wallet, callable $callback ) {

        if ( $wallet->processing ) return false;
        $wallet->update(['processing' => true]);

        $status = false;
        try { $status = DB::transaction(fn() => $callback()); } catch (\Exception $e) {}

        $wallet->update(['processing' => false]);
        return $status;

    }
    public function incrementProcess ( Wallet $wallet, float $amount, string $balance ) {
        
        if ( !$wallet->active || $amount <= 0 ) return false;

        return $this->executeTransaction( $wallet, function () use ( $wallet, $amount, $balance ) {

            return match ( $balance ) {
                'buy'      => $wallet->increment('buy_balance', $amount),
                'withdraw' => $wallet->increment('withdraw_balance', $amount),
                'pending'  => $wallet->increment('pending_balance', $amount),
                'fee'      => $wallet->increment('fee_balance', $amount),
                'points'   => $wallet->increment('points', $amount),
                default    => false,
            };
            
        });
    
    }
    public function decrementProcess ( Wallet $wallet, float $amount, string $balance ) {
        
        if ( !$wallet->active || $amount <= 0 ) return false;

        return $this->executeTransaction( $wallet, function () use ( $wallet, $amount, $balance ) {

            return match ( $balance ) {
                'buy'       => $wallet->buy_balance >= $amount && $wallet->decrement('buy_balance', $amount),
                'withdraw'  => $wallet->withdraw_balance >= $amount && $wallet->decrement('withdraw_balance', $amount),
                'pending'   => $wallet->pending_balance >= $amount && $wallet->decrement('pending_balance', $amount),
                'points'    => $wallet->points >= $amount && $wallet->decrement('points', $amount),
                'fee'       => $wallet->fee_balance >= $amount ? $wallet->decrement('fee_balance', $amount) : $wallet->update(['fee_balance' => 0]),
                'available' => $wallet->buy_balance + $wallet->withdraw_balance >= $amount && $wallet->update([
                        'withdraw_balance' => max($wallet->withdraw_balance - max($amount - min($wallet->buy_balance, $amount), 0), 0),
                        'buy_balance' => max($wallet->buy_balance - min($wallet->buy_balance, $amount), 0),
                    ]),
                'available_reverse' => $wallet->buy_balance + $wallet->withdraw_balance >= $amount && $wallet->update([
                        'buy_balance' => max($wallet->buy_balance - max($amount - min($wallet->withdraw_balance, $amount), 0), 0),
                        'withdraw_balance' => max($wallet->withdraw_balance - min($wallet->withdraw_balance, $amount), 0),
                    ]),
                default => false,
            };
            
        });
    
    }
    public function transferProcess ( Wallet $wallet, Wallet $toWallet, float $amount ) {
        
        if ( !$wallet->active || $amount <= 0 ) return false;

        return $this->executeTransaction( $wallet, function () use ( $wallet, $toWallet, $amount ) {
            
            if ( !$toWallet?->active || $wallet->id === $toWallet->id ) return false;
            if ( !$this->decrementProcess($wallet, $amount, 'available_reverse') ) return false;
            if ( !$this->incrementProcess($toWallet, $amount, 'buy') ) throw new \Exception('cannot transfer amount');
            return true;

        });
    
    }
    public function aggregate ( Wallet $wallet, float $amount, string $type = null ) {
        
        return match ( $type ) {
            'referral' => (bool) $wallet->increment('referral_earnings', $amount),
            'cashback' => (bool) $wallet->increment('total_cashback', $amount),
            default    => true,
        };
        
    }
    public function increase ( Wallet $wallet, float $amount, string $balance = 'buy' ) {

        return $this->incrementProcess($wallet, $amount, $balance);

    }
    public function decrease ( Wallet $wallet, float $amount, string $balance = 'available' ) {

        return $this->decrementProcess($wallet, $amount, $balance);

    }
    public function suspend ( Wallet $wallet, float $amount, string $balance = 'available' ) {
        
        return $this->decrementProcess($wallet, $amount, $balance) && $this->incrementProcess($wallet, $amount, 'pending');
    
    }
    public function release ( Wallet $wallet, float $amount, string $balance = 'buy' ) {
        
        return $this->decrementProcess($wallet, $amount, 'pending') && $this->incrementProcess($wallet, $amount, $balance);
    
    }
    public function addMoney ( Wallet $wallet, float $amount ) {
        
        $amount = $this->removeFees($wallet, $amount);
        return $this->incrementProcess($wallet, $amount, 'buy');
    
    }
    public function cashback ( Wallet $wallet, float $amount ) {
        
        $amount = $this->removeFees($wallet, $amount);
        return $this->incrementProcess($wallet, $amount, 'buy') && $wallet->increment('total_cashback', $amount);
    
    }
    public function deposit ( Wallet $wallet, float $amount ) {

        $amount = $this->removeFees($wallet, $amount);
        return $this->incrementProcess($wallet, $amount, 'buy') && $wallet->increment('total_deposits', $amount);
    
    }
    public function pay ( Wallet $wallet, float $amount ) {
        
        return $this->decrementProcess($wallet, $amount, 'available') && $wallet->increment('total_pays', $amount);
    
    }
    public function withdraw ( Wallet $wallet, float $amount ) {
        
        return $this->decrementProcess($wallet, $amount, 'pending') && $wallet->increment('total_withdraws', $amount);
    
    }
    public function refund ( Wallet $wallet, float $amount ) {
        
        return $this->decrementProcess($wallet, $amount, 'pending') && $wallet->increment('total_refunds', $amount);
    
    }
    public function transfer ( Wallet $wallet, Wallet $toWallet, float $amount ) {
        
        return $this->transferProcess($wallet, $toWallet, $amount) && $wallet->increment('total_transfers', $amount);
    
    }
    public function addFees ( Wallet $wallet, float $amount ) {

        return $this->incrementProcess($wallet, $amount, 'fee');

    }
    public function removeFees ( Wallet $wallet, float $amount ) {

        if ( $wallet->fee_balance <= 0 ) return $amount;
        $remaind_amount = positive($amount - $wallet->fee_balance);

        if ( $remaind_amount ) $this->decrementProcess($wallet, $wallet->fee_balance, 'fee');
        else $this->decrementProcess($wallet, $amount, 'fee');

        return $remaind_amount;

    }
    public function addCommission ( Wallet $wallet, float $amount, string $balance = 'buy', string $type = null ) {
        
        return $this->incrementProcess($wallet, $amount, $balance ?: 'buy') && $this->aggregate($wallet, $amount, $type) ? $amount : 0;
    
    }
    public function addPoints ( Wallet $wallet, int $points ) {
        
        return $this->incrementProcess($wallet, $points, 'points') && $wallet->increment('earned_points', $points) ? $points : 0;
    
    }
    public function removePoints ( Wallet $wallet, int $points ) {
        
        return $this->decrementProcess($wallet, $points, 'points');
    
    }
    public function reset ( Wallet $wallet ) {
        
        return $wallet->update(['buy_balance' => 0, 'withdraw_balance' => 0, 'pending_balance' => 0, 'fee_balance' => 0, 'points' => 0]);
    
    }
    public function freeze ( Wallet $wallet ) {

        return $wallet->update(['active' => false]);
    
    }
    public function unfreeze ( Wallet $wallet ) {
        
        return $wallet->update(['active' => true]);
    
    }

}
