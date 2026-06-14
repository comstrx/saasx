<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiteInfoFactory extends Factory {

    public function definition () {

        return [
            'store_id'   => 1,
            'name'       => $this->faker->company(),
            'email'      => $this->faker->unique()->companyEmail(),
            'phone'      => $this->faker->phoneNumber(),
            'country'    => $this->faker->country(),
            'city'       => $this->faker->city(),
            'street'     => $this->faker->streetAddress(),
            'zip_code'   => $this->faker->postcode(),
            'longitude'  => $this->faker->longitude(),
            'latitude'   => $this->faker->latitude(),
            'language'   => 'en',
            'currency'   => $this->faker->randomElement(['USD','EUR','GBP','SAR','EGP']),
            'theme'      => $this->faker->randomElement(['light','dark','default']),
            'copyright'  => "© ".date('Y')." ".$this->faker->company(),

            'contacts' => [
                ['name' => 'email1', 'value' => $this->faker->unique()->companyEmail()],
                ['name' => 'phone1', 'value' => $this->faker->phoneNumber()],
            ],
            'socials' => [
                ['name' => 'facebook',     'url' => 'https://facebook.com/'.$this->faker->slug(2)],
                ['name' => 'whatsapp',     'url' => 'https://wa.me/'.$this->faker->numerify('##########')],
                ['name' => 'youtube',      'url' => 'https://youtube.com/'.$this->faker->slug(2)],
                ['name' => 'instagram',    'url' => 'https://instagram.com/'.$this->faker->slug(2)],
                ['name' => 'twitter',      'url' => 'https://twitter.com/'.$this->faker->slug(2)],
                ['name' => 'telegram',     'url' => 'https://telegram.com/'.$this->faker->slug(2)],
            ],
            'downloads' => [
                ['name' => 'android', 'url' => 'https://play.google.com/store/apps/details?id='.$this->faker->slug()],
                ['name' => 'ios',     'url' => 'https://apps.apple.com/app/'.$this->faker->slug()],
                ['name' => 'windows', 'url' => 'https://example.com/download/windows-'.$this->faker->slug()],
                ['name' => 'macos',   'url' => 'https://example.com/download/macos-'.$this->faker->slug()],
            ],
            'partners' => [
                ['name' => 'SafeShell VPN',  'url' => 'https://www.safeshellvpn.com'],
                ['name' => 'GearUP Booster', 'url' => 'https://www.gearupbooster.com/'],
            ],
        ];

    }

}
