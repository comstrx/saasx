<?php

declare(strict_types=1);

namespace App\Support\Database;

class Transaction {

    /**
     * @template T
     * @param  \Closure(): T $callback
     * @return T
     */
    public static function run ( \Closure $callback, int $attempts = 1 ): mixed {

        return \Illuminate\Support\Facades\DB::transaction($callback, max(1, $attempts));

    }

}
