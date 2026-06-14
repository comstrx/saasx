<?php

namespace App\Services;
use App\Repositories\SubscriptionRepository;
use App\Repositories\WalletRepository;
use App\Repositories\PlanRepository;
use App\Models\Store;
use App\Models\Plan;
use App\Models\User;
use App\Models\Wallet;

class SubscriptionService extends BaseService {

    public function __construct(
        protected SubscriptionRepository $subscriptionRepository,
        protected WalletRepository $walletRepository,
        protected PlanRepository $planRepository,
        protected SettingService $settingService
    ) { parent::__construct($subscriptionRepository); }
    
    public function ownerPay ( Store $store, float $price ) {

        if ( !$store->active ) return false;

        $user = User::withoutTenant()->find($store->owner_id);
        $wallet = Wallet::withoutTenant()->firstWhere('user_id', $user?->id);

        if ( !$wallet || !$user?->isAllowedClient() || !$user->has('allow_stores') ) return false;
        return $this->walletRepository->pay($wallet, $price);

    }
    public function ownerRenew ( Store $store, bool $manual = true ) {

        if ( !$store->active || !$store->subscription?->active ) return false;
        if ( !$store->subscription->isExpired() ) return true;
        if ( !$manual && !$store->subscription->auto_renew ) return false;
        if ( !$this->ownerPay($store, $store->subscription->price) ) return false;

        $data = $this->planRepository->durationData($store->subscription->duration);
        return $this->subscriptionRepository->update($store->subscription->id, $data);

    }
    public function storePay ( Store $store, float $price ) {

        return $this->subscriptionRepository->dbTransaction(function () use ( $store, $price ) {

            while ( $store ) {
                
                if ( $store->owner_id && !$this->ownerPay($store, $price) ) throwError();

                $store = $store->parent;
            
            }

            return true;

        }, false);

    }
    public function storeRenew ( Store $store, bool $manual = true ) {

        return $this->subscriptionRepository->dbTransaction(function () use ( $store, $manual ) {

            while ( $store ) {
                
                if ( !$store->active || ($store->owner_id && !$this->ownerRenew($store, $manual)) ) throwError();
                
                $store = $store->parent;
            
            }

            return true;

        }, false);

    }
    public function renew ( Store $store, bool $manual = true ) {

        return $this->storeRenew($store, $manual);

    }
    public function subscribe ( Store $store, Plan $plan, array $data = [] ) {

        $data  = $this->planRepository->subscriptionData($plan, 'store', $data);
        $price = float($data['price'] ?? 0);

        if ( !$data ) throwError('plan', 'plan/duration not available');
        if ( $price && !$store->owner?->wallet?->canPay($price) ) throwError('balance', 'not enouph balance');
        if ( $price && !$this->storePay($store, $price) ) throwError('pay', "chain store can't pay");
      
        $plan->newUsage('max_subscriptions');
        $this->settingService->handleCommission($store->owner, 'subscription', $price);

        return $this->subscriptionRepository->create(array_merge($data, ['store_id' => $store->id]));

    }
    public function subscribeOrRenew ( Store $store, array $data = [] ) {

        $current  = $store->subscription;
        $planId   = integer($data['plan_id'] ?? null);
        $duration = string($data['duration'] ?? null);

        if ( !$current || ($planId && $planId !== $current->plan_id) ) {

            $plan = $this->planRepository->findOrFail($planId);
            $subscription = $this->subscribe($store, $plan, $data);
            
            if ( $current ) $this->subscriptionRepository->delete($current->id);
            return $subscription;

        }
        elseif ( $duration && $duration !== $current->duration ) {

            $plan = $this->planRepository->findOrFail($planId);
            $renewal = $this->planRepository->renewalData($plan, $data);

            if ( $renewal ) return $this->subscriptionRepository->update($current->id, $renewal);

        }

        return $current;

    }

}
