<?php

declare(strict_types=1);

namespace Tests\Unit\Support;
use App\Support\Str;
use PHPUnit\Framework\TestCase;

class StrTest extends TestCase {

    public function test_casing (): void {

        $this->assertSame('hello world', Str::lower('HELLO WORLD'));
        $this->assertSame('HELLO', Str::upper('hello'));
        $this->assertSame('FooBar', Str::studly('foo_bar'));
        $this->assertSame('fooBar', Str::camel('foo bar'));
        $this->assertSame('foo_bar_baz', Str::snake('fooBarBaz'));
        $this->assertSame('foo-bar', Str::kebab('FooBar'));
        $this->assertSame('Foo Bar', Str::title('foo-bar'));
        $this->assertSame('Email Notification Sent', Str::title('EmailNotificationSent'));

    }

    public function test_clean (): void {

        $this->assertSame('a b c', Str::squish("  a   b \n c "));
        $this->assertSame('cafe', Str::ascii('café'));
        $this->assertSame('1234', Str::digits('1a2b3c4'));
        $this->assertSame('ab…', Str::limit('abcdef', 2, '…'));
        $this->assertSame('he**o', Str::mask('hello', '*', 2, 2));

    }

    public function test_replace (): void {

        $this->assertSame('bbnbnb', Str::replace('a', 'b', 'banana'));
        $this->assertSame('bXnana', Str::replaceFirst('a', 'X', 'banana'));
        $this->assertSame('bananX', Str::replaceLast('a', 'X', 'banana'));
        $this->assertSame('abc', Str::remove('-', 'a-b-c'));

    }

    public function test_slug (): void {

        $this->assertSame('hello-world', Str::slug('Hello, World!'));
        $this->assertSame('a-b-c', Str::slug('a   b   c'));

    }

    public function test_slug_unicode (): void {

        $this->assertSame('مرحبا-بالعالم', Str::slug('مرحبا بالعالم'));
        $this->assertSame('سلة-التسوق-2024', Str::slug('سلة التسوق 2024'));
        $this->assertSame('cafe-deja', Str::asciiSlug('Café Déjà'));

    }

    public function test_arabic (): void {

        $this->assertSame(['مرحبا', 'بالعالم'], Str::words('مرحبا بالعالم'));
        $this->assertSame('مرحبا…', Str::limit('مرحبا بالعالم', 5, '…'));
        $this->assertTrue(Str::contains('مرحبا بالعالم', 'العالم'));

    }

    public function test_matches (): void {

        $this->assertTrue(Str::contains('hello world', 'world'));
        $this->assertTrue(Str::startsWith('hello', 'he'));
        $this->assertTrue(Str::endsWith('hello', 'lo'));
        $this->assertTrue(Str::is('foo.*', 'foo.bar'));
        $this->assertSame('123', Str::match('/(\d+)/', 'abc123def'));
        $this->assertSame('a', Str::before('a-b-c', '-'));
        $this->assertSame('c', Str::afterLast('a-b-c', '-'));
        $this->assertSame('b', Str::between('a[b]c', '[', ']'));

    }

    public function test_invalid_pattern_throws (): void {

        $this->expectException(\InvalidArgumentException::class);

        Str::match('/(/', 'value');

    }

    public function test_inflect (): void {

        $this->assertSame('categories', Str::plural('category'));
        $this->assertSame('boxes', Str::plural('box'));
        $this->assertSame('people', Str::plural('person'));
        $this->assertSame('category', Str::singular('categories'));
        $this->assertSame('product', Str::singular('products'));
        $this->assertSame('data', Str::plural('data'));

    }

    public function test_inflect_resource_vocabulary (): void {

        $plural = [
            'user'    => 'users',
            'product' => 'products',
            'order'   => 'orders',
            'company' => 'companies',
            'currency' => 'currencies',
            'country' => 'countries',
            'address' => 'addresses',
            'status'  => 'statuses',
            'child'   => 'children',
        ];

        foreach ( $plural as $single => $expected ) {

            $this->assertSame($expected, Str::plural($single));
            $this->assertSame($single, Str::singular($expected));

        }

    }

    public function test_random (): void {

        $this->assertSame(12, strlen(Str::random(12)));
        $this->assertMatchesRegularExpression('/^[0-9]{6}$/', Str::randomNumeric(6));
        $this->assertSame(32, strlen(Str::secure(16)));

    }

    public function test_template (): void {

        $this->assertSame('Hi Sam', Str::render('Hi {name}', ['name' => 'Sam']));
        $this->assertSame('a->b', Str::swap(['x' => 'a', 'y' => 'b'], 'x->y'));

    }

}
