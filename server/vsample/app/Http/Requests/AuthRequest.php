<?php

namespace App\Http\Requests;

class AuthRequest extends BaseRequest {

    public function setRules () {

        return [
            'name'          => $this->nameRule(),
            'phone'         => $this->phoneRule(),
            'image'         => $this->stringRule(),
            'email'         => $this->emailRule( !$this->isRoute('auth.reset') ),
            'provider_name' => $this->stringRule( $this->isRoute('auth.social'), args: 'in:google,facebook,github'),
            'provider_id'   => $this->stringRule( $this->isRoute('auth.social') ),
            'password'      => $this->isRoute(['register', 'auth.reset']) ? $this->passwordRule(true) : $this->passwordRule($this->isRoute('login'), false, false)
        ];

    }

}
