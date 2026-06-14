<?php

namespace App\Traits\Model\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

trait Statistics {

    use Helpers;

    protected function fillMissingPeriods ( array $data, Carbon $from, Carbon $to, string $group ) {

        $filled = [];

        $cursor = $from->copy()->startOf(match ($group) {
            'day'     => 'day',
            'week'    => 'week',
            'month'   => 'month',
            'quarter' => 'quarter',
            'year'    => 'year',
            default   => 'day',
        });
        while ( $cursor <= $to ) {

            $key = match ( $group ) {
                'day'     => $cursor->format('Y-m-d'),
                'week'    => $cursor->startOfWeek()->format('Y-m-d'),
                'month'   => $cursor->format('Y-m'),
                'quarter' => $cursor->format('Y-m'),
                'year'    => $cursor->format('Y'),
                default   => $cursor->format('Y-m-d'),
            };
            match ( $group ) {
                'day'     => $cursor->addDay(),
                'week'    => $cursor->addWeek(),
                'month'   => $cursor->addMonth(),
                'quarter' => $cursor->addMonths(1),
                'year'    => $cursor->addYear(),
                default   => $cursor->addDay(),
            };

            $filled[$key] = $data[$key] ?? 0;

        }
        return match ( $group ) {
            'year' => collect($filled)->mapWithKeys(fn($v, $k) => [substr($k, 0, 4) => $v])->toArray(),
            'quarter' => collect($filled)->filter(fn($_, $k) => in_array(substr($k, 5, 2), ['01', '04', '07', '10']))->toArray(),
            default => $filled
        };

    }
    protected function generateOptions ( Builder $query, array $options = [] ) {

        $now         = now();
        $type        = strtolower($options['type'] ?? 'period');
        $period      = $options['period'] ?? 'week';
        $autoFill    = $options['auto_fill'] ?? true;
        $labelcolumn = $options['column'] ?? 'status';
        $dateColumn  = $query->getModel()->resolveColumn($options['date_column'] ?? 'created_at');
        $result      = ['labels' => [], 'data' => [], 'name' => $this->getModelName(), 'total' => (clone $query)->count()];
        
        $query->reorder();
        
        $group = match ( $period ) {
            'day'     => 'day',
            'week'    => 'day',
            'month'   => 'day',
            'quarter' => 'month',
            'year'    => 'month',
            '7years'  => 'year',
            default   => 'day',
        };
        $dateFormat = match ( $group ) {
            'day'   => '%Y-%m-%d',
            'week'  => '%Y-%m-%d',
            'month' => '%Y-%m',
            'year'  => '%Y',
            default => '%Y-%m-%d',
        };
        [$from, $to] = match ( $period ) {
            'day'     => [ $now->copy()->startOfDay(), $now->copy()->endOfDay() ],
            'week'    => [ $now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay() ],
            'month'   => [ $now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay() ],
            'quarter' => [ $now->copy()->subMonths(2)->startOfMonth(), $now->copy()->endOfDay() ],
            'year'    => [ $now->copy()->subMonths(11)->startOfMonth(), $now->copy()->endOfDay() ],
            '7years'  => [ $now->copy()->subYears(6)->startOfYear(), $now->copy()->endOfYear() ],
            default   => [ $now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay() ],
        };
        return [
            'to'           => $to,
            'from'         => $from,
            'type'         => $type,
            'group'        => $group,
            'date_format'  => $dateFormat,
            'auto_fill'    => $autoFill,
            'label_column' => $labelcolumn,
            'date_column'  => $dateColumn,
            'result'       => $result,
        ];

    }
    protected function generateLabels ( Builder $query, array $options = [] ) {

        [$labelColumn, $dateColumn, $from, $to, $result] = [
            $options['label_column'],
            $options['date_column'],
            $options['from'],
            $options['to'],
            $options['result'],
        ];

        if ( !$this->getModel()->hasColumn($labelColumn) ) return $result;

        $data = $query->whereBetween($dateColumn, [$from, $to])
            ->groupBy($labelColumn)
            ->selectRaw("$labelColumn as label, COUNT(*) as total")
            ->pluck('total', 'label')
            ->toArray();

        [$result['labels'], $result['data']] = [array_keys($data), array_values($data)];

        return $result;

    }
    protected function generatePeriods ( Builder $query, array $options = [] ) {

        [$labelColumn, $dateColumn, $dateFormat, $autoFill, $from, $to, $type, $group, $result] = [
            $options['label_column'],
            $options['date_column'],
            $options['date_format'],
            $options['auto_fill'],
            $options['from'],
            $options['to'],
            $options['type'],
            $options['group'],
            $options['result'],
        ];

        $expression = in_array($type, ['sum', 'avg', 'max', 'min']) ? strtoupper($type) . "($labelColumn)" : "COUNT(*)";

        $data = $query->whereBetween($dateColumn, [$from, $to])
            ->groupBy('period')
            ->selectRaw("DATE_FORMAT({$dateColumn}, '{$dateFormat}') as period, $expression as total")
            ->orderBy('period')
            ->pluck('total', 'period')
            ->toArray();

        if ( $autoFill ) $data = $this->fillMissingPeriods($data, $from, $to, $group);
        [$result['labels'], $result['data']] = [array_keys($data), array_values($data)];

        return $result;

    }
    protected function statistics ( Builder $query, array $options = [] ) {

        $options = $this->generateOptions($query, $options);

        return match ( strtolower(string($options['type'])) ) {
            'label' => $this->generateLabels($query, $options),
            default => $this->generatePeriods($query, $options),
        };

    }

}
