<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class DomainFactory extends Factory {

    public function definition () {

        return [
            'store_id' => 1,
            'zone_id'  => 1,
        ];

    }
    public function client () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.client.name'),
                'dest' => 'client',
            ];
        });

    }
    public function admin () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.admin.name'),
                'dest' => 'admin',
            ];
        });

    }
    public function vendor () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.vendor.name'),
                'dest' => 'vendor',
            ];
        });

    }
    public function blog () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.blog.name'),
                'dest' => 'blog',
            ];
        });

    }
    public function app () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.app.name'),
                'dest' => 'app',
            ];
        });

    }
    public function api () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.api.name'),
                'dest' => 'api',
            ];
        });

    }
    public function cdn () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.cdn.name'),
                'dest' => 'cdn',
            ];
        });

    }
    public function local () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.local.name'),
            ];
        });

    }
    public function ip () {

        return $this->state(function (array $attributes) {
            return [
                'name' => config('settings.default.domains.ip.name'),
            ];
        });

    }

}
