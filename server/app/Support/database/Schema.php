<?php

declare(strict_types=1);

namespace App\Support\Database;

class Schema {

    public static function hasTable ( string $table ): bool {

        return \Illuminate\Support\Facades\Schema::hasTable($table);

    }
    public static function hasColumn ( string $table, string $column ): bool {

        return \Illuminate\Support\Facades\Schema::hasColumn($table, $column);

    }
    /** @return list<string> */
    public static function columns ( string $table ): array {

        return array_values(array_map(static fn ( mixed $column ): string => (string) $column, \Illuminate\Support\Facades\Schema::getColumnListing($table)));

    }

}
