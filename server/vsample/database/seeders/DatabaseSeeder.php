<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Jobs\SeedingStoreData;
use App\Models\Zone;
use App\Models\Domain;
use App\Models\Store;
use App\Models\Plan;
use App\Models\User;
use App\Models\Category;
use App\Models\Game;
use App\Models\Product;
use App\Models\Blog;
use App\Models\Coupon;
use App\Models\Level;

class DatabaseSeeder extends Seeder {

    public function run () {

        dispatch(new SeedingStoreData( Store::factory()->create() ));

        User::factory()->client()->create();

        Plan::factory()->premium()->create();
        Plan::factory()->pro()->create();
        Plan::factory()->basic()->create();

        Zone::factory()->create();
        Domain::factory()->client()->create();
        Domain::factory()->admin()->create();
        Domain::factory()->vendor()->create();
        Domain::factory()->blog()->create();
        Domain::factory()->app()->create();
        Domain::factory()->api()->create();
        Domain::factory()->cdn()->create();
        Domain::factory()->local()->create();
        Domain::factory()->ip()->create();

        Coupon::factory()->count(5)->create();
        Level::factory()->count(5)->create();

        Category::factory()->count(2)->create()->each(function( $category ) {

            $category->attachments()->create(['path' => 'category/' . rand(1, 10) . '.png', 'store_id' => $category->store_id]);

            Game::factory()->count(2)->create(['category_id' => $category->id])->each(function ( $game ) {

                for ( $i = 0; $i < 3; $i++ ) $game->attachments()->create(['path' => 'game/' . rand(1, 10) . '.png', 'store_id' => $game->store_id]);

                Product::factory()->count(2)->create(['game_id' => $game->id])->each(function ( $product ) {

                    for ( $i = 0; $i < 3; $i++ ) $product->attachments()->create(['path' => 'product/' . rand(1, 10) . '.png', 'store_id' => $product->store_id]);

                });

            });

        });
        Category::factory()->count(2)->create()->each(function( $category ) {

            $category->attachments()->create(['path' => 'category/' . rand(1, 10) . '.png', 'store_id' => $category->store_id]);

            Game::factory()->count(2)->create(['category_id' => $category->id, 'type' => 'gift_card'])->each(function ( $game ) {

                for ( $i = 0; $i < 3; $i++ ) $game->attachments()->create(['path' => 'game/' . rand(1, 10) . '.png', 'store_id' => $game->store_id]);

                Product::factory()->count(2)->create(['game_id' => $game->id])->each(function ( $product ) {

                    for ( $i = 0; $i < 3; $i++ ) $product->attachments()->create(['path' => 'product/' . rand(1, 10) . '.png', 'store_id' => $product->store_id]);

                });

            });

        });
        Category::factory()->count(2)->create()->each(function( $category ) {

            $category->attachments()->create(['path' => 'category/' . rand(1, 10) . '.png', 'store_id' => $category->store_id]);

            Product::factory()->count(2)->create(['category_id' => $category->id])->each(function ( $product ) {

                for ( $i = 0; $i < 3; $i++ ) $product->attachments()->create(['path' => 'product/' . rand(1, 10) . '.png', 'store_id' => $product->store_id]);

            });

        });
        Blog::factory()->count(2)->create()->each(function( $blog ) {
            
            for ( $i = 0; $i < 3; $i++ ) $blog->attachments()->create(['path' => 'blog/' . rand(1, 10) . '.png', 'store_id' => $blog->store_id]);

        });

    }

}
