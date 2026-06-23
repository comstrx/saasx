<?php

declare(strict_types=1);

namespace App\Support\Cache;

class Key {

    public static function make ( string $key ): string {

        return Scope::prefix() . ':' . $key;

    }
    public static function tag ( string $tag ): string {

        return Scope::prefix() . ':tag:' . $tag;

    }

}
