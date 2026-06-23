<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Cast\Scalar;
use App\Support\Cast\Collection;
use App\Support\Cast\Enum;

class Cast {

    public static function string ( mixed $value ): ?string {

        return Scalar::string($value);

    }
    public static function integer ( mixed $value ): ?int {

        return Scalar::integer($value);

    }
    public static function float ( mixed $value ): ?float {

        return Scalar::float($value);

    }
    public static function boolean ( mixed $value ): bool {

        return Scalar::boolean($value);

    }
    /** @return array<mixed> */
    public static function array ( mixed $value ): array {

        return Collection::array($value);

    }
    /** @return list<mixed> */
    public static function values ( mixed $value ): array {

        return Collection::values($value);

    }
    /**
     * @template T of \BackedEnum
     * @param  class-string<T> $enum
     * @return T|null
     */
    public static function enum ( string $enum, mixed $value ): ?\BackedEnum {

        return Enum::enum($enum, $value);

    }

}
