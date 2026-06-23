<?php

declare(strict_types=1);

namespace App\Support\Arr;

class Tree {

    /** @return list<array<string, mixed>> */
    public static function nest ( array $items, string $id = 'id', string $parent = 'parent_id', string $children = 'children' ): array {

        $byParent = [];

        foreach ( $items as $item ) {

            $byParent[$item[$parent] ?? ''][] = (array) $item;

        }

        return self::branch($byParent, '', $id, $children);

    }
    /** @return list<array<string, mixed>> */
    public static function flatten ( array $tree, string $children = 'children' ): array {

        $result = [];

        foreach ( $tree as $node ) {

            $node = (array) $node;
            $branch = $node[$children] ?? [];
            unset($node[$children]);

            $result[] = $node;

            if ( is_array($branch) && $branch !== [] ) {

                $result = array_merge($result, self::flatten($branch, $children));

            }

        }

        return $result;

    }
    /** @return list<array<string, mixed>> */
    private static function branch ( array $byParent, int|string $parent, string $id, string $children ): array {

        $branch = [];

        foreach ( $byParent[$parent] ?? [] as $node ) {

            $node[$children] = self::branch($byParent, $node[$id] ?? '', $id, $children);

            $branch[] = $node;

        }

        return $branch;

    }

}
