<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class CouponFactory extends Factory {

    public function definition () {

        $discountType = $this->faker->randomElement(['fixed', 'percentage']);
        $discount = $discountType === 'percentage' ? $this->faker->numberBetween(5, 50) : $this->faker->randomFloat(2, 5, 100);

        return [
            'store_id'      => 1,
            'discount_type' => $discountType,
            'discount'      => $discount,
            'max_discount'  => $discountType === 'percentage' ? 100 : $discount * 2,
            'name'          => ['en' => $this->faker->words(3, true), 'ar' => $this->faker->words(3, true)],
            'description'   => ['en' => $this->faker->sentence(), 'ar' => $this->faker->sentence()],
            'code'          => strtoupper($this->faker->bothify('COUPON-####')),
            'points'        => $this->faker->numberBetween(0, 1000),
            'expires_at'    => $this->faker->optional()->dateTimeBetween('now', '+6 months'),
        ];
    }

}
