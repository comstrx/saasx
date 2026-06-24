<?php

declare(strict_types=1);

namespace Tests\Feature;
use App\Models\Like;
use App\Models\Permission;
use App\Models\TenantModel;
use App\Models\User;
use App\Support\Cache;
use App\Support\Context;
use App\Support\Database;
use App\Traits\Dna\Permissions\Resolver;
use App\Traits\Dna\Social\HasSocial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class LikeableWidget extends TenantModel {

    use HasSocial;

    protected $table = 'likeable_widgets';
    protected $fillable = ['name'];

}

class SocialLikesDnaTest extends TestCase {

    use RefreshDatabase;

    private string $tenant;

    protected function setUp (): void {

        parent::setUp();

        $this->tenant = Database::uuid();

        Schema::create('likeable_widgets', function ( $t ): void {

            $t->uuid('id')->primary();
            $t->uuid('tenant_id')->nullable();
            $t->string('name');
            $t->unsignedInteger('likes_count')->default(0);
            $t->unsignedInteger('dislikes_count')->default(0);
            $t->timestamps();

        });

        Cache::flush();
        Resolver::forgetAll();

    }
    protected function tearDown (): void {

        Context::forget();

        parent::tearDown();

    }
    private function actor (): User {

        Context::set('admin', 'admin', $this->tenant, null);

        $user = User::query()->create(['name' => 'A', 'email' => Database::uuid() . '@x.com', 'password' => 'secret']);

        Context::set('admin', 'admin', $this->tenant, (string) $user->id);

        return $user;

    }
    private function morphCount ( LikeableWidget $widget, bool $value ): int {

        return Like::query()->where('engageable_type', $widget->getMorphClass())->where('engageable_id', $widget->getKey())->where('value', $value)->count();

    }
    public function test_a_like_is_fail_closed_until_allow_likes_is_granted (): void {

        $this->actor();
        Permission::query()->create(['key' => 'allow_likes']);

        $widget = LikeableWidget::query()->create(['name' => 'w']);

        $this->expectException(HttpResponseException::class);

        $widget->like();

    }
    public function test_a_granted_like_toggles_tenant_stamps_and_counts_atomically (): void {

        $actor = $this->actor();
        Permission::query()->create(['key' => 'allow_likes']);
        $actor->grant('allow_likes', 'tenant');

        $widget = LikeableWidget::query()->create(['name' => 'w']);

        $widget->like();

        $this->assertTrue($widget->liked());
        $this->assertSame(1, $widget->likesCount());
        $this->assertSame(0, $widget->dislikesCount());
        $this->assertSame(1, $this->morphCount($widget, true));
        $this->assertSame(1, (int) LikeableWidget::query()->whereKey($widget->getKey())->value('likes_count'));
        $this->assertSame($this->tenant, Like::query()->where('engageable_id', $widget->getKey())->value('tenant_id'));

        $widget->like();

        $this->assertSame(1, $widget->likesCount(), 'a repeated like is idempotent and never double-counts');
        $this->assertSame(1, $this->morphCount($widget, true));

        $widget->like(false);

        $this->assertFalse($widget->liked());
        $this->assertSame(0, $widget->likesCount());
        $this->assertSame(1, $widget->dislikesCount());
        $this->assertSame(0, $this->morphCount($widget, true));
        $this->assertSame(1, $this->morphCount($widget, false));

        $widget->unlike();

        $this->assertSame(0, $widget->likesCount());
        $this->assertSame(0, $widget->dislikesCount());
        $this->assertSame(0, Like::query()->where('engageable_id', $widget->getKey())->count());

    }
    public function test_a_fresh_read_reflects_the_persisted_counter_without_recount (): void {

        $actor = $this->actor();
        Permission::query()->create(['key' => 'allow_likes']);
        $actor->grant('allow_likes', 'tenant');

        $widget = LikeableWidget::query()->create(['name' => 'w']);
        $widget->like();

        $fresh = LikeableWidget::query()->findOrFail($widget->getKey());

        $this->assertSame(1, $fresh->likesCount());
        $this->assertSame($fresh->likesCount(), $this->morphCount($fresh, true));

    }
    public function test_any_model_is_engageable_with_zero_wiring_and_the_counter_guard_falls_back_to_count (): void {

        $actor = $this->actor();
        Permission::query()->create(['key' => 'allow_likes']);
        $actor->grant('allow_likes', 'tenant');

        $target = User::query()->create(['name' => 'T', 'email' => Database::uuid() . '@x.com', 'password' => 'secret']);

        $target->like();

        $this->assertTrue($target->liked());
        $this->assertSame(1, $target->likesCount());
        $this->assertSame(0, $target->dislikesCount());

    }

}
