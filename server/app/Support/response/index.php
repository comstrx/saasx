<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Response\Envelope;
use Illuminate\Http\JsonResponse;

class Response {

    public static function success ( mixed $data = null, int $status = 200, array $extra = [] ): JsonResponse {

        return response()->json(Envelope::success($data, $extra), $status);

    }
    public static function message ( string $message, int $status = 200 ): JsonResponse {

        return response()->json(Envelope::success(['message' => $message]), $status);

    }
    public static function fail ( array $errors = [], int $status = 400, ?string $message = null ): JsonResponse {

        return response()->json(Envelope::fail($errors, $message), $status);

    }
    public static function error ( string $key, string $message, int $status = 400 ): JsonResponse {

        return self::fail([$key => $message], $status);

    }
    public static function noContent (): JsonResponse {

        return response()->json(null, 204);

    }

}
