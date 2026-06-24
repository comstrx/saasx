<?php

declare(strict_types=1);

namespace App\Traits\Dna;
use App\Support\Context;
use App\Support\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasTenant {

    protected const TENANT_SENTINEL = '00000000-0000-0000-0000-000000000000';

    protected static bool $tenancyBypassed = false;

    protected static function bootHasTenant (): void {

        static::addGlobalScope('tenant', static function ( Builder $query ): void {

            if ( self::$tenancyBypassed ) return;

            $query->where($query->getModel()->getTable() . '.tenant_id', Context::tenantId() ?? self::TENANT_SENTINEL);

        });
        static::creating(static function ( Model $model ): void {

            if ( $model->getAttribute('tenant_id') === null ) $model->setAttribute('tenant_id', Context::tenantId());

        });

    }
    public static function withoutTenancy ( \Closure $fn ): mixed {

        if ( ! Context::isSuper() ) throw new \RuntimeException('Cross-tenant access requires a super context.');

        Log::warning('tenancy.bypass', ['role' => Context::role(), 'tenant' => Context::tenantId(), 'user' => Context::userId()]);

        $previous = static::$tenancyBypassed;
        static::$tenancyBypassed = true;

        try {

            return $fn();

        } finally {

            static::$tenancyBypassed = $previous;

        }

    }

}
