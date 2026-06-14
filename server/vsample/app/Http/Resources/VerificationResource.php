<?php

namespace App\Http\Resources;

class VerificationResource extends BaseResource {

    public function data () {

        return [
            'code'        => $this->code,
            'type'        => $this->type,
            'ip'          => $this->ip,
            'agent'       => $this->agent,
            'attempts'    => $this->attempts,
            'verified'    => $this->verified,
            'verified_at' => $this->formatDate('verified_at'),
            'expires_at'  => $this->formatDate('expires_at'),
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
        ];

    }

}
