<?php

declare(strict_types=1);

namespace App\Support\Database;

class Column {

    public static function type ( string $table, string $column ): ?string {

        return \Illuminate\Support\Facades\Schema::hasColumn($table, $column)
            ? \Illuminate\Support\Facades\Schema::getColumnType($table, $column)
            : null;

    }

}
