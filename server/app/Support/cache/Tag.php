<?php

declare(strict_types=1);

namespace App\Support\Cache;

class Tag {

    /** @param list<string> $tags */
    public static function index ( Driver $driver, string $key, array $tags ): void {

        foreach ( $tags as $tag ) {

            $driver->addMembers(Key::tag($tag), [$key]);

        }

    }
    /** @return list<string> */
    public static function members ( Driver $driver, string $tag ): array {

        return $driver->members(Key::tag($tag));

    }
    public static function reset ( Driver $driver, string $tag ): void {

        foreach ( $driver->members(Key::tag($tag)) as $key ) {

            $driver->forget($key);

        }

        $driver->forgetMembers(Key::tag($tag));

    }

}
