<?php

namespace App\Services;
use App\Repositories\UserRepository;
use App\Repositories\AccessTokenRepository;
use App\Repositories\SocialRepository;

class AccountService extends BaseService {

    public function __construct(
        protected UserRepository $userRepository,
        protected SocialRepository $socialRepository,
        protected AccessTokenRepository $accessTokenRepository
    ) { parent::__construct($userRepository); }
   
    public function getResource () {

        return $this->successRemember(
            key: ['id' => user_id(), 'type' => 'resource'],
            callback: fn() => ['user' => user()->toResource()->toArray(request())]
        );

    }
    public function info () {

        return $this->successRemember(
            key: ['id' => user_id(), 'type' => 'info'],
            callback: fn() => ['user' => $this->resource::info(user())]
        );

    }
    public function updateName ( array $data = [] ) {

        $this->userRepository->updateName(user(), $data['name'] ?? '');
        $this->deleteCache();
        return success();

    }
    public function updatePhone ( array $data = [] ) {

        $this->userRepository->updatePhone( user(), $data['phone'] ?? '');
        $this->deleteCache();
        return success();

    }
    public function updateEmail ( array $data = [] ) {

        [$email, $password, $logout] = [$data['email'] ?? '', $data['password'] ?? '', bool($data['logout'] ?? false)];

        if ( user_email() !== $email && $this->userRepository->emailExists($email) ) return failed(['email' => 'email exists']);
        if ( user()->password && !$this->userRepository->checkPassword(user(), $password) ) return failed(['password' => 'invalid password']);

        $this->userRepository->updateEmail( user(), $email, $password );
        if ( $logout ) $this->accessTokenRepository->deleteOtherTokens(user());

        $this->deleteCache();
        return success();

    }
    public function updatePassword ( array $data = [] ) {

        [$old_password, $password, $logout] = [$data['old_password'] ?? '', $data['password'] ?? '', bool($data['logout'] ?? false)];

        if ( !$this->userRepository->checkPassword(user(), $old_password) ) return failed(['old_password' => 'invalid old password']);
        if ( $this->userRepository->checkPassword(user(), $password) ) return failed(['new_password' => 'similar passwords']);
    
        $this->userRepository->updatePassword(user(), $password);
        if ( $logout ) $this->accessTokenRepository->deleteOtherTokens(user());

        $this->deleteCache();
        return success();

    }
    public function updateLocation ( array $data = [] ) {

        $this->userRepository->updateLocation(user(), $data);
        $this->deleteCache();
        return success();

    }
    public function updateSettings ( array $data = [] ) {

        $this->userRepository->updateSettings(user(), $data);
        $this->deleteCache();
        return success();

    }
    public function updateField ( string $field = null, array $data = [] ) {

        return match ( $field ) {
            'name' => $this->updateName($data),
            'phone' => $this->updatePhone($data),
            'email' => $this->updateEmail($data),
            'password' => $this->updatePassword($data),
            'location' => $this->updateLocation($data),
            'settings' => $this->updateSettings($data),
            default => $field ? failed([$field => "cannot udpate {$field}"]) : notFoundFailed('field')
        };

    }
    public function getField ( string $field = null ) {

        $data = $this->getResource()->original['user'] ?? [];
        return array_key_exists($field, $data) ? success([$field => $data[$field]]) : notFoundFailed($field);

    }
    public function changeImage ( $image ) {

        return parent::updateImage(user_id(), $image);

    }
    public function resetImage () {

        return parent::deleteImage(user_id());

    }
    public function attachSocial ( array $data = [] ) {
        
        if ( !$this->socialRepository->attach(user(), $data)?->active ) return permissionFailed();
        $this->deleteCache();
        return $this->getField('socials');

    }
    public function unattachSocial ( string $provider = null ) {

        if ( $this->socialRepository->unattach(user(), $provider) ) $this->deleteCache();
        return success();

    }

}
