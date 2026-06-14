<?php

namespace App\Services;
use Illuminate\Database\Eloquent\Model;
use App\Repositories\ProviderRepository;
use App\Repositories\ApiTokenRepository;
use App\Repositories\StoreRepository;

class ProviderService extends BaseService {

    public function __construct (
        protected ProviderRepository $providerRepository,
        protected ApiTokenRepository $apiTokenRepository,
        protected StoreRepository $storeRepository,
        protected UserService $userService,
        protected StoreService $storeService,
    ) { parent::__construct($providerRepository); }

    public function suppliers ( array $params = [], int $storeId = null ) {
        
        $options = [['active', 'id' => ['!=', store_id()]], ['allow_imports']];
        
        if ( $storeId ) return $this->storeService->show($storeId, ...$options);
        return $this->storeService->index($params, ...$options);

    }
    public function link ( int $storeId, int $userId = null ) {

        $this->storeService->find($storeId, ['active', 'id' => ['!=', store_id()]], ['allow_imports']);

        $userId = $userId ?? (store_owner()?->store_id === $storeId ? store_owner_id() : 0);
        if ( !$userId ) return notFoundFailed('user');

        return $this->updateOrCreate(['supplier_id' => $storeId], ['user_id' => $userId]);

    }
    public function apiLink ( array $params = [] ) {

        [$apiUrl, $apiKey] = [string(data_get($params, 'api_url')), string(data_get($params, 'api_key'))];
        $apiUrl = preg_replace('/api\./', '', $apiUrl ?? '');
       
        $store = $this->withoutTenant(fn() => $this->storeRepository->findByDomain($apiUrl));
        if ( !$store?->has('allow_imports') ) return permissionFailed();

        $user = $this->withTenant($store->id, callback: fn() => $this->apiTokenRepository->findUser($apiKey));
        if ( !$user?->has('allow_imports') ) return permissionFailed();

        return $this->link($store->id, $user->id);

    }
    public function unlink ( int $id ) {

        return $this->delete($id);

    }
    public function account ( int $id ) {

        $provider = $this->find($id, ['active'], ['allow_imports']);

        return $this->withTenant($provider->supplier_id, callback: fn() =>
            $this->userService->show($provider->user_id, ['active'], ['allow_imports'])
        );

    }
    public function show ( int $id, array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        $data = data_get(parent::show($id, $scopes, $permissions), 'original.item');
        $data['account'] = data_get($this->account($id), 'original.item');
        return success(['item' => $data]);

    }

    public function context ( int $id, string $entity = null, int $entityId = null, array $params = [], bool $linked = false ) {

        $entity   = trim(strtolower($entity ?? '')) === 'all' ? null : plural(snake($entity));
        $provider = $this->find($id, ['active'], ['allow_imports']);

        $options = [
            [
                'limit' => 1000,
                ...$params
            ],
            [
                ...($linked ? [] : ['active' => true]),
                ...($linked ? ['ref_id' => ['>', 0]] : []),
                ...($entityId ? ['id' => $entityId] : []),
            ],
            [
                ...($linked ? [] : ['allow_imports']),
            ],
        ];
        $entities = [
            'countries', 'cities', 'categories', 'games', 'products', 'platforms', 'regions', 'coupons',
            'blogs', 'comments', 'reviews', 'replies', 'gift_codes',
        ];

        $entities = collect($entities)->mapWithKeys(fn($e) => [$e => app('App\\Services\\' . studly(singular($e)) . 'Service')])->all();
        $entities = $entity ? [$entities[$entity] ?? $this->failNow($entity)] : $entities;

        return [$provider->supplier_id, $options, $entity, $entities];

    }
    public function foreigns ( int $id, array $item = [], array $params = [], bool $remove = false ) {

        $map = [
            'country_id'   => 'countries',
            'city_id'      => 'cities',
            'category_id'  => 'categories',
            'game_id'      => 'games',
            'product_id'   => 'products',
            'platform_id'  => 'platforms',
            'region_id'    => 'regions',
            'coupon_id'    => 'coupons',
            'blog_id'      => 'blogs',
            'comment_id'   => 'comments',
            'review_id'    => 'reviews',
            'reply_id'     => 'replies',
            'gift_code_id' => 'gift_codes',
        ];
        foreach ( $map as $key => $entity ) {

            $column = $item[$key] ?? null;

            if ( isset($item[$key]) && $remove ) unset($item[$key]);
            elseif ( !empty($column) ) $item[$key] = $this->importData($id, $entity, $column, $params)[0]?->id ?? 0;

        }

        return $item;

    }
    public function normalize ( int $id, array $item = [], bool $onlyPurchase = false ) {

        $item['new_price'] = float(data_get($item, 'new_price')) + float(data_get($item, 'margin_price'));

        if ( !$onlyPurchase ) {

            $ignore = ['store_id', 'ref_id', 'user_id', 'owner_id', 'parent_id', 'margin_price', 'phone', 'notes'];
            return collect($item)->reject(fn($value, $key) => in_array($key, $ignore, true))->all();

        }
        else {

            return [
                'new_price'       => float(data_get($item, 'new_price')),
                'cancel_cost'     => float(data_get($item, 'cancel_cost')),
                'cancel_before'   => string(data_get($item, 'cancel_before')),
                'refund_before'   => string(data_get($item, 'refund_before')),
                'max_quantity'    => integer(data_get($item, 'max_quantity')),
                'delivery_method' => string(data_get($item, 'delivery_method')),
            ];

        }

    }
    public function attachments ( Model $model, Model $item ) {

        $this->withTenant($item->store_id, callback: fn() => $item->attachments)->each(fn($att) =>
            $model->attachments()->updateOrCreate($att->onlyAttributes('path', 'type', 'name', 'size'))
        );

    }
    public function sendEmail ( int $id, string $event, string $entity = null, int $entityId = null, array $items = [] ) {

        $provider = $this->find($id);
        $admin    = $provider->storeAdmin($provider->supplier_id);
        $client   = $this->withTenant($provider->supplier_id, callback: fn() => $provider->user);
       
        $data = [
            'provider' => $provider,
            'event'    => $event,
            'entity'   => $entity,
            'id'       => $entityId,
            'items'    => count($items)
        ];

        send_email($admin, [...$data, 'fromMe' => true], 'provider');
        send_email($client, $data, 'provider');

    }
    
    public function fetch ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, $params);

        $items = collect($services)->map(fn($service) =>
            $this->withTenant($storeId, callback: fn() => data_get($service->index(...$options), 'original'))
        );

        return $entity ? success($items->first()) : success($items->toArray());
    
    }
    public function fetchLinked ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, $params, true);

        $items = collect($services)->map(function ($service) use ($storeId, $options, $entity) {

            $data = data_get($service->index(...$options), 'original');

            $data['items'] = collect($data['items'] ?? [])->filter(fn($item) =>
                $this->withTenant($storeId, callback: fn() => $service->find(data_get($item, 'ref_id'), fail: false))
            )->all();

            return $data;

        });

        return $entity ? success($items->first()) : success($items->toArray());

    }
    public function importData ( int $id, string $entity = null, int $entityId = null, array $params = [], bool $mailer = false ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, ['sort' => 'oldest', ...$params]);

        $items = collect($services)->mapWithKeys(function ($service) use ($id, $params, $storeId, $options) {

            $items = $this->withTenant($storeId, callback: fn() => $service->query(...$options)->getResult())->map(function ($item) use ($id, $params, $service) {

                $detach = bool(data_get($params, 'detach'));

                $data = $this->foreigns($id, $item->toArray(), ['detach' => $detach]);
                $data = $this->normalize($id, $data);

                if ( $detach ) $data['ref_id'] = 0;

                $model = $service->baseRepository->updateOrCreate(['ref_id' => $item->id], $data, strict: false);
                $this->attachments($model, $item);
                
                return $model;
                
            })->filter()->all();

            if ( $items ) $service->deleteCache();
            return $items;
            
        })->filter()->all();

        if ( $mailer ) $this->sendEmail($id, 'imported', $entity, $entityId, $items);
        return $items;

    }
    public function syncData ( int $id, string $entity = null, int $entityId = null, array $params = [], bool $mailer = false ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, $params);

        $items = collect($services)->mapWithKeys(function ($service) use ($id, $params, $storeId, $options) {
           
            $items = $service->query(...$options)->getResult()->map(function ($item) use ($storeId, $id, $params, $service) {

                $reference = $this->withTenant($storeId, callback: fn() => $service->baseRepository->find($item->ref_id));
                if ( !$reference ) return;

                [$detach, $onlyPurchase] = [bool(data_get($params, 'detach')), bool(data_get($params, 'only_purchase'))];

                $data = $this->foreigns($id, $reference->toArray(), [], true);
                $data = $this->normalize($id, $data, $onlyPurchase);

                if ( $detach ) $data['ref_id'] = 0;

                $model = $service->baseRepository->update($item->id, $data, strict: false);
                if ( !$onlyPurchase ) $this->attachments($model, $reference);

                return $model;

            })->filter()->all();

            if ( $items ) $service->deleteCache();
            return $items;

        })->filter()->all();

        if ( $mailer ) $this->sendEmail($id, 'synced', $entity, $entityId, $items);
        return $items;

    }
    public function detachData ( int $id, string $entity = null, int $entityId = null, array $params = [], bool $mailer = false ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, $params);

        $items = collect($services)->mapWithKeys(function($service) use ($storeId, $options) {
            
            $items = $service->query(...$options)->getResult()->map(function ($item) use ($storeId, $service) {

                if ( $item->ref_id ) return $service->baseRepository->update($item->id, ['ref_id' => 0], strict: false);

            })->filter()->all();
        
            if ( $items ) $service->deleteCache();
            return $items;

        })->filter()->all();

        if ( $mailer ) $this->sendEmail($id, 'detached', $entity, $entityId, $items);
        return $items;

    }
    public function removeData ( int $id, string $entity = null, int $entityId = null, array $params = [], bool $mailer = false ) {

        [$storeId, $options, $entity, $services] = $this->context($id, $entity, $entityId, $params);

        $items = collect($services)->mapWithKeys(function($service) use ($storeId, $options) {
            
            $items = $service->query(...$options)->getResult()->map(function ($item) use ($storeId, $service) {

                if ( $item->ref_id && $service->baseRepository->delete($item->id) ) return $item;

            })->filter()->all();
        
            if ( $items ) $service->deleteCache();
            return $items;

        })->filter()->all();

        if ( $mailer ) $this->sendEmail($id, 'removed', $entity, $entityId, $items);
        return $items;

    }

    public function import ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        $this->runJob([static::class, 'importData'], [$id, $entity, $entityId, $params, true]);
        return success();

    }
    public function sync ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        $this->runJob([static::class, 'syncData'], [$id, $entity, $entityId, $params, true]);
        return success();

    }
    public function detach ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        $this->runJob([static::class, 'detachData'], [$id, $entity, $entityId, $params, true]);
        return success();

    }
    public function remove ( int $id, string $entity = null, int $entityId = null, array $params = [] ) {

        $this->runJob([static::class, 'removeData'], [$id, $entity, $entityId, $params, true]);
        return success();

    }
    public function syncEntity ( Model $entity, array $params = [] ) {

        $entityService  = app("App\\Services\\" . studly($entity->getModelName()) . "Service");
        $entityRef = $this->withoutTenant(fn() => $entityService->find($entity->ref_id, fail: false));

        $provider = $this->providerRepository->findBy('supplier_id', $entityRef?->store_id, ['active']);
        if ( $provider ) return $this->sync($provider->id, $entity->getModelName(), $entity->id, $params);

    }

}
