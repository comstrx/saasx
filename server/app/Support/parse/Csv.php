<?php

declare(strict_types=1);

namespace App\Support\Parse;

class Csv {

    /** @return list<list<string>> */
    public static function rows ( string $content, string $delimiter = ',' ): array {

        $rows = [];

        foreach ( preg_split('/\r\n|\r|\n/', trim($content)) ?: [] as $line ) {

            if ( $line === '' ) continue;

            $rows[] = array_map(static fn ( ?string $cell ): string => (string) $cell, str_getcsv($line, $delimiter, '"', '\\'));

        }

        return $rows;

    }
    /** @return list<array<string, string>> */
    public static function withHeaders ( string $content, string $delimiter = ',' ): array {

        $rows = self::rows($content, $delimiter);
        $headers = array_shift($rows);
        if ( $headers === null ) return [];

        $result = [];

        foreach ( $rows as $row ) {

            $result[] = array_combine($headers, array_pad(array_slice($row, 0, count($headers)), count($headers), ''));

        }

        return $result;

    }

}
