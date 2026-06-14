<?php

namespace App\Http\Resources;

class UserResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'role'  => $data->role,
            'level' => $data->level,
            'name'  => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
        ];

    }
    public function data () {
       
        return [
            'gender'            => $this->gender,
            'language'          => $this->language,
            'currency'          => $this->currency,
            'theme'             => $this->theme,
            'country'           => $this->country,
            'city'              => $this->city,
            'street'            => $this->street,
            'state'             => $this->state,
            'zip_code'          => $this->zip_code,
            'address'           => $this->address,
            'longitude'         => $this->longitude,
            'latitude'          => $this->latitude,
            'ip'                => $this->ip,
            'agent'             => $this->agent,
            'email_verified'    => $this->email_verified,
            'phone_verified'    => $this->phone_verified,
            'identity_verified' => $this->identity_verified,
            'verified'          => $this->isVerified(),
            'login_at'          => $this->formatDate('login_at'),
            'birth_date'        => $this->formatDate('birth_date'),
        ];

    }
    public function relations () {

        return [
            'permissions' => $this->allowedPermissions(),
            ...(
                $this->role === 'admin' ? [] : [
                    'wallet'    => WalletResource::info( $this->wallet ),
                    'api_token' => ApiTokenResource::info( $this->apiToken ),
                    'referrer'  => UserResource::info( $this->referrer ),
                    'referrals' => $this->referralsCount(),
                    'coupons'   => $this->couponsCount(),
                    'orders'    => $this->ordersCount(),
                    'reviews'   => $this->reviewsCount(),
                    'socials'   => SocialResource::collectionInfo( $this->socials ),
                ]
            )
        ];

    }

}
