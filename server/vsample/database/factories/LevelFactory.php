<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\LevelFeature;

class LevelFactory extends Factory {

    public function definition () {

        static $rankCounter = 1;

        return [
            'store_id'        => 1,
            'rank'            => $rankCounter++,
            'color'           => $this->faker->safeHexColor(),
            'type'            => $this->faker->randomElement(['public', 'private']),
            'cashback_type'   => $this->faker->randomElement(['fixed', 'percentage']),
            'cashback'        => $this->faker->randomFloat(2, 1, 10),
            'max_cashback'    => $this->faker->randomFloat(2, 50, 500),
            'min_points'      => $this->faker->numberBetween(0, 1000),
            'min_orders'      => $this->faker->numberBetween(0, 50),
            'min_deposits'    => $this->faker->numberBetween(0, 20),
            'min_referrals'   => $this->faker->numberBetween(0, 10),
            'name'            => ['en' => $this->faker->word(), 'ar' => $this->faker->word()],
            'description'     => ['en' => $this->faker->sentence(), 'ar' => $this->faker->sentence()],
            'conditions'      => [],
        ];

    }
    public function configure () {

        return $this->afterCreating(function ( $level ) {
            
            $level->attachments()->create(['path' => 'product/' . rand(1, 10) . '.png', 'store_id' => $level->store_id]);
            LevelFeature::factory()->count(10)->for($level)->create();

        });

    }

}
