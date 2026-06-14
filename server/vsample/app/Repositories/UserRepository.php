<?php

namespace App\Repositories;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserRepository extends BaseRepository {

    public function __construct( User $model, protected ReferralRepository $referralRepository ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        $params = [
            'store_id'   => $data['store_id'],
            'admin_id'   => integer($data['admin_id']),
            'role'       => string($data['role'] ?? 'client'),
            'name'       => string($data['name']),
            'email'      => string($data['email']),
            'phone'      => string($data['phone']),
            'country'    => string($data['country']),
            'city'       => string($data['city']),
            'street'     => string($data['street']),
            'state'      => string($data['state']),
            'zip_code'   => string($data['zip_code']),
            'address'    => string($data['address']),
            'gender'     => string($data['gender']),
            'language'   => string($data['language']),
            'currency'   => string($data['currency']),
            'theme'      => string($data['theme']),
            'notes'      => string($data['notes']),
            'birth_date' => string($data['birth_date']),
            'longitude'  => float($data['longitude'], 7),
            'latitude'   => float($data['latitude'], 7),
            'ip'         => ip(),
            'agent'      => agent(),
        ];

        if ( string($data['password']) ) $params['password'] = Hash::make(string($data['password']));
        return $params;

    }
    public function createSuperAdmin ( array $data = [] ) {

        $user = parent::create([
            'role'     => 'admin',
            'store_id' => $data['store_id'] ?? null,
            'name'     => $data['name'] ?? config('settings.default.admins.super.name'),
            'email'    => $data['email'] ?? config('settings.default.admins.super.email'),
            'phone'    => $data['phone'] ?? config('settings.default.admins.super.phone'),
            'password' => $data['password'] ?? config('settings.default.admins.super.password'),
        ]);

        $this->model->setTenant($user->store_id, callback: fn() => $user->allow('super', 'supervisor'));
        return $user;

    }
    public function createUser ( array $data = [] ) {

        $user = parent::create($data);

        $referrer_id = integer($data['referrer_id'] ?? null);
        if ( $referrer_id ) $this->referralRepository->newReferral($user, parent::find($referrer_id));

        return $user;
        
    }
    public function updatePassword ( User $user, string $password ) {

        return $user->update(['password' => Hash::make($password)]);

    }
    public function updateLogin ( User $user ) {

        return $user->update(['login_at' => utc_date()]);

    }
    public function updateName ( User $user, string $name ) {

        return $user->update(['name' => $name]);

    }
    public function updateEmail ( User $user, string $email, string $password ) {

        return $user->update(['email' => $email, 'password' => Hash::make($password), 'email_verified' => false]);

    }
    public function updatePhone ( User $user, string $phone ) {

        return $user->update(['phone' => $phone, 'phone_verified' => false]);

    }
    public function updateSettings ( User $user, array $data ) {

        return $user->update([
            'gender'     => string($data['gender'] ?? $user->gender),
            'language'   => string($data['language'] ?? $user->language),
            'currency'   => string($data['currency'] ?? $user->currency),
            'theme'      => string($data['theme'] ?? $user->theme),
            'birth_date' => string($data['birth_date'] ?? $user->birth_date),
        ]);

    }
    public function updateLocation ( User $user, array $data ) {

        $data = [
            'country'   => string($data['country'] ?? $user->country),
            'city'      => string($data['city'] ?? $user->city),
            'street'    => string($data['street'] ?? $user->street),
            'state'     => string($data['state'] ?? $user->state),
            'zip_code'  => string($data['zip_code'] ?? $user->zip_code),
            'address'   => string($data['address'] ?? $user->address),
            'longitude' => float($data['longitude'] ?? $user->longitude, 7),
            'latitude'  => float($data['latitude'] ?? $user->latitude, 7),
        ];
        if ( !$data['longitude'] && ($data['country'] || $data['city']) ) {
            
            $geoLocation = location("{$data['street']}, {$data['city']}, {$data['country']}");
            $data['longitude'] = $geoLocation['longitude'] ?? 0;
            $data['latitude']  = $geoLocation['latitude'] ?? 0;

        }

        return $user->update($data);

    }
    public function findByEmail ( string $email, string $role = null ) {

        return parent::query()->where('email', $email)->when($role, fn($q) => $q->where('role', $role))->first();

    }
    public function emailExists ( string $email ) {

        return parent::query()->where('email', $email)->exists();

    }
    public function checkPassword ( User $user, string $password ) {

        return Hash::check($password, $user->password);

    }

}
