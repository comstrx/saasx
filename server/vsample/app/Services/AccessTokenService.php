<?php

namespace App\Services;
use App\Repositories\AccessTokenRepository;

class AccessTokenService {

    public function __construct( protected AccessTokenRepository $accessTokenRepository ) {}

    public function index () {
        
        return success(['items' => $this->accessTokenRepository->allTokens(user())->toResourceCollection()]);

    }
    public function show ( int $id ) {
        
        return success(['item' => $this->accessTokenRepository->findById(user(), $id)->toResource()]);

    }
    public function delete ( int $id ) {

        $this->accessTokenRepository->deleteToken( user(), id: $id );
        return success();

    }
    public function deleteBatch ( array $ids = [] ) {

        $this->accessTokenRepository->deleteToken( user(), id: $ids );
        return success();

    }
    public function deleteCurrentToken () {

        $this->accessTokenRepository->deleteCurrentToken( user() );
        return success();

    }
    public function deleteOtherTokens () {

        $this->accessTokenRepository->deleteOtherTokens( user() );
        return success();

    }
   
}
