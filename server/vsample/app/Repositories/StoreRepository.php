<?php

namespace App\Repositories;
use App\Models\Store;
use App\Models\User;

class StoreRepository extends BaseRepository {

    public function __construct( Store $model, protected DomainRepository $domainRepository ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'parent_id' => integer($data['parent_id']),
            'owner_id'  => integer($data['owner_id']),
            'name'      => string($data['name']),
            'email'     => string($data['email']),
            'phone'     => string($data['phone']),
            'country'   => string($data['country']),
        ];
    
    }
    public function findByDomain ( string $domain, User $user = null ) {

        $store = $this->domainRepository->findStore($domain) ?? $user?->store;

        if ( !$store?->active || ($user && $user->store_id !== $store->id) ) return;
        return $store;

    }

}
