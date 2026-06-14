<?php

namespace App\Http\Resources;

class LogResource extends BaseResource {

    public function data () {

        return [
            'ip'    => $this->ip,
            'agent' => $this->agent,
            'event' => $this->event,
            'name'  => $this->getRelatedName(),
        ];

    }
    public function relations () {

        return [
            'user' => UserResource::info( $this->user ),
            $this->getRelatedName() => $this->makeRelatedResource(),
        ];

    }

}
