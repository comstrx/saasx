<?php

namespace App\Services;
use App\Repositories\StoreRepository;
use App\Models\Store;
use App\Models\User;

class StoreService extends BaseService {

    public function __construct(
        protected StoreRepository $storeRepository,
        protected UserService $userService,
        protected DomainService $domainService,
        protected SubscriptionService $subscriptionService,
    ) { parent::__construct($storeRepository); }

    public function subscribe ( Store $store, array $data = [] ) {

        if ( !$this->subscriptionService->subscribeOrRenew($store, $data) ) throwError('subscription', 'subscription failed');
        if ( !$this->withTenant($store->id, callback: fn() => $this->domainService->apply($data)) ) throwError('domains', 'invalid domains');

    }
    public function flush ( Store $store ) {

        $this->withTenant($store->id, callback: fn() => $this->domainService->flush());
        parent::delete($store->id);

    }
    public function store ( array $data = [], array $scopes = [] ) {

        return $this->storeRepository->dbTransaction(function () use ( $data, $scopes ) {

            $owner = is_client() ? client() : $this->userService->find(integer(data_get($data, 'owner_id')));
            $store = $this->storeRepository->create(array_merge($data, ['owner_id' => $owner->id]), $scopes);
            
            $this->subscribe($store, $data);
            $this->runJob([SeedingService::class, 'run'], [$store, withoutFiles($data)]);

            $this->deleteCache();
            return parent::show($store->id);

        });

    }
    public function update ( int $id, array $data = [], array $scopes = [] ) {

        return $this->storeRepository->dbTransaction(function () use ( $id, $data, $scopes ) {

            $store = $this->find($id, $scopes);
            $this->subscribe($store, $data);
            return parent::update($id, $data, $scopes);

        });

    }
    public function delete ( int $id, array $scopes = [] ) {
        
        $this->runJob([static::class, 'flush'], [$this->find($id, $scopes)]);
        return success();

    }
    public function renew ( int $id, array $scopes = [] ) {

        if ( !$this->subscriptionService->renew($this->find($id, $scopes)) ) return permissionFailed('subscription');
        return success();

    }
    public function middleware ( string $host, User $user = null ) {

        if ( !$store = $this->storeRepository->findByDomain($host, $user) ) return;
        if ( !$this->subscriptionService->renew($store, false) ) return;
        return $store;

    }

}
