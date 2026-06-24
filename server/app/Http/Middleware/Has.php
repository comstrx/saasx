<?php

declare(strict_types=1);

namespace App\Http\Middleware;
use App\Models\User;
use App\Support\Context;
use App\Support\Response;
use App\Support\Str;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class Has {

    /** @param Closure(Request): BaseResponse $next */
    public function handle ( Request $request, Closure $next, string $key ): BaseResponse {

        $actor = $this->actor();
        $permission = $this->permission($key, $request->getMethod());

        if ( $actor === null || $permission === null || ! $actor->can($permission) ) return Response::error('permission', 'This action is unauthorized.', 403);

        return $next($request);

    }
    protected function actor (): ?User {

        $id = Context::userId();

        return $id === null ? null : User::query()->withoutGlobalScope('tenant')->find($id);

    }
    protected function permission ( string $key, string $method ): ?string {

        if ( Str::contains($key, '_') ) return $key;

        $verb = match ( $method ) {
            'GET', 'HEAD'  => 'view',
            'POST'         => 'add',
            'PUT', 'PATCH' => 'edit',
            'DELETE'       => 'delete',
            default        => null,
        };

        return $verb === null ? null : $verb . '_' . $key;

    }

}
