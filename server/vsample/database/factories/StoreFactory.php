<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreFactory extends Factory {

    public function definition () {

        return [
            'name' => env('APP_NAME', 'Main Store'),
            'email' => 'info@main-store',
            'phone' => '+201099188572',
        ];

    }

}
