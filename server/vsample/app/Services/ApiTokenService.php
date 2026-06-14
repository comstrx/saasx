<?php

namespace App\Services;
use App\Repositories\AccessTokenRepository;
use App\Repositories\ApiTokenRepository;

class ApiTokenService extends BaseService {

    public function __construct(
        protected ApiTokenRepository $apiTokenRepository,
        protected AccessTokenRepository $accessTokenRepository,
        protected StoreService $storeService,
    ) { parent::__construct($apiTokenRepository); }

    public function current () {

        return success(['item' => user()->apiTokens()->active()->latest('id')->firstOrFail()->toResource()]);

    }
    public function new ( array $params = [] ) {

        return $this->show(user()->createApiToken($params)?->id ?? 0);

    }
    public function reset ( array $params = [] ) {

        user()->apiTokens()->delete();
        return $this->new($params);

    }
    public function newAccessToken ( array $headers = [] ) {

        $token = $this->apiTokenRepository->findByHeader($headers['Authorization'] ?? null);
        if ( !$token ) return authorizeFailed();

        if (
            !$token->user?->active || !$token->store?->active ||
            !$token->user->has('allow_apis') || !$token->store->has('allow_apis') ||
            !$this->storeService->subscribed($token->store)
        ) return permissionFailed();
        
        $accessToken = $this->remember(
            key: [...$headers, 'id' => $token->user->id],
            callback: fn() => $this->accessTokenRepository->newToken($token->user, 'api')
        );

        $token->update(['last_used_at' => utc_date()]);
        return success(['token' => $accessToken]);

    }

}
