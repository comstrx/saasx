<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;

function failed ( array $response = null, int $status = 400 ) {

    return response()->json(['status' => false, 'errors' => $response ?? ['message' => 'failed response']], $status);

}
function success ( array $response = null, int $status = 200 ) {

    if ( ($response['status'] ?? null) === false ) return failed();
    return response()->json(array_merge(['status' => true], $response ?? []), $status);

}
function failNow ( string $name = null ) {

    throw (new ModelNotFoundException)->setModel($name);

}
function failPermissionNow ( string $name = null ) {

    throw new AuthorizationException($name);

}

function permissionFailed ( string $name = null ) {

    return failed([strtolower($name ?? 'permission') => $name ? "{$name} is not allowed" : 'Access Denied'], 403);

}
function middlewareFailed ( string $message = null ) {

    return failed(['permission' => $message ?? 'Access Denied'], 403);

}
function authorizeFailed ( string $message = null ) {

    return failed(['authorization' => $message ?? 'Authorization Failed'], 403);

}
function credentialsFailed ( string $message = null ) {

    return failed(['credentials' => $message ?? 'invalid credentials'], 403);

}
function notFoundFailed ( string $name = null ) {

    return failed([strtolower($name ?? 'item') => ($name ?? 'item') . " not found"], 403);

}

function throwError ( string $title = null, string $message = null, int $code = 400 ) {

    logger()->error("{$title} -- {$message}", ['user_id' => user_id()]);
    throw new \Exception( json_encode(['title' => $title, 'message' => $message, 'code' => $code]) );

}
function throwResponse ( string $title = null, string $message = null, int $code = 400 ) {

    logger()->error("{$title} -- {$message}", ['user_id' => user_id()]);
    return failed([$title ?? 'message' => $message ?? 'unexpected error'], $code)->send() && exit();

}
function throwErrorFailed ( string $message = null ) {

    $msg = (array) json_decode($message) ?? [];
    return failed([$msg['title'] ?? 'message' => $msg['message'] ?? 'server error'], $msg['code'] ?? 500);

}
function throwErrorResponse ( string $message = null ) {

    $msg = (array) json_decode($message) ?? [];
    return throwResponse($msg['title'] ?? null, $msg['message'] ?? null, $msg['code'] ?? 400);

}

function successDownload ( array $data = [], string $filename = null, string $type = 'text/csv', string $ext = 'csv' ) {

    $filename = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $filename ?? 'file');
    $filename = "{$filename}_export_" . now()->format('Ymd_His') . ".{$ext}";

    $headers = [
        'Content-Type' => $type,
        'Content-Disposition' => "attachment; filename=\"$filename\"",
        'Access-Control-Expose-Headers' => 'Content-Disposition'
    ];
    return response()->streamDownload(function () use ( $data ) {

        $handle = fopen('php://output', 'w');
        if ( empty($data) ) return fclose($handle);

        fwrite($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
        fputcsv($handle, array_keys(array_filter($data[0], fn($value) => is_scalar($value))));

        foreach ( $data as $row ) {

            fputcsv($handle, array_values(array_map(fn($value) =>
                is_bool($value) ? ($value ? 'true' : 'false') : $value,
                array_filter($row, fn($value) => is_scalar($value)))
            ));
            
        }

        fclose($handle);

    }, $filename, $headers);

}
