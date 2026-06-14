<?php

namespace App\Repositories;
use App\Models\Social;
use App\Models\User;

class SocialRepository extends BaseRepository {

    public function __construct( Social $model, protected UserRepository $userRepository ) { parent::__construct($model); }

    public function attach ( User $user, array $data = [] ) {

        $data = optional($data);

        return parent::updateOrCreate(
            [
                'user_id'       => $user->id,
                'provider_name' => string($data['provider_name']),
                'provider_id'   => string($data['provider_id']),
                'email'         => string($data['email']),
            ],
            [
                'name'  => string($data['name']),
                'phone' => string($data['phone']),
                'image' => string($data['image']),
            ]
        );

    }
    public function unattach ( User $user, string $provider = null ) {

        return parent::query()
            ->where('user_id', $user->id)
            ->when($provider, fn($q) => $q->where('provider_name', $provider))
            ->delete();

    }
    public function findRecord ( array $data = [] ) {

        return parent::query()
            ->where('provider_name', $data['provider_name'] ?? '')
            ->where('provider_id', $data['provider_id'] ?? '')
            ->where('email', $data['email'] ?? '')
            ->first();

    }
    public function findUser ( array $data = [] ) {

        $record = $this->findRecord($data);
        if ( $record ) return $record->user;

        if ( $this->userRepository->emailExists($data['email']) ) return;
        return $this->userRepository->createUser($data);

    }
    public function register ( array $data = [] ) {

        $user = $this->findUser($data);
        if ( $user ) return $this->attach($user, $data);

    }

}
