<?php

declare(strict_types=1);

namespace App\Http\Middleware;
use App\Models\User;
use App\Support\Context;
use App\Support\Response;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class Role {

    /** @param Closure(Request): BaseResponse $next */
    public function handle ( Request $request, Closure $next, string ...$roles ): BaseResponse {

        $actor = $this->actor();

        if ( $actor === null || ! $actor->hasRole(array_values($roles)) ) return Response::error('role', 'This action is unauthorized.', 403);

        return $next($request);

    }
    protected function actor (): ?User {

        $id = Context::userId();

        return $id === null ? null : User::query()->withoutGlobalScope('tenant')->find($id);

    }

}
