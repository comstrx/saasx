<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;

class GameFactory extends Factory {

    public function definition () {

        return [
            'store_id'    => 1,
            'name'        => $this->localizedWords(),
            'company'     => $this->localizedWords(),
            'location'    => $this->localizedWords(),
            'description' => $this->localizedParagraph(),
            'details'     => $this->localizedParagraph(),
            'includes'    => $this->localizedBulletList(),
            'policy'      => $this->localizedParagraph(),
            'fields'      => ['uid', 'region'],

            'language'    => $this->faker->languageCode(),
            'phone'       => $this->faker->phoneNumber(),
            'notes'       => $this->faker->optional()->sentence(),

            'views'       => $this->faker->numberBetween(0, 5000),
            'likes'       => $this->faker->numberBetween(0, 1000),
            'dislikes'    => $this->faker->numberBetween(0, 300),
        ];

    }
    protected function localizedWords () {

        return [
            'en' => $this->faker->words(2, true),
            'ar' => fake('ar_SA')->words(2, true),
            'fr' => fake('fr_FR')->words(2, true),
        ];

    }
    protected function localizedParagraph () {

        return [
            'en' => $this->faker->paragraph(),
            'ar' => fake('ar_SA')->paragraph(),
            'fr' => fake('fr_FR')->paragraph(),
        ];

    }
    protected function localizedBulletList () {

        return [
            'en' => $this->faker->sentences(3),
            'ar' => fake('ar_SA')->sentences(3),
            'fr' => fake('fr_FR')->sentences(3),
        ];

    }

}
