<?php

namespace App\Http\Resources;

class SiteInfoResource extends BaseResource {

    public function data () {

        return [
            'logo'      => $this->getImage(),
            'qrcode'    => $this->getQrcode(),
            'name'      => $this->name,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'country'   => $this->country,
            'city'      => $this->city,
            'street'    => $this->street,
            'zip_code'  => $this->zip_code,
            'longitude' => $this->longitude,
            'latitude'  => $this->latitude,
            'language'  => $this->language,
            'currency'  => $this->currency,
            'theme'     => $this->theme,
            'copyright' => $this->copyright,
            'socials'   => $this->socials,
            'partners'  => $this->partners,
            'downloads' => $this->downloads,
            'contacts'  => $this->contacts,
        ];

    }

}
