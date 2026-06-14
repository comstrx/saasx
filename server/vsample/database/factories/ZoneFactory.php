<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class ZoneFactory extends Factory {

    public function definition () {

        return [
            'store_id'    => 1,
            'status'      => 'verified',
            'name'        => config('settings.default.domains.base.name'),
            'ns1'         => config('settings.default.cloudflare.domain.ns1'),
            'ns2'         => config('settings.default.cloudflare.domain.ns2'),
            'provider_id' => config('settings.default.cloudflare.domain.id'),
        ];

    }

}
