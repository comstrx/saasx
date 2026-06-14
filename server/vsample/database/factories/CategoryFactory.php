<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory {

    public function definition () {

        return [
            'store_id'    => 1,
            'name'        => $this->localizedTexts('Category'),
            'company'     => $this->localizedTexts('Company'),
            'location'    => $this->localizedTexts('Location'),
            'description' => $this->localizedTexts('Description'),
            'phone'       => $this->faker->phoneNumber(),
            'views'       => $this->faker->numberBetween(0, 5000),
            'likes'       => $this->faker->numberBetween(0, 1000),
            'dislikes'    => $this->faker->numberBetween(0, 300),
        ];

    }
    protected function localizedTexts ( string $prefix ) {

       return [
            'en' => $this->faker->words(2, true),
            'ar' => fake('ar_SA')->words(2, true),
            'fr' => fake('fr_FR')->words(2, true),
        ];

    }

}
