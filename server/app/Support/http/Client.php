<?php

declare(strict_types=1);

namespace App\Support\Http;
use App\Support\Net\Ip;
use App\Support\Net\Url;

class Client {

    /** @param array<string, string> $headers */
    public function __construct ( protected int $timeout = 10, protected int $connectTimeout = 5, protected Retry $retry = new Retry(), protected array $headers = [] ) {

    }
    public function send ( Request $request ): Response {

        self::guard($request->url);

        $response = \Illuminate\Support\Facades\Http::withHeaders($this->headers)
            ->withoutRedirecting()
            ->timeout($this->timeout)
            ->connectTimeout($this->connectTimeout)
            ->retry($this->retry->times, fn ( int $attempt ): int => $this->retry->backoff($attempt))
            ->send($request->method, $request->url, $request->options);

        return new Response($response);

    }
    public static function guard ( string $url ): void {

        $scheme = Url::scheme($url);

        if ( $scheme !== 'http' && $scheme !== 'https' ) throw new \InvalidArgumentException("Blocked URL scheme: $url");

        $host = Url::host($url);

        if ( $host === null || $host === '' ) throw new \InvalidArgumentException("Invalid URL host: $url");

        foreach ( self::resolve($host) as $ip ) {

            if ( ! Ip::isPublic($ip) ) throw new \RuntimeException("Blocked non-public target: $host");

        }

    }
    /** @return list<string> */
    protected static function resolve ( string $host ): array {

        $host = strtolower(trim($host, '[]'));

        if ( Ip::valid($host) ) return [$host];

        $ips = gethostbynamel($host);

        if ( $ips === false ) throw new \RuntimeException("Unable to resolve host: $host");

        return $ips;

    }

}
