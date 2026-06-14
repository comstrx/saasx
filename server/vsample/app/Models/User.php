<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Model\HasBaseModel;

class User extends Authenticatable {

    use HasApiTokens, HasBaseModel;
    
    protected array $relationPreference = [
        'logs'      => ['logs', null, null, 'morphMany'],
        'reports'   => ['logs', null, null, 'hasMany'],
        'referrals' => ['referrals', 'referrer_id'],
        'referrer'  => ['referrals.users', ['referred_id', 'id'], ['id', 'referrer_id']]
    ];

    protected static function boot () {

        parent::boot();

        static::created(function ( $user ) {
            
            if ( $user->role === 'admin' ) return;
            $user->createWallet();
            $user->createApiToken();

        });

    }
    public function createWallet () {

        return Wallet::query()->firstOrCreate(['user_id' => $this->id, 'store_id' => $this->store_id]);

    }
    public function createApiToken ( array $params = [] ) {

        do { $key = bin2hex(random_bytes(16)); } while (ApiToken::where('key', $key)->exists());
        do { $secret = bin2hex(random_bytes(32)); } while (ApiToken::where('secret', $secret)->exists());

        return ApiToken::create([
            'user_id'    => $this->id,
            'store_id'   => $this->store_id,
            'key'        => $key,
            'secret'     => $secret,
            'expires_at' => parse_date(data_get($params, 'expires_at')),
        ]);

    }

    public function referralsCount () { return $this->referrals()->count(); }
    public function ordersCount () { return $this->orders()->count(); }
    public function couponsCount () { return $this->orders()->count(); }
    public function reviewsCount () { return $this->reviews()->count(); }

    public function scopeAdmin ( $query ) { return $query->where('role', 'admin'); }
    public function scopeVendor ( $query ) { return $query->where('role', 'vendor'); }
    public function scopeDelivery ( $query ) { return $query->where('role', 'delivery'); }
    public function scopeClient ( $query ) { return $query->where('role', 'client'); }
    public function scopeNotAdmin ( $query ) { return $query->where('role', '!=', 'admin'); }
    public function scopeRole ( $query, string $role ) { return $query->where('role', $role); }
    
    public function hasRole ( ...$roles ) { return in_array($this->role, $roles); }
    public function isAllowed () { return $this->active && $this->has('allow_logins'); }
    public function isVerified () { return $this->email_verified && $this->phone_verified; }
    public function isAllowedAdmin () { return $this->hasRole('admin') && $this->isAllowed(); }
    public function isAllowedClient () { return $this->hasRole('client') && $this->isAllowed(); }
    public function isVerifiedClient () { return $this->isAllowedClient() && $this->isVerified(); }

}
