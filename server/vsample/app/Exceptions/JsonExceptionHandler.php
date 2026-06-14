<?php

namespace App\Exceptions;
use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use App\Enums\ErrorCode;

class JsonExceptionHandler {

    protected static function unauthenticated () {

        return failed(['message' => 'Unauthenticated'], ErrorCode::UNAUTHORIZED->value);

    }
    protected static function unauthorized () {

        return failed(['permission' => 'Access denied'], ErrorCode::FORBIDDEN->value);

    }
    protected static function routeNotFound() {

        return failed(['message' => 'Route not found'], ErrorCode::NOT_FOUND->value);

    }
    protected static function methodNotAllowed () {

        return failed(['message' => 'HTTP method not allowed'], ErrorCode::METHOD_NOT_ALLOWED->value);

    }
    protected static function validationFailed( ValidationException $exception ) {

        return failed(['message' => $exception->errors()], ErrorCode::VALIDATION->value);

    }
    protected static function modelNotFound ( ModelNotFoundException $exception ) {

        $model = class_basename($exception->getModel());
        return failed([strtolower($model) => "{$model} not found"], ErrorCode::NOT_FOUND->value);

    }
    protected static function genericError ( Throwable $exception ) {

        return config('app.debug') ? null : failed(['message' => 'Server Error'], ErrorCode::SERVER->value);

    }
    protected static function customJsonError( Exception $exception ) {

        $message = $exception->getMessage();
        if ( !empty(json_decode($message, true) ?? []) ) return throwErrorFailed(json_decode($message, true));
        else return self::genericError($exception);

    }
    public static function handle( Throwable $exception ) {

        $exception = $exception->getPrevious() ?? $exception;

        return match (true) {
            $exception instanceof ModelNotFoundException  => self::modelNotFound($exception),
            $exception instanceof ValidationException     => self::validationFailed($exception),
            $exception instanceof AuthenticationException => self::unauthenticated(),
            $exception instanceof AuthorizationException  => self::unauthorized(),
            $exception instanceof NotFoundHttpException   => self::routeNotFound(),
            $exception instanceof MethodNotAllowedHttpException => self::methodNotAllowed(),
            $exception instanceof Exception => self::customJsonError($exception),
            default => self::genericError($exception),
        };

    }

}
