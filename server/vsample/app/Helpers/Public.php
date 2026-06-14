<?php

use Illuminate\Support\Str;
use Carbon\Carbon;

function ip () {

    return request()->ip();

}
function agent () {

    return request()->userAgent();
    
}
function locales () {

    return config('app.locales', ['en', 'ar', 'fr', 'it', 'de', 'ru', 'es', 'sw', 'tr', 'pt']);

}
function locale () {

    $lang = strtolower(trim(string(request()->header('Locale') ?? request()->input('locale') ?? 'en')));
    $lang = in_array($lang, locales()) ? $lang : 'en';

    app()->setLocale($lang);
    return app()->getLocale();

}
function host () {

    locale();
    return request()->header('X-Store-Domain') ?? request()->getHost();

}
function string ( $value ) {

    if ( is_array($value) || is_object($value) ) return null;

    $value = $value === true ? 'true' : $value;
    $value = $value === false ? 'false' : $value;

    if ( in_array(strval($value), ['', 'null', 'undefined']) ) return null;
    else return trim("{$value}") ?: null;

}
function bool ( $value ) {

    $values = ['true', '1', 't', 'yes', 'y', 'ya', 'yep', 'ok', 'on', 'done', 'always'];
    return in_array(strtolower(string($value)), $values);

}
function integer ( $value ) {

    return (int)$value;

}
function float ( $value, $decimal=2 ) {

    return round((float)$value, $decimal);

}
function positive ( $value ) {

    return max(float($value), 0);

}
function parse ( mixed $value = null ) {

    if ( is_string($value) ) {

        $val = json_decode($value, true);
        if ( is_array($val) ) return $val;

        $val = preg_replace_callback('/\[(.*?)\]/s', fn ($matches) =>
            '[' . implode(',', array_filter(array_map('trim', explode(',', $matches[1])), fn($v) => $v !== '')) . ']',
            preg_replace('/,\s*([\]\}])/', '$1', $value)
        );
    
        $val = json_decode($val, true);
        if ( is_array($val) ) return $val;

        return [...array_filter(array_map(fn($item) => trim($item), explode(',', $value)))];
        
    }

    return (array) $value;

}
function bool_string ( $value ) {

    return bool($value) ? 'true' : 'false';

}
function slug ( $name ) {

    return Str::slug( $name );

}
function plural ( $value ) {

    return Str::plural( $value );

}
function singular ( $value ) {

    return Str::singular( $value );

}
function studly ( $value ) {

    return Str::studly( $value );

}
function snake ( $value ) {

    return Str::snake( $value );

}
function plural_snake ( $value ) {

    return plural(snake($value));

}
function format_balance ( $balance ) {
    
    return number_format($balance, 2, '.', '');

}
function utc_date () {

    return (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s');

}
function format_date ( $date ) {

    return is_string($date) ? $date : $date?->format('Y-m-d H:i:s');

}
function diff_date ( $prev_date, $next_date ) {

    $prev_date = Carbon::parse(string($prev_date));
    $next_date = Carbon::parse(string($next_date));
    return integer($prev_date->diffInDays($next_date));

}
function parse_date ( string $date = null, bool $time = true ) {

    if ( empty($date) ) return null;

    try { return $time ? Carbon::parse($date)->toDateTimeString() : Carbon::parse($date)->toDateString(); }
    catch ( \Exception $e ) { return null; }

}
function localize ( mixed $data, bool $all = false ) {

    if ( $all ) return (object) parse($data);
    $lang = request()->input('locale', 'en');
    return parse($data)[$lang] ?? parse($data)['en'] ?? null;

}
function random_key () {

    $key = '';

    for ( $i = 1; $i < 10; $i++ ) {

        $key .= random_int(0, 9);
        if ( $i % 3 === 0 && $i != 9 ) $key .= '-';
        
    }

    return $key;

}
function flatten_array ( $array, $prefix = '' ) {
    
    $result = [];

    foreach ( $array as $key => $value ) {

        $flatKey = $prefix ? "{$prefix}_{$key}" : $key;

        if ( is_array($value) ) $result += flatten_array($value, $flatKey);
        else $result[$flatKey] = $value;
    
    }

    return $result;

}
function file_info ( $file ) {

    $file_name = $file->getClientOriginalName();
    $file_type = $file->getMimeType();
    $ext = $file->extension();
    $size = $file->getSize();

    if ($size >= 1024 && $size < 1048576) $size = round($size / 1024, 1) . ' KB';
    else if ($size >= 1048576 && $size < 1073741824) $size = round($size / 1048576, 1) . ' MB';
    else if ($size >= 1073741824) $size = round($size / 1073741824, 1) . ' GB';
    else $size = ($size ?? 0) . ' B';

    $name = array_values(array_filter(explode('.', $file_name), function($item){ return $item; }));
    if ( count($name) > 1 ) $name = implode('.', array_slice($name, 0, -1));
    else if ( count($name) == 1 ) $name = $name[0];
    else $name = $file_name;

    $type = explode('/', $file_type)[0] ?? 'file';
    if ( $type != 'image' && $type != 'video' && $type != 'audio' ) $type = 'file';

    return ['name' => $name, 'size' => $size, 'type' => $type, 'ext' => $ext];

}
function getClassProperty ( string $class, string $property = null, mixed $default = null ) {

    $reflection = new ReflectionClass($class);
    if ( !$reflection->hasProperty($property) ) return $default;
    return $reflection->getDefaultProperties()[$property] ?? $default;

}
function withoutFiles ( array $data = [] ) {

    return array_filter($data, fn ($value) => !$value instanceof \Illuminate\Http\UploadedFile);

}
