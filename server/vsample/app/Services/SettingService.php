<?php

namespace App\Services;
use App\Repositories\SettingRepository;
use App\Repositories\CouponRepository;
use App\Repositories\WalletRepository;
use App\Repositories\ReferralRepository;
use App\Models\Setting;
use App\Models\User;

class SettingService extends BaseService {
   
    public function __construct(
        protected SettingRepository $settingRepository,
        protected WalletRepository $walletRepository,
        protected CouponRepository $couponRepository,
        protected ReferralRepository $referralRepository
    ) { parent::__construct($settingRepository); }

    public function executeCommission ( User $user, array $context = [] ) {
       
        $context = optional((object) $context);

        if ( $context->type === 'coupon' && !$coupon = $this->couponRepository->find(integer($context->coupon_id)) ) return;
        if ( $context->type !== 'coupon' && !$wallet = $user->wallet ) return;

        return match ( $context->type ) {
            'coupon' => $this->couponRepository->redeem($coupon, $user),
            'points' => $this->walletRepository->addPoints($wallet, $context->reward_points),
            'amount' => $this->walletRepository->addCommission($wallet, $context->reward_amount, $context->balance, $context->key),
            default  => null,
        };

    }
    public function applyCommission ( Setting $setting, User $user, float $amount = null ) {
  
        if ( $setting->key === 'referral' ) $user = $this->referralRepository->findReferrer($user);
        if ( !$user || !$this->settingRepository->validateCommission($setting, $user, $amount) ) return;
      
        $context = $this->settingRepository->commissionContext($setting, $amount);
        if ( !$reward = $this->executeCommission($user, $context) ) return;

        $this->settingRepository->setNewUsage($setting);
        return [...$context, 'user' => $user, 'reward' => $reward];

    }
    public function resolveCommission ( User $user, string $key, float $amount = null ) {

        $setting = $this->settingRepository->findSetting($key, 'commission');
        return $setting ? $this->applyCommission($setting, $user, $amount) : null;

    }
    public function handleCommission ( User $user, string $key, float $amount = null, bool $queue = true ) {

        if ( !$queue ) return $this->resolveCommission($user, $key, $amount);
        return $this->runJob([static::class, 'resolveCommission'], [$user, $key, $amount]);

    }
    public function handleCommissions ( User $user, array $keys, float $amount = null, bool $queue = true ) {
        
        return collect($keys)->filter()->map(fn($key) => $this->handleCommission($user, $key, $amount, $queue))->all();

    }

}
