<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\Permission;
use App\Models\PermissionSetting;
use App\Models\User;
use App\Support\Context;
use App\Traits\Dna\HasTenant;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\HasApiTokens;
use Tests\TestCase;

class RbacSchemaTest extends TestCase {

    use RefreshDatabase;

    private const TENANT_A = '0192f000-0000-7000-8000-00000000aaaa';
    private const TENANT_B = '0192f000-0000-7000-8000-00000000bbbb';

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
    public function test_migrations_build_the_rbac_schema (): void {

        foreach ( ['users', 'roles', 'permissions', 'permission_settings', 'user_roles'] as $table ) {

            $this->assertTrue(Schema::hasTable($table), "table {$table} must exist");

        }

        $this->assertTrue(Schema::hasColumns('users', ['id', 'tenant_id', 'email', 'password']));
        $this->assertTrue(Schema::hasColumns('permission_settings', ['tenant_id', 'permission_id', 'scope', 'authority', 'allow', 'locked']));

    }
    public function test_user_resolves_with_tenant_and_token_traits_and_relations (): void {

        $traits = class_uses_recursive(User::class);

        $this->assertContains(HasTenant::class, $traits, 'User must use HasTenant');
        $this->assertContains(HasApiTokens::class, $traits, 'User must be Sanctum token-ready');
        $this->assertInstanceOf(BelongsToMany::class, ( new User() )->roles());
        $this->assertArrayHasKey('roles', ( new User() )->relations());

    }
    public function test_users_isolate_across_tenants_with_per_tenant_email (): void {

        $this->actingForTenant(self::TENANT_B, 'admin', fn () => User::query()->create(['name' => 'Bob', 'email' => 'bob@x.com', 'password' => 'secret']));

        $this->actingForTenant(self::TENANT_A, 'admin', function (): void {

            $this->assertSame(0, User::query()->count(), 'tenant A must not see tenant B users');

            $user = User::query()->create(['name' => 'Bob A', 'email' => 'bob@x.com', 'password' => 'secret']);

            $this->assertSame(self::TENANT_A, $user->getAttribute('tenant_id'), 'create stamps the acting tenant');

        });

        Context::set('super', 'super', null, 'super-1');

        $this->assertSame(2, User::withoutTenancy(fn (): int => User::query()->count()), 'same email registers once per tenant');

        Context::forget();

    }
    public function test_permission_settings_isolate_across_tenants (): void {

        $permission = Permission::query()->create(['key' => 'view_products', 'group' => 'products']);

        $this->actingForTenant(self::TENANT_B, 'admin', fn () => PermissionSetting::query()->create(['permission_id' => $permission->id, 'scope' => 'tenant', 'authority' => 'tenant', 'allow' => true]));

        $this->actingForTenant(self::TENANT_A, 'admin', function (): void {

            $this->assertSame(0, PermissionSetting::query()->count(), 'tenant A must not see tenant B permission settings');

        });

    }

}
