<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\Permission;
use App\Support\Cache;
use App\Support\Context;
use App\Support\Database;
use App\Traits\Dna\Permissions\Resolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RbacResolverTest extends TestCase {

    use RefreshDatabase;

    private string $tenant;

    protected function setUp (): void {

        parent::setUp();

        $this->tenant = Database::uuid();
        Context::set('admin', 'admin', $this->tenant, 'actor');
        Cache::flush();
        Resolver::forget($this->tenant);
        Resolver::forgetAll();

    }
    protected function tearDown (): void {

        Context::forget();

        parent::tearDown();

    }
    private function permission ( string $key ): string {

        return (string) Permission::query()->create(['key' => $key])->id;

    }
    /** @param array<string, mixed> $attrs */
    private function setting ( array $attrs ): void {

        DB::table('permission_settings')->insert(array_merge([
            'id'          => Database::uuid(),
            'tenant_id'   => null,
            'role'        => null,
            'target_type' => null,
            'target_id'   => null,
            'user_id'     => null,
            'allow'       => false,
            'locked'      => false,
            'created_at'  => now(),
            'updated_at'  => now(),
        ], $attrs));

        Resolver::forget($this->tenant);
        Resolver::forgetAll();

    }
    public function test_missing_rule_is_fail_closed_deny (): void {

        $this->permission('view_products');

        $result = Resolver::resolve($this->tenant, 'view_products');

        $this->assertFalse($result['allow'], 'no rule must deny');
        $this->assertSame('deny', $result['source']);
        $this->assertFalse(Resolver::allows($this->tenant, 'no_such_permission'), 'an unknown permission must deny');

    }
    public function test_super_locked_row_is_final_over_a_tenant_override (): void {

        $id = $this->permission('view_products');
        $this->setting(['permission_id' => $id, 'scope' => 'tenant', 'authority' => 'tenant', 'allow' => true, 'tenant_id' => $this->tenant]);
        $this->setting(['permission_id' => $id, 'scope' => 'global', 'authority' => 'super', 'allow' => false, 'locked' => true]);

        $result = Resolver::resolve($this->tenant, 'view_products');

        $this->assertFalse($result['allow'], 'a super locked=false is final');
        $this->assertTrue($result['locked'], 'the verdict is locked (rendered faded)');
        $this->assertSame('super:global', $result['source']);

    }
    public function test_most_specific_allow_wins_when_nothing_is_locked (): void {

        $id = $this->permission('allow_comments');
        $this->setting(['permission_id' => $id, 'scope' => 'tenant', 'authority' => 'tenant', 'allow' => true, 'tenant_id' => $this->tenant]);
        $this->setting(['permission_id' => $id, 'scope' => 'entity', 'authority' => 'tenant', 'role' => 'vendor', 'allow' => false, 'tenant_id' => $this->tenant]);

        $this->assertFalse(Resolver::allows($this->tenant, 'allow_comments', 'vendor'), 'entity (more specific) wins for vendor');
        $this->assertTrue(Resolver::allows($this->tenant, 'allow_comments', 'admin'), 'tenant baseline wins where entity does not match');

    }
    public function test_a_write_busts_exactly_its_tag_and_a_second_resolve_reflects_it (): void {

        $id = $this->permission('allow_likes');

        $this->assertFalse(Resolver::allows($this->tenant, 'allow_likes'), 'baseline deny (cached)');

        DB::table('permission_settings')->insert([
            'id'         => Database::uuid(),
            'tenant_id'  => $this->tenant,
            'permission_id' => $id,
            'scope'      => 'tenant',
            'authority'  => 'tenant',
            'role'       => null,
            'target_type' => null,
            'target_id'  => null,
            'user_id'    => null,
            'allow'      => true,
            'locked'     => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertFalse(Resolver::allows($this->tenant, 'allow_likes'), 'still the cached deny before the bust');

        Resolver::forget($this->tenant);

        $this->assertTrue(Resolver::allows($this->tenant, 'allow_likes'), 'after the bust the grant is reflected');

    }

}
