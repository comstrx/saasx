<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\Permission;
use App\Models\PermissionSetting;
use App\Models\Role;
use App\Models\TenantModel;
use App\Models\User;
use App\Support\Cache;
use App\Support\Context;
use App\Support\Database;
use App\Traits\Dna\HasPermissions;
use App\Traits\Dna\Permissions\Resolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class GovernableWidget extends TenantModel {

    use HasPermissions;

    protected $table = 'governable_widgets';
    protected $fillable = ['name'];

}

class RbacDnaTest extends TestCase {

    use RefreshDatabase;

    private string $tenant;

    protected function setUp (): void {

        parent::setUp();

        $this->tenant = Database::uuid();

        Schema::create('governable_widgets', function ( $t ): void {

            $t->uuid('id')->primary();
            $t->uuid('tenant_id')->nullable();
            $t->string('name');
            $t->timestamps();

        });

        Cache::flush();
        Resolver::forgetAll();

    }
    protected function tearDown (): void {

        Context::forget();

        parent::tearDown();

    }
    private function actor ( ?string $role = null, bool $super = false ): User {

        $panel = $super ? 'super' : 'admin';
        $contextRole = $super ? 'super' : ( $role ?? 'admin' );
        $tenantId = $super ? null : $this->tenant;

        Context::set($panel, $contextRole, $tenantId, null);

        $user = User::query()->create(['name' => 'A', 'email' => Database::uuid() . '@x.com', 'password' => 'secret']);

        if ( $role !== null && ! $super ) {

            $roleModel = Role::query()->create(['tenant_id' => $this->tenant, 'role' => $role, 'is_super' => false]);
            $user->roles()->attach($roleModel->id, ['id' => Database::uuid(), 'tenant_id' => $this->tenant]);

        }

        Context::set($panel, $contextRole, $tenantId, (string) $user->id);

        return $user;

    }
    private function neighbour (): User {

        $tenant = Database::uuid();

        Context::set('admin', 'admin', $tenant, null);

        $user = User::query()->create(['name' => 'B', 'email' => Database::uuid() . '@x.com', 'password' => 'secret']);

        Context::set('admin', 'admin', $tenant, (string) $user->id);

        return $user;

    }
    public function test_user_mounts_traits_and_can_is_fail_closed_then_reflects_a_grant (): void {

        $user = $this->actor('admin');

        Permission::query()->create(['key' => 'view_products']);

        $this->assertFalse($user->can('view_products'), 'no rule → fail-closed deny');

        $user->grant('view_products', 'tenant');

        $this->assertTrue($user->can('view_products'), 'after the tenant grant the actor can');

    }
    public function test_has_role_reads_membership_server_side (): void {

        $user = $this->actor('vendor');

        $this->assertTrue($user->hasRole('vendor'));
        $this->assertTrue($user->hasRole(['admin', 'vendor']));
        $this->assertFalse($user->hasRole('delivery'));
        $this->assertFalse($user->isSuper());

    }
    public function test_a_model_gains_item_level_governance_through_the_same_cascade (): void {

        $this->actor('admin');
        Permission::query()->create(['key' => 'allow_comments']);

        $widget = GovernableWidget::query()->create(['name' => 'w1']);

        $this->assertFalse($widget->can('allow_comments'), 'item-level fail-closed');

        $widget->grant('allow_comments', 'item');

        $this->assertTrue($widget->can('allow_comments'), 'the item grant resolves through the cascade');

    }
    public function test_super_force_sets_and_locks_rendered_faded_in_setting (): void {

        $user = $this->actor('super', true);
        Permission::query()->create(['key' => 'allow_payouts']);

        $user->force('allow_payouts', 'global', false, true);

        $verdict = $user->setting('allow_payouts');

        $this->assertFalse($verdict['allow']);
        $this->assertTrue($verdict['locked'], 'a super lock renders the toggle faded/read-only');
        $this->assertSame('super:global', $verdict['source']);

    }
    public function test_tenant_grant_on_a_super_locked_permission_is_refused (): void {

        $super = $this->actor('super', true);
        Permission::query()->create(['key' => 'allow_payouts']);
        $super->force('allow_payouts', 'global', false, true);

        $tenantAdmin = $this->actor('admin');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('locked by a higher authority');

        $tenantAdmin->grant('allow_payouts', 'tenant');

    }
    public function test_a_tenant_cannot_escalate_through_a_global_or_unknown_scope_and_neighbours_stay_isolated (): void {

        Permission::query()->create(['key' => 'view_products']);

        $tenantA = $this->actor('admin');

        try {

            $tenantA->grant('view_products', 'global');
            $this->fail('a tenant grant at global scope must be refused');

        } catch ( \RuntimeException $e ) {

            $this->assertStringContainsString('tenant may only write', $e->getMessage());

        }

        try {

            $tenantA->grant('view_products', 'workspace');
            $this->fail('an unknown scope must be refused');

        } catch ( \RuntimeException $e ) {

            $this->assertStringContainsString('tenant may only write', $e->getMessage());

        }

        $this->assertSame(0, PermissionSetting::query()->withoutGlobalScope('tenant')->count(), 'no row escaped the scope guard');

        $tenantA->grant('view_products', 'tenant');

        $this->assertTrue($tenantA->can('view_products'), 'the legitimate tenant grant lands');

        $tenantB = $this->neighbour();

        $this->assertFalse($tenantB->can('view_products'), 'tenant B is unaffected by anything tenant A wrote');

    }
    public function test_a_super_force_busts_the_target_tenant_cache_across_contexts (): void {

        Permission::query()->create(['key' => 'allow_payouts']);

        $tenantUser = $this->actor('admin');
        $tenantUser->grant('allow_payouts', 'tenant');

        $this->assertTrue($tenantUser->can('allow_payouts'), 'the tenant allow is cached under the target tenant');

        $super = $this->actor('super', true);
        $super->force('allow_payouts', 'global', false, true);

        Context::set('admin', 'admin', $this->tenant, (string) $tenantUser->id);

        $verdict = $tenantUser->setting('allow_payouts');

        $this->assertFalse($verdict['allow'], 'the super force reaches the tenant immediately, no TTL wait');
        $this->assertTrue($verdict['locked']);
        $this->assertSame('super:global', $verdict['source']);

    }

}
