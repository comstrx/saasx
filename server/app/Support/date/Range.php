<?php

declare(strict_types=1);

namespace App\Support\Date;

class Range {

    public static function contains ( \Carbon\CarbonInterface $value, \Carbon\CarbonInterface $start, \Carbon\CarbonInterface $end ): bool {

        return $value->greaterThanOrEqualTo($start) && $value->lessThanOrEqualTo($end);

    }
    /** @return list<\Carbon\CarbonImmutable> */
    public static function eachDay ( \Carbon\CarbonInterface $start, \Carbon\CarbonInterface $end ): array {

        $days = [];
        $cursor = \Carbon\CarbonImmutable::parse($start->toDateString())->startOfDay();
        $limit = \Carbon\CarbonImmutable::parse($end->toDateString())->startOfDay();

        while ( $cursor->lessThanOrEqualTo($limit) ) {

            $days[] = $cursor;
            $cursor = $cursor->addDay();

        }

        return $days;

    }

}
