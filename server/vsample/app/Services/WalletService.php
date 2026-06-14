<?php

namespace App\Services;
use App\Repositories\WalletRepository;
use App\Models\User;

class WalletService extends BaseService {

    protected $wallet;

    public function __construct( protected WalletRepository $walletRepository ) {
        
        parent::__construct($walletRepository);
        $this->setWallet();

    }
    public function setWallet () {

        $this->wallet = client()?->wallet ?? failNow('wallet');

    }
    public function balance ( string $field = null ) {

        return $field ? success([$field => $this->wallet->$field]) : success(['wallet' => $this->wallet->toResource()]);

    }
    public function increment ( float $amount, string $balance = null ) {
        
        if ( !$this->walletRepository->increase($this->wallet, $amount, $balance) ) return failed();
        return $this->balance();
    
    }
    public function decrement ( float $amount, string $balance = null ) {
        
        if ( !$this->walletRepository->decrease($this->wallet, $amount, $balance) ) return failed();
        return $this->balance();
    
    }
    public function suspend ( float $amount ) {
        
        if ( !$this->walletRepository->suspend($this->wallet, $amount) ) return failed();
        return $this->balance();
    
    }
    public function release ( float $amount ) {
        
        if ( !$this->walletRepository->release($this->wallet, $amount) ) return failed();
        return $this->balance();
    
    }
    public function freeze () {

        if ( !$this->walletRepository->freeze($this->wallet) ) return failed();
        return $this->balance();
    
    }
    public function unfreeze () {
        
        if ( !$this->walletRepository->unfreeze($this->wallet) ) return failed();
        return $this->balance();
    
    }
    public function reset () {
        
        if ( !$this->walletRepository->reset($this->wallet) ) return failed();
        return $this->balance();
    
    }
    public function transfer ( User $user, float $amount ) {
        
        if ( !$user->wallet || !$this->walletRepository->transfer($this->wallet, $user->wallet, $amount) ) return failed();
        return $this->balance();
    
    }

}
