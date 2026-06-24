<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\TenantModel;
use App\Support\Context;
use App\Support\Database;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Monolog\Handler\TestHandler;
use Monolog\Level;
use Tests\TestCase;

class TenantProbeModel extends TenantModel {

    protected $table = 'tenant_probes';
    protected $fillable = ['name'];

}

class TenantIsolationTest extends TestCase {

    private const TENANT_A = '0192f000-0000-7000-8000-00000000aaaa';
    private const TENANT_B = '0192f000-0000-7000-8000-00000000bbbb';

    protected function setUp (): void {

        parent::setUp();

        Schema::dropIfExists('tenant_probes');
        Schema::create('tenant_probes', function ( Blueprint $table ): void {

            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('name');
            $table->timestamps();

        });

    }
    protected function tearDown (): void {

        Context::forget();

        parent::tearDown();

    }
    private function actingForTenant ( ?string $tenantId, string $panel, \Closure $fn ): mixed {

        Context::set($panel, $panel, $tenantId, $tenantId === null ? null : 'user-' . $tenantId);

        try {

            return $fn();

        } finally {

            Context::forget();

        }

    }
    public function test_never_leaks_across_tenants (): void {

        $this->actingForTenant(self::TENANT_B, 'admin', fn () => TenantProbeModel::create(['name' => 'b1']));

        $this->actingForTenant(self::TENANT_A, 'admin', function (): void {

            $this->assertSame(0, TenantProbeModel::query()->count(), 'tenant A must not see tenant B rows');
            $this->assertNull(TenantProbeModel::query()->first(), 'tenant A must not resolve a tenant B row');

        });

    }
    public function test_create_stamps_the_acting_tenant (): void {

        $row = $this->actingForTenant(self::TENANT_A, 'admin', fn () => TenantProbeModel::create(['name' => 'a1']));

        $this->assertSame(self::TENANT_A, $row->getAttribute('tenant_id'), 'create must stamp the acting tenant via Context');
        $this->assertTrue(Database::isUuid((string) $row->getKey()), 'the primary key must be a UUIDv7');

    }
    public function test_no_tenant_and_not_super_is_fail_closed (): void {

        $this->actingForTenant(self::TENANT_B, 'admin', fn () => TenantProbeModel::create(['name' => 'b1']));

        Context::set('guest', 'guest', null, null);

        $this->assertSame(0, TenantProbeModel::query()->count(), 'no tenant + not super must return zero rows, never all');

        Context::forget();

    }
    public function test_super_bypass_spans_tenants_and_is_audited (): void {

        $this->actingForTenant(self::TENANT_A, 'admin', fn () => TenantProbeModel::create(['name' => 'a1']));
        $this->actingForTenant(self::TENANT_B, 'admin', fn () => TenantProbeModel::create(['name' => 'b1']));

        $handler = new TestHandler();
        app('log')->channel()->getLogger()->pushHandler($handler);

        Context::set('super', 'super', null, 'super-1');

        $this->assertSame(0, TenantProbeModel::query()->count(), 'super must have no ambient cross-tenant access');

        $all = TenantProbeModel::withoutTenancy(fn (): int => TenantProbeModel::query()->count());

        $this->assertSame(2, $all, 'super withoutTenancy must span tenants');
        $this->assertTrue($handler->hasRecordThatContains('tenancy.bypass', Level::Warning), 'the cross-tenant bypass must be audited');
        $this->assertSame(0, TenantProbeModel::query()->count(), 'the tenant scope must restore after the bypass');

        Context::forget();

    }
    public function test_without_tenancy_is_forbidden_to_non_super (): void {

        Context::set('admin', 'admin', self::TENANT_A, 'uA');

        $this->expectException(\RuntimeException::class);

        try {

            TenantProbeModel::withoutTenancy(fn (): int => TenantProbeModel::query()->count());

        } finally {

            Context::forget();

        }

    }
    public function test_rls_defense_in_depth (): void {

        if ( DB::connection()->getDriverName() !== 'pgsql' ) {

            $this->markTestSkipped('RLS is Postgres-only defense-in-depth; the test DB is sqlite, which has no RLS. Application-scope isolation (the PRIMARY layer) is verified by the cases above. Provision a pgsql test connection + an RLS migration (FORCE ROW LEVEL SECURITY + tenant policy, app connecting as non-owner) to exercise this layer.');

        }

        $this->markTestSkipped('RLS policy not yet provisioned on the probe table; deferred infrastructure.');

    }

}
