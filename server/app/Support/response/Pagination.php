<?php

declare(strict_types=1);

namespace App\Support\Response;

class Pagination {

    /**
     * @param  \Illuminate\Contracts\Pagination\Paginator<int, mixed> $paginator
     * @return array<string, mixed>
     */
    public static function meta ( \Illuminate\Contracts\Pagination\Paginator $paginator ): array {

        return [
            'per_page'  => $paginator->perPage(),
            'count'     => count($paginator->items()),
            'has_more'  => $paginator->hasMorePages(),
            'next_page' => $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
        ];

    }
    /**
     * @param  \Illuminate\Contracts\Pagination\CursorPaginator<int, mixed> $paginator
     * @return array<string, mixed>
     */
    public static function cursor ( \Illuminate\Contracts\Pagination\CursorPaginator $paginator ): array {

        return [
            'per_page'    => $paginator->perPage(),
            'count'       => count($paginator->items()),
            'has_more'    => $paginator->hasMorePages(),
            'next_cursor' => $paginator->nextCursor()?->encode(),
            'prev_cursor' => $paginator->previousCursor()?->encode(),
        ];

    }

}
