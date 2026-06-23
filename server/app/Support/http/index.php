<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Http\Client;
use App\Support\Http\Request;
use App\Support\Http\Response;
use App\Support\Http\Retry;

class Http {

    /** @param array<string, mixed> $query */
    public static function get ( string $url, array $query = [] ): Response {

        return self::request('GET', $url, $query === [] ? [] : ['query' => $query]);

    }
    /** @param array<string, mixed> $body */
    public static function post ( string $url, array $body = [] ): Response {

        return self::request('POST', $url, ['json' => $body]);

    }
    /** @param array<string, mixed> $body */
    public static function put ( string $url, array $body = [] ): Response {

        return self::request('PUT', $url, ['json' => $body]);

    }
    /** @param array<string, mixed> $body */
    public static function patch ( string $url, array $body = [] ): Response {

        return self::request('PATCH', $url, ['json' => $body]);

    }
    /** @param array<string, mixed> $query */
    public static function delete ( string $url, array $query = [] ): Response {

        return self::request('DELETE', $url, $query === [] ? [] : ['query' => $query]);

    }
    /** @param array<string, mixed> $options */
    public static function request ( string $method, string $url, array $options = [] ): Response {

        return self::client()->send(Request::make($method, $url, $options));

    }
    /** @param array<string, string> $headers */
    public static function client ( int $timeout = 10, int $connectTimeout = 5, array $headers = [] ): Client {

        return new Client($timeout, $connectTimeout, new Retry(), $headers);

    }

}
