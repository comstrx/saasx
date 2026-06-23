<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Database\Uuid;
use App\Support\Database\Transaction;
use App\Support\Database\Rls;
use App\Support\Database\Query;
use App\Support\Database\Schema;
use App\Support\Database\Column;
use App\Support\Database\Sort;
use App\Support\Database\Keyset;

class Database {

    public static function uuid (): string {

        return Uuid::generate();

    }
    public static function isUuid ( string $value ): bool {

        return Uuid::isValid($value);

    }
    /**
     * @template T
     * @param  \Closure(): T $callback
     * @return T
     */
    public static function transaction ( \Closure $callback, int $attempts = 1 ): mixed {

        return Transaction::run($callback, $attempts);

    }
    public static function applyRls ( ?string $tenantId = null ): void {

        Rls::apply($tenantId);

    }
    /** @param array<mixed> $values */
    public static function placeholders ( array $values ): string {

        return Query::placeholders($values);

    }
    public static function escapeLike ( string $term ): string {

        return Query::escapeLike($term);

    }
    public static function hasTable ( string $table ): bool {

        return Schema::hasTable($table);

    }
    public static function hasColumn ( string $table, string $column ): bool {

        return Schema::hasColumn($table, $column);

    }
    /** @return list<string> */
    public static function columns ( string $table ): array {

        return Schema::columns($table);

    }
    public static function columnType ( string $table, string $column ): ?string {

        return Column::type($table, $column);

    }
    /**
     * @param  list<string> $allowed
     * @return array{column: string, direction: string}|null
     */
    public static function sort ( string $spec, array $allowed ): ?array {

        return Sort::resolve($spec, $allowed);

    }
    /** @param array<string, mixed> $cursor */
    public static function encodeCursor ( array $cursor ): string {

        return Keyset::encode($cursor);

    }
    /** @return array<string, mixed> */
    public static function decodeCursor ( string $cursor ): array {

        return Keyset::decode($cursor);

    }

}
