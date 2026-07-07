<?php

declare(strict_types=1);

namespace Tests\Unit\Support\Str;

use App\Support\str\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use ReflectionMethod;

final class StrTest extends TestCase
{
    public static function upperCases(): array
    {
        return [
            'unicode' => ['héllo', 'HÉLLO'],
            'single' => ['a', 'A'],
            'already upper' => ['HÉLLO', 'HÉLLO'],
            'empty' => ['', ''],
            'digits punctuation kept' => ['a1-b', 'A1-B'],
        ];
    }

    #[Test]
    #[DataProvider('upperCases')]
    public function upper_is_unicode_uppercase(string $in, string $out): void
    {
        $this->assertSame($out, Str::upper($in));
    }

    public static function lowerCases(): array
    {
        return [
            'unicode' => ['HÉLLO', 'héllo'],
            'already lower' => ['héllo', 'héllo'],
            'empty' => ['', ''],
        ];
    }

    #[Test]
    #[DataProvider('lowerCases')]
    public function lower_is_unicode_lowercase(string $in, string $out): void
    {
        $this->assertSame($out, Str::lower($in));
    }

    public static function camelCases(): array
    {
        return [
            'mixed separators' => ['foo_bar-baz qux', 'fooBarBazQux'],
            'single' => ['a', 'a'],
            'empty' => ['', ''],
            'whitespace only' => ['   ', ''],
            'separators only' => ['___', ''],
            'digit boundary' => ['foo2Bar', 'foo2Bar'],
            'collapse repeats' => ['  foo__bar--baz ', 'fooBarBaz'],
            'from camel input' => ['fooBarBaz', 'fooBarBaz'],
            'unicode word' => ['ÉCOLE de nuit', 'écoleDeNuit'],
        ];
    }

    #[Test]
    #[DataProvider('camelCases')]
    public function camel_produces_camel_case(string $in, string $out): void
    {
        $this->assertSame($out, Str::camel($in));
    }

    public static function snakeCases(): array
    {
        return [
            'from camel' => ['fooBarBaz', 'foo_bar_baz'],
            'digit boundary' => ['foo2Bar', 'foo2_bar'],
            'collapse separators' => ['  foo__bar--baz ', 'foo_bar_baz'],
            'empty' => ['', ''],
            'whitespace only' => ['   ', ''],
            'separators only' => ['___', ''],
            'single' => ['a', 'a'],
        ];
    }

    #[Test]
    #[DataProvider('snakeCases')]
    public function snake_produces_snake_case(string $in, string $out): void
    {
        $this->assertSame($out, Str::snake($in));
    }

    public static function kebabCases(): array
    {
        return [
            'from camel' => ['fooBarBaz', 'foo-bar-baz'],
            'digit boundary' => ['foo2Bar', 'foo2-bar'],
            'collapse separators' => ['  foo__bar--baz ', 'foo-bar-baz'],
            'empty' => ['', ''],
            'separators only' => ['___', ''],
        ];
    }

    #[Test]
    #[DataProvider('kebabCases')]
    public function kebab_produces_kebab_case(string $in, string $out): void
    {
        $this->assertSame($out, Str::kebab($in));
    }

    #[Test]
    public function input_value_is_not_mutated(): void
    {
        $in = 'fooBarBaz';

        Str::snake($in);
        Str::camel($in);
        Str::upper($in);

        $this->assertSame('fooBarBaz', $in);
    }

    public static function adversarialInputs(): array
    {
        return [
            'invalid utf8 bytes' => ["\xFF\xFE\x80"],
            'lone continuation byte' => ["\x80"],
            'truncated multibyte' => ["foo\xC3"],
            'null byte embedded' => ["foo\x00bar"],
            'control chars' => ["\x01\x02\x03"],
            'nbsp separators' => ["foo\u{00A0}bar"],
            'only newlines/tabs' => ["\n\t\r"],
        ];
    }

    #[Test]
    #[DataProvider('adversarialInputs')]
    public function every_method_is_total_on_hostile_input(string $in): void
    {
        $this->assertIsString(Str::upper($in));
        $this->assertIsString(Str::lower($in));
        $this->assertIsString(Str::camel($in));
        $this->assertIsString(Str::snake($in));
        $this->assertIsString(Str::kebab($in));
    }

    #[Test]
    public function invalid_utf8_fails_closed_to_empty_for_multiword_casings(): void
    {
        $garbage = "\xFF\xFE\x80";

        $this->assertSame('', Str::camel($garbage));
        $this->assertSame('', Str::snake($garbage));
        $this->assertSame('', Str::kebab($garbage));
    }

    #[Test]
    public function handles_large_input_without_pathological_cost(): void
    {
        $big = str_repeat('fooBar_baz-QUX ', 20000);

        $start = microtime(true);
        $out = Str::snake($big);
        $elapsed = microtime(true) - $start;

        $this->assertIsString($out);
        $this->assertStringStartsWith('foo_bar_baz_qux', $out);
        $this->assertLessThan(1.0, $elapsed, 'snake() on ~300KB took too long');
    }

    #[Test]
    public function exposes_exactly_five_public_static_methods(): void
    {
        $class = new ReflectionClass(Str::class);

        $public = array_map(
            static fn (ReflectionMethod $m): string => $m->getName(),
            $class->getMethods(ReflectionMethod::IS_PUBLIC),
        );
        sort($public);

        $this->assertSame(['camel', 'kebab', 'lower', 'snake', 'upper'], $public);

        foreach ($class->getMethods(ReflectionMethod::IS_PUBLIC) as $m) {
            $this->assertTrue($m->isStatic(), "{$m->getName()} must be static");
        }
    }

    #[Test]
    public function segmentation_helpers_are_private(): void
    {
        $class = new ReflectionClass(Str::class);

        $this->assertTrue($class->getMethod('words')->isPrivate());
        $this->assertTrue($class->getMethod('ucfirst')->isPrivate());
    }

    #[Test]
    public function class_is_final_and_has_no_public_constants_or_properties(): void
    {
        $class = new ReflectionClass(Str::class);

        $this->assertTrue($class->isFinal());
        $this->assertSame([], $class->getConstants());
        $this->assertSame([], $class->getProperties());
    }
}
