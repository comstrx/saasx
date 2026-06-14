<?php

namespace App\Http\Requests;

class UserRequest extends BaseRequest {

    public function setRules () {

        return [
            'name'       => $this->nameRule(),
            'email'      => $this->emailRule(),
            'phone'      => $this->phoneRule(),
            'country'    => $this->countryRule(),
            'city'       => $this->stringRule(),
            'state'      => $this->stringRule(),
            'street'     => $this->stringRule(),
            'zip_code'   => $this->zipRule(),
            'address'    => $this->stringRule(),
            'gender'     => $this->genderRule(),
            'language'   => $this->languageRule(),
            'currency'   => $this->currencyRule(),
            'theme'      => $this->themeRule(),
            'longitude'  => $this->longitudeRule(),
            'latitude'   => $this->latitudeRule(),
            'birth_date' => $this->dateRule(format: 'Y-m-d', args: 'before:today'),
            'password'   => $this->checkRoute('field', 'password') ? $this->passwordRule(true) : $this->passwordRule($this->checkRoute('field', 'email'), false, false),
        ];

    }

}
