<?php
declare(strict_types=1);

namespace {
    require __DIR__ . '/../../vendor/autoload.php';
    $GLOBALS['app'] = require __DIR__ . '/../../bootstrap/app.php';
    $GLOBALS['app']->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
}

namespace App\Http\Resources { class UserResource extends BaseResource {} }
namespace App\Repositories {
    use App\Models\User;
    class ProbeUserRepository extends BaseRepository {
        public array $booted = [];
        public function __construct(){ parent::__construct(new User()); }
        /** @return array<string,mixed> */
        public function fields(array $data = []): array {
            return ['name'=>$data['name'] ?? null, 'email'=>$data['email'] ?? null, 'password'=>$data['password'] ?? 'x'];
        }
        public function createBoot(\Illuminate\Database\Eloquent\Model $m, array $d): void { $this->booted[] = (string)$m->getKey(); }
    }
}
namespace App\Services {
    class ProbeUserService extends BaseService {
        protected function name(): string { return 'User'; }
        public function __construct(\App\Repositories\ProbeUserRepository $r){ parent::__construct($r); }
    }
}

namespace {
use Illuminate\Support\Facades\DB;
use App\Support\Context;
use App\Support\Cache;
use App\Models\User;
use App\Http\Resources\UserResource;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
function L($s){ echo $s."\n"; }
Cache::flush();
$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';
DB::statement("delete from users");
Context::set('admin','admin',$tA,'op');
$repo = new App\Repositories\ProbeUserRepository();

$m = $repo->store(['name'=>'Alice','email'=>'alice@x.com','password'=>'secret','tenant_id'=>$tB,'id'=>'00000000-0000-7000-8000-000000000999','email_verified_at'=>'2020-01-01','evil'=>1]);
$id=(string)$m->getKey();
$row=DB::selectOne("select tenant_id,name,email from users where id=?",[$id]);
L("STORE: tenant_id stamped A not B? ".var_export($row->tenant_id===$tA,true)."  id!=injected? ".var_export($id!=='00000000-0000-7000-8000-000000000999',true)."  createBoot ran? ".(in_array($id,$repo->booted,true)?'yes':'NO'));

$repo->store(['name'=>'Bob','email'=>'bob@x.com']);
$repo->store(['name'=>'Dan','email'=>'dan@x.com']);
$list=$repo->index(['limit'=>1]);
L("INDEX keys=".json_encode(array_keys($list))." meta=".json_encode($list['meta']??[]));

$p1=$repo->index(['limit'=>1]); $cur=$p1['meta']['cursor'];
$p1id=json_decode(json_encode($p1['items']),true)[0]['id'] ?? null;
$p2=$repo->index(['limit'=>1,'cursor'=>$cur]);
$p2id=json_decode(json_encode($p2['items']),true)[0]['id'] ?? null;
L("KEYSET: p1=".substr((string)$p1id,-6)." p2=".substr((string)$p2id,-6)." distinct? ".($p1id!==$p2id?'yes':'NO-DUP'));

$show=$repo->show($id);
L("SHOW keys=".json_encode(array_keys($show))." item is UserResource? ".(($show['item']??null) instanceof UserResource?'yes':'no'));

$before=DB::selectOne("select password,name from users where id=?",[$id]);
$repo->update($id,['name'=>'Alice2']);
$after=DB::selectOne("select password,name from users where id=?",[$id]);
L("UPDATE name '".$before->name."'->'".$after->name."' password untouched? ".($before->password===$after->password?'yes':'NO'));

$res=(new UserResource(User::find($id)))->toArray(request());
L("RESOURCE keys=".json_encode(array_keys($res))." any null value? ".(in_array(null,$res,true)?'YES':'no'));

$svc = new App\Services\ProbeUserService($repo);
$c1 = $svc->index(['limit'=>50]); $cnt1 = count(json_decode(json_encode($c1['items']),true));
$svc->store(['name'=>'Carol','email'=>'carol@x.com']);
$c2 = $svc->index(['limit'=>50]); $cnt2 = count(json_decode(json_encode($c2['items']),true));
L("SERVICE cache-bust: before=".$cnt1." after-store=".$cnt2." (expect +1, not stale)");

$ok=$repo->delete($id);
L("DELETE ".var_export($ok,true)." remaining=".DB::selectOne("select count(*) c from users")->c);
Context::forget(); Cache::flush();
L("done");
}
