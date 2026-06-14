<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory {

    public function definition () {

        return [
            'store_id' => 1,
            'name' => fake()->name(),
            'email' => fake()->unique()->email(),
            'password' => Hash::make('codingmaster'),
            'phone' => fake()->phoneNumber(),
            'language' => fake()->languageCode(),
            'country' => fake()->countryCode(),
            'city' => fake()->city(),
            'ip' => fake()->ipv4(),
            'agent' => fake()->userAgent(),
        ];

    }
    public function admin () {

        return $this->state(function (array $attributes) {
            return ['role' => 'admin'];
        });

    }
    public function vendor () {
        
        return $this->state(function (array $attributes) {
            return ['role' => 'vendor'];
        });

    }
    public function client () {
        
        return $this->state(function (array $attributes) {
            return ['role' => 'client'];
        });

    }

}
