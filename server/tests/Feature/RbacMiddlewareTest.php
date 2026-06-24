<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Cache;
use App\Support\Context;
use App\Support\Database;
use App\Support\Response;
use App\Traits\Dna\Permissions\Resolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RbacMiddlewareTest extends TestCase {

    use RefreshDatabase;

    private string $tenant;

    protected function setUp (): void {

        parent::setUp();

        $this->tenant = Database::uuid();

        Cache::flush();
        Resolver::forgetAll();

        Route::middleware('has:products')->get('/t/products', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('has:products')->post('/t/products', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('has:products')->put('/t/products/{id}', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('has:products')->delete('/t/products/{id}', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('has:allow_statistics')->get('/t/stats', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('role:admin')->get('/t/admin-only', static fn (): mixed => Response::success(['ok' => true]));
        Route::middleware('role:admin,vendor')->get('/t/multi', static fn (): mixed => Response::success(['ok' => true]));

    }
    protected function tearDown (): void {

        Context::forget();

        parent::tearDown();

    }
    private function actor ( string $role = 'admin' ): User {

        Context::set('admin', $role, $this->tenant, null);

        $user = User::query()->create(['name' => 'A', 'email' => Database::uuid() . '@x.com', 'password' => 'secret']);

        $roleModel = Role::query()->create(['tenant_id' => $this->tenant, 'role' => $role, 'is_super' => false]);
        $user->roles()->attach($roleModel->id, ['id' => Database::uuid(), 'tenant_id' => $this->tenant]);

        Context::set('admin', $role, $this->tenant, (string) $user->id);

        return $user;

    }
    public function test_has_denies_without_the_permission_and_passes_after_a_grant (): void {

        $user = $this->actor('admin');
        Permission::query()->create(['key' => 'view_products']);

        $this->getJson('/t/products')->assertStatus(403);

        $user->grant('view_products', 'tenant');

        $this->getJson('/t/products')->assertOk()->assertJsonPath('data.ok', true);

    }
    public function test_has_derives_the_crud_key_from_the_request_method (): void {

        $user = $this->actor('admin');

        foreach ( ['view_products', 'add_products', 'edit_products', 'delete_products'] as $key ) Permission::query()->create(['key' => $key]);

        $user->grant('view_products', 'tenant');
        $user->grant('edit_products', 'tenant');

        $this->getJson('/t/products')->assertOk();
        $this->postJson('/t/products')->assertStatus(403);
        $this->putJson('/t/products/x')->assertOk();
        $this->deleteJson('/t/products/x')->assertStatus(403);

    }
    public function test_has_passes_an_explicit_cross_cutting_key_verbatim (): void {

        $user = $this->actor('admin');
        Permission::query()->create(['key' => 'allow_statistics']);

        $this->getJson('/t/stats')->assertStatus(403);

        $user->grant('allow_statistics', 'tenant');

        $this->getJson('/t/stats')->assertOk();

    }
    public function test_role_rejects_a_missing_role_and_admits_any_held_role (): void {

        $this->actor('vendor');

        $this->getJson('/t/admin-only')->assertStatus(403);
        $this->getJson('/t/multi')->assertOk();

    }
    public function test_role_admits_the_panel_role (): void {

        $this->actor('admin');

        $this->getJson('/t/admin-only')->assertOk();

    }
    public function test_the_gate_is_fail_closed_without_an_actor (): void {

        Context::forget();

        $this->getJson('/t/products')->assertStatus(403);
        $this->getJson('/t/admin-only')->assertStatus(403);

    }

}
