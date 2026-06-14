<?php

namespace App\Repositories;
use App\Models\SiteInfo;

class SiteInfoRepository extends BaseRepository {

    public function __construct( SiteInfo $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'name'      => string(data_get($data, 'name')),
            'email'     => string(data_get($data, 'email')),
            'phone'     => string(data_get($data, 'phone')),
            'country'   => string(data_get($data, 'country')),
            'city'      => string(data_get($data, 'city')),
            'street'    => string(data_get($data, 'street')),
            'zip_code'  => string(data_get($data, 'zip_code')),
            'language'  => string(data_get($data, 'language')),
            'currency'  => string(data_get($data, 'currency')),
            'theme'     => string(data_get($data, 'theme')),
            'copyright' => string(data_get($data, 'copyright')),
            'socials'   => data_get($data, 'socials'),
            'partners'  => data_get($data, 'partners'),
            'downloads' => data_get($data, 'downloads'),
            'contacts'  => data_get($data, 'contacts'),
        ];

    }

}
