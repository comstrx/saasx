<?php

declare(strict_types=1);

namespace App\Support\Database;

class Sort {

    /**
     * @param  list<string> $allowed
     * @return array{column: string, direction: string}|null
     */
    public static function resolve ( string $spec, array $allowed ): ?array {

        $spec = trim($spec);
        $direction = 'asc';

        if ( str_starts_with($spec, '-') ) {

            $direction = 'desc';
            $spec = substr($spec, 1);

        }

        if ( str_contains($spec, '@') ) {

            $parts = explode('@', $spec, 2);
            $spec = $parts[0];
            $direction = strtolower($parts[1] ?? '') === 'desc' ? 'desc' : 'asc';

        }

        $column = trim($spec);

        return in_array($column, $allowed, true) ? ['column' => $column, 'direction' => $direction] : null;

    }

}
