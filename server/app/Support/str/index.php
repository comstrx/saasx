<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Str\Casing;
use App\Support\Str\Clean;
use App\Support\Str\Inflect;
use App\Support\Str\Matches;
use App\Support\Str\Random;
use App\Support\Str\Slug;
use App\Support\Str\Template;

class Str {

    public static function lower ( string $value ): string {

        return Casing::lower($value);

    }

    public static function upper ( string $value ): string {

        return Casing::upper($value);

    }

    public static function title ( string $value ): string {

        return Casing::title($value);

    }

    public static function camel ( string $value ): string {

        return Casing::camel($value);

    }

    public static function studly ( string $value ): string {

        return Casing::studly($value);

    }

    public static function snake ( string $value, string $separator = '_' ): string {

        return Casing::snake($value, $separator);

    }

    public static function kebab ( string $value ): string {

        return Casing::kebab($value);

    }

    public static function words ( string $value ): array {

        return Casing::words($value);

    }

    public static function squish ( string $value ): string {

        return Clean::squish($value);

    }

    public static function ascii ( string $value ): string {

        return Clean::ascii($value);

    }

    public static function stripTags ( string $value, ?string $allowed = null ): string {

        return Clean::stripTags($value, $allowed);

    }

    public static function digits ( string $value ): string {

        return Clean::digits($value);

    }

    public static function alpha ( string $value ): string {

        return Clean::alpha($value);

    }

    public static function alphanumeric ( string $value ): string {

        return Clean::alphanumeric($value);

    }

    public static function limit ( string $value, int $limit = 100, string $end = '…' ): string {

        return Clean::limit($value, $limit, $end);

    }

    public static function mask ( string $value, string $character = '*', int $index = 0, ?int $length = null ): string {

        return Clean::mask($value, $character, $index, $length);

    }

    public static function start ( string $value, string $prefix ): string {

        return Clean::start($value, $prefix);

    }

    public static function finish ( string $value, string $suffix ): string {

        return Clean::finish($value, $suffix);

    }

    public static function slug ( string $value, string $separator = '-' ): string {

        return Slug::make($value, $separator);

    }

    public static function asciiSlug ( string $value, string $separator = '-' ): string {

        return Slug::ascii($value, $separator);

    }

    public static function replace ( string|array $search, string|array $replace, string $subject ): string {

        return Clean::replace($search, $replace, $subject);

    }

    public static function replaceFirst ( string $search, string $replace, string $subject ): string {

        return Clean::replaceFirst($search, $replace, $subject);

    }

    public static function replaceLast ( string $search, string $replace, string $subject ): string {

        return Clean::replaceLast($search, $replace, $subject);

    }

    public static function remove ( string|array $search, string $subject ): string {

        return Clean::remove($search, $subject);

    }

    public static function contains ( string $haystack, string|array $needles ): bool {

        return Matches::contains($haystack, $needles);

    }

    public static function startsWith ( string $haystack, string|array $needles ): bool {

        return Matches::startsWith($haystack, $needles);

    }

    public static function endsWith ( string $haystack, string|array $needles ): bool {

        return Matches::endsWith($haystack, $needles);

    }

    public static function is ( string|array $pattern, string $value ): bool {

        return Matches::is($pattern, $value);

    }

    public static function match ( string $pattern, string $value ): string {

        return Matches::match($pattern, $value);

    }

    public static function matchAll ( string $pattern, string $value ): array {

        return Matches::matchAll($pattern, $value);

    }

    public static function before ( string $subject, string $search ): string {

        return Matches::before($subject, $search);

    }

    public static function beforeLast ( string $subject, string $search ): string {

        return Matches::beforeLast($subject, $search);

    }

    public static function after ( string $subject, string $search ): string {

        return Matches::after($subject, $search);

    }

    public static function afterLast ( string $subject, string $search ): string {

        return Matches::afterLast($subject, $search);

    }

    public static function between ( string $subject, string $from, string $to ): string {

        return Matches::between($subject, $from, $to);

    }

    public static function length ( string $value ): int {

        return Matches::length($value);

    }

    public static function isBlank ( string $value ): bool {

        return Matches::isBlank($value);

    }

    public static function random ( int $length = 16 ): string {

        return Random::random($length);

    }

    public static function randomNumeric ( int $length = 6 ): string {

        return Random::numeric($length);

    }

    public static function secure ( int $bytes = 16 ): string {

        return Random::secure($bytes);

    }

    public static function render ( string $template, array $data, string $open = '{', string $close = '}' ): string {

        return Template::render($template, $data, $open, $close);

    }

    public static function swap ( array $pairs, string $subject ): string {

        return Template::swap($pairs, $subject);

    }

    public static function plural ( string $value, int $count = 2 ): string {

        return Inflect::plural($value, $count);

    }

    public static function singular ( string $value ): string {

        return Inflect::singular($value);

    }

}
