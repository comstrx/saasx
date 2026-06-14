<?php

namespace App\Services;
use App\Repositories\AccessTokenRepository;
use App\Repositories\SocialRepository;
use App\Repositories\ResetRepository;
use App\Repositories\UserRepository;
use App\Models\User;

class AuthService extends BaseService {

    public function __construct(
        protected AccessTokenRepository $accessTokenRepository,
        protected UserRepository $userRepository,
        protected ResetRepository $resetRepository,
        protected SocialRepository $socialRepository,
        protected VerificationService $verificationService,
        protected SettingService $settingService
    ) { parent::__construct($userRepository); }

    public function info ( User $user ) {

        $this->userRepository->updateLogin($user);
        return success(['user' => $user->toResource(), 'token' => $this->accessTokenRepository->newToken($user)]);

    }
    public function verify ( User $user, string $type, string $over ) {

        $this->verificationService->verify($user, $type, $over);
        return success(['user' => ['email' => $user->email, 'phone' => $user->phone], 'verifying_over' => $over]);

    }
    public function register ( string $role, array $data, bool $verify = true ) {

        if ( $this->userRepository->emailExists($data['email'] ?? '') ) return failed(['email' => 'email exists']);

        $user = $this->userRepository->createUser( array_merge($data, ['role' => $role]) );
        $this->settingService->handleCommission($user, 'register');

        return $verify ? $this->verify($user, 'auth', 'email') : $this->info($user);

    }
    public function login ( string $role, array $data, bool $verify = true ) {

        $user = $this->userRepository->findByEmail($data['email'] ?? '', $role);
        if ( !$user ) return failed(['account' => 'invalid account']);
        if ( !$user->isAllowed() ) return permissionFailed();

        $checked = $this->userRepository->checkPassword($user, $data['password'] ?? '');
        if ( !$checked ) return failed(['password' => 'invalid password']);

        return $verify ? $this->verify($user, 'auth', 'email') : $this->info($user);

    }
    public function confirmCode ( string $role, string $code ) {

        // if ( $code === '111111' ) $user = $this->userRepository->query()->client()->first();
        $user = $this->verificationService->confirm($code, 'auth')?->user;
        
        if ( !$user ) return failed(['code' => 'invalid code']);
        if ( !$user->hasRole($role) || !$user->isAllowed() ) return permissionFailed();

        return $this->info($user);

    }
    public function socialLogin ( string $role, array $data ) {
        
        $social = $this->socialRepository->register([...$data, 'role' => $role]);
        if ( !$social?->active || !$social->user?->hasRole($role) || !$social->user?->isAllowed() ) return permissionFailed();
        return $this->info($social->user);

    }
    public function recoveryAccount ( string $role, string $email ) {

        $user = $this->userRepository->findByEmail($email, $role);

        if ( !$user ) return failed(['account' => 'invalid account']);
        if ( !$user->hasRole($role) || !$user->isAllowed() ) return permissionFailed();

        $token = $this->resetRepository->newToken(['user_id' => $user->id]);
        send_email($user, $token, 'recovery');
        return success();

    }
    public function resetPassword ( string $role, string $token, string $password ) {

        $token = $this->resetRepository->findByName($token);
    
        if ( !$token?->user ) return failed(['token' => 'invalid token']);
        if ( !$token->user->hasRole($role) || !$token->user->isAllowed() ) return permissionFailed();

        $this->userRepository->updatePassword($token->user, $password);
     
        $this->logoutAll($token->user);
        $token->delete();
    
        return success();

    }
    public function checkResetToken ( string $token ) {

        return $this->resetRepository->findByName($token) ? success() : notFoundFailed('token');

    }
    public function checkEmail ( string $email ) {

        return $this->userRepository->emailExists($email) ? success() : notFoundFailed('email');

    }
    public function unlock ( array $data ) {

        return $this->login( user_role(), array_merge(['email' => user_email()], $data), false );

    }
    public function logout () {

        $this->accessTokenRepository->deleteCurrentToken( user() );
        $this->deleteCache();
        return success();

    }
    public function logoutAll () {

        $this->accessTokenRepository->deleteToken( user() );
        $this->deleteCache();
        return success();

    }
    public function logoutOthers () {

        $this->accessTokenRepository->deleteOtherTokens( user() );
        $this->deleteCache();
        return success();

    }

}
