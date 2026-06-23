<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Response\Envelope;
use App\Support\Response\Failure;
use App\Support\Response\Pagination;
use App\Support\Response\Meta;

class Response {

    public static function success ( mixed $data = null, int $status = 200, array $extra = [] ): \Illuminate\Http\JsonResponse {

        return new \Illuminate\Http\JsonResponse(Envelope::success($data, $extra), $status);

    }
    public static function message ( string $text, int $status = 200 ): \Illuminate\Http\JsonResponse {

        return new \Illuminate\Http\JsonResponse(Envelope::message($text), $status);

    }
    public static function fail ( array $errors = [], int $status = 422, ?string $message = null ): \Illuminate\Http\JsonResponse {

        return new \Illuminate\Http\JsonResponse(Failure::make($errors, $message), $status);

    }
    public static function error ( string $key, string $message, int $status = 422 ): \Illuminate\Http\JsonResponse {

        return self::fail([$key => [$message]], $status, $message);

    }
    public static function noContent (): \Illuminate\Http\JsonResponse {

        return new \Illuminate\Http\JsonResponse(null, 204);

    }
    /**
     * @param  \Illuminate\Contracts\Pagination\Paginator<int, mixed> $paginator
     * @return array<string, mixed>
     */
    public static function paginate ( \Illuminate\Contracts\Pagination\Paginator $paginator ): array {

        return Pagination::meta($paginator);

    }
    /**
     * @param  \Illuminate\Contracts\Pagination\CursorPaginator<int, mixed> $paginator
     * @return array<string, mixed>
     */
    public static function cursor ( \Illuminate\Contracts\Pagination\CursorPaginator $paginator ): array {

        return Pagination::cursor($paginator);

    }
    /** @return array<string, mixed> */
    public static function meta ( array $base, array $extra ): array {

        return Meta::merge($base, $extra);

    }

}
