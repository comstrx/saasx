<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

trait MatchDate {

    use Helpers;

    protected function resolveKeyword ( string $keyword ) {

        return match ( str_replace([' ', '-', '_'], '', $keyword) ) {
            'now'        => Carbon::now(),
            'today'      => Carbon::today(),
            'yesterday'  => Carbon::yesterday(),
            'tomorrow'   => Carbon::tomorrow(),
          
            'thisday'   => ['start' => Carbon::now()->startOfDay(), 'end' => Carbon::now()->endOfDay()],
            'thisweek'  => ['start' => Carbon::now()->startOfWeek(), 'end' => Carbon::now()->endOfWeek()],
            'thismonth' => ['start' => Carbon::now()->startOfMonth(), 'end' => Carbon::now()->endOfMonth()],
            'thisyear'  => ['start' => Carbon::now()->startOfYear(), 'end' => Carbon::now()->endOfYear()],

            'lastday'   => ['start' => Carbon::now()->subDay()->startOfDay(), 'end' => Carbon::now()->subDay()->endOfDay()],
            'lastweek'  => ['start' => Carbon::now()->subWeek()->startOfWeek(), 'end' => Carbon::now()->subWeek()->endOfWeek()],
            'lastmonth' => ['start' => Carbon::now()->subMonth()->startOfMonth(), 'end' => Carbon::now()->subMonth()->endOfMonth()],
            'lastyear'  => ['start' => Carbon::now()->subYear()->startOfYear(), 'end' => Carbon::now()->subYear()->endOfYear()],

            'nextday'   => ['start' => Carbon::now()->addDay()->startOfDay(), 'end' => Carbon::now()->addDay()->endOfDay()],
            'nextweek'  => ['start' => Carbon::now()->addWeek()->startOfWeek(), 'end' => Carbon::now()->addWeek()->endOfWeek()],
            'nextmonth' => ['start' => Carbon::now()->addMonth()->startOfMonth(), 'end' => Carbon::now()->addMonth()->endOfMonth()],
            'nextyear'  => ['start' => Carbon::now()->addYear()->startOfYear(), 'end' => Carbon::now()->addYear()->endOfYear()],

            'expired'    => ['type' => 'expired'],
            'notexpired' => ['type' => 'not_expired'],

            default      => null,
        };

    }
    protected function parseKeywords ( string $value, string $operator = null ) {

        $value       = strtolower(trim($value));
        $keyword     = $this->resolveKeyword($value);
        [$from, $to] = array_pad(explode('..', $value), 2, null);

        return match ( true ) {
            in_array(trim($operator), ['<', '>', '=', '<=', '>=', '!=']) =>
                ['type' => 'compare', 'op' => $operator, 'value' => is_array($keyword) ? $value : $keyword ?? $value],

            in_array($value, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) =>
                ['type' => 'weekday', 'value' => ucfirst($value)],

            str_contains($value, '..') =>
                ['type' => 'range', 'from' => Carbon::parse(trim($from)), 'to' => Carbon::parse(trim($to))],

            $keyword && data_get($keyword, 'type') => ['type' => $keyword['type']],
            $keyword && is_array($keyword) => ['type' => 'range', 'from' => $keyword['start'], 'to' => $keyword['end']],

            $keyword => ['type' => 'date', 'value' => $keyword],
            default => null,
        };

    }
    protected function parseExpression ( string $value ) {

        try { Carbon::parse($value); } catch (\Exception $e) { return null; }
        [$year, $month] = explode('-', $value) + [null, null];

        return match ( true ) {
            preg_match('/^\d{4}$/', $value) => ['type' => 'year', 'value' => $value],
            preg_match('/^\d{4}-\d{2}$/', $value) => ['type' => 'year_month', 'year' => $year, 'month' => $month],
            preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) => ['type' => 'date', 'value' => $value],
            preg_match('/^\d{4}-\d{2}-\d{2} \d{2}$/', $value) => ['type' => 'datetime_hour', 'value' => $value],
            preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value) => ['type' => 'datetime_minute', 'value' => $value],
            preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value) => ['type' => 'datetime', 'value' => $value],
            preg_match('/^\d{2}:\d{2}$/', $value) => ['type' => 'time', 'value' => $value],
            preg_match('/^\d{2}:\d{2}:\d{2}$/', $value) => ['type' => 'time', 'value' => $value],
            default => ['type' => 'datetime', 'value' => $value],
        };

    }
    protected function matchDate ( Builder $query, string $column, string $operator = null, string $value = null ) {

        if ( !$value ) return $query;
        $parser = $this->parseKeywords($value, $operator) ?? $this->parseExpression($value);

        return match ( $parser['type'] ?? null ) {
            'year'       => $query->whereYear($column, $parser['value']),
            'date'       => $query->whereDate($column, $parser['value']),
            'time'       => $query->whereTime($column, $parser['value']),
            'weekday'    => $query->whereRaw("DAYNAME({$column}) = ?", [$parser['value']]),
            'year_month' => $query->whereYear($column, $parser['year'])->whereMonth($column, $parser['month']),

            'compare' => $query->where($column, $parser['op'], Carbon::parse($parser['value'])),
            'range'   => $query->whereBetween($column, [Carbon::parse($parser['from'])->startOfDay(), Carbon::parse($parser['to'])->endOfDay()]),
            
            'datetime_hour'   => $query->whereBetween($column, [Carbon::parse($parser['value'])->startOfHour(), Carbon::parse($parser['value'])->endOfHour()]),
            'datetime_minute' => $query->whereBetween($column, [Carbon::parse($parser['value'])->startOfMinute(), Carbon::parse($parser['value'])->endOfMinute()]),
            'datetime'        => $query->whereBetween($column, [Carbon::parse($parser['value'])->startOfSecond(), Carbon::parse($parser['value'])->endOfSecond()]),
            
            'expired'     => $query->where($column, '<=', Carbon::now()),
            'not_expired' => $query->where(fn($q) => $q->where($column, '>', Carbon::now())->orWhereNull($column)),

            default => $query
        };

    }

}
