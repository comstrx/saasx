<?php

namespace App\Http\Requests;

class StoreRequest extends BaseRequest {

    public function setRules () {

        return [
            'name'           => $this->nameRule(),
            'email'          => $this->emailRule(),
            'phone'          => $this->stringRule(),
            'admin_name'     => $this->nameRule(),
            'admin_phone'    => $this->stringRule(),
            'admin_email'    => $this->emailRule( $this->isMethod('post') ),
            'admin_password' => $this->passwordRule( $this->isMethod('post') ),
            'domain_name'    => $this->stringRule(),
            'plan_id'        => $this->existsRule('plans', 'id', $this->isMethod('post'), false),
            'duration'       => $this->enumRule(['monthly', 'yearly', 'lifetime'], $this->isMethod('post')),
        ];

    }

}
