<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogFactory extends Factory {

    public function definition () {

        return [
            'store_id'    => 1,
            'title'       => $this->localizedTexts('Blog'),
            'content'     => $this->localizedHtmlContent(),
            'description' => $this->localizedTexts('Description'),
            'location'    => $this->localizedTexts('Location'),
            'language'    => $this->faker->languageCode(),
            'phone'       => $this->faker->phoneNumber(),
            'country'     => $this->faker->country(),
            'city'        => $this->faker->city(),
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
    protected function htmlContent( $faker ) {

        $image = "https://source.unsplash.com/800x400/?nature,article";

        $paragraphs = collect($faker->paragraphs(3))
            ->map(fn($p) => "<p>{$p}</p>")
            ->implode('');

        $link = '<a href="' . $faker->url . '" target="_blank">' . $faker->word . '</a>';
        $span = '<span style="color: #' . $faker->hexColor . ';">' . $faker->word . '</span>';
        $blockquote = '<blockquote>' . $faker->sentence . '</blockquote>';
        $code = '<pre><code>' . htmlentities('<?php echo "Hello, World!"; ?>') . '</code></pre>';

        return "
            <h2>{$faker->sentence}</h2>
            <img src=\"{$image}\" alt=\"Article Image\" style=\"max-width:100%; height:auto; margin: 1rem 0;\" />
            {$paragraphs}
            {$blockquote}
            {$code}
            <p>Read more at: {$link}</p>
            <p>Highlight: {$span}</p>
        ";

    }
    protected function localizedHtmlContent () {

        return [
            'en' => $this->htmlContent($this->faker),
            'ar' => $this->htmlContent(fake('ar_SA')),
            'fr' => $this->htmlContent(fake('fr_FR')),
        ];

    }

}
