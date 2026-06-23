<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Validate\Rule;
use App\Support\Validate\Field;
use App\Support\Validate\Type;
use App\Support\Validate\Shape;
use App\Support\Validate\Message;

class Validate {

    public static function uuid7 (): \Closure {

        return Rule::uuid7();

    }
    public static function slug (): \Closure {

        return Rule::slug();

    }
    public static function isUuid7 ( string $value ): bool {

        return Field::isUuid7($value);

    }
    public static function isSlug ( string $value, string $separator = '-' ): bool {

        return Field::isSlug($value, $separator);

    }
    public static function isEmail ( string $value ): bool {

        return Field::isEmail($value);

    }
    public static function isUrl ( string $value ): bool {

        return Field::isUrl($value);

    }
    public static function isType ( string $type, mixed $value ): bool {

        return match ( $type ) {

            'string' => Type::isString($value),
            'int'    => Type::isInt($value),
            'float'  => Type::isFloat($value),
            'bool'   => Type::isBool($value),
            'array'  => Type::isArray($value),
            default  => false,

        };

    }
    /** @return array<string, mixed> */
    public static function validate ( array $data, array $rules ): array {

        return Shape::validate($data, $rules);

    }
    public static function passes ( array $data, array $rules ): bool {

        return Shape::passes($data, $rules);

    }
    public static function message ( string $key, array $replace = [] ): string {

        return Message::get($key, $replace);

    }

}
