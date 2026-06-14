<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class LevelFeatureFactory extends Factory {

    public function definition () {

        static $rankCounter = 1;

        return [
            'store_id'     => 1,
            'level_id'     => null,
            'name'         => ['en' => $this->faker->words(2, true), 'ar' => $this->faker->words(2, true)],
            'description'  => ['en' => $this->faker->sentence(), 'ar' => $this->faker->sentence()],
            'benefits'     => [
                'discount'         => $this->faker->numberBetween(5, 20),
                'cashback'         => $this->faker->numberBetween(1, 10),
                'priority_support' => $this->faker->boolean(80),
                'free_shipping'    => $this->faker->boolean(50),
                'coupons'          => true,
            ],
        ];

    }
    public function configure () {

        return $this->afterCreating(function ( $levelFeature ) {
            
            $levelFeature->attachments()->create(['path' => 'category/' . rand(1, 10) . '.png', 'store_id' => $levelFeature->store_id]);

        });

    }

}
