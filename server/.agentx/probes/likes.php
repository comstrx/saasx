<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
use App\Support\Context;
use App\Support\Cache;
use App\Models\User;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
function L($s){ echo $s."\n"; }
Cache::flush();
$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';
DB::statement("delete from likes"); DB::statement("delete from permission_settings"); DB::statement("delete from permissions"); DB::statement("delete from users");
DB::insert("insert into permissions (id,key,\"group\",label,created_at,updated_at) values (?,?,?,?,now(),now())",['01890000-0000-7000-8000-0000000000e1','allow_likes','social','Likes']);

// create user U in tenant A
Context::set('admin','admin',$tA,null);
$u = User::create(['name'=>'U','email'=>'u@x.com','password'=>'x']);
$uid = (string)$u->getKey();
Context::set('admin','admin',$tA,$uid);
$u = User::find($uid);

// 1) GATE CLOSED before grant
$closed=false; try { $u->like(); } catch (\Throwable $e){ $closed = str_contains($e->getMessage(),'unauthorized') || $e instanceof \Illuminate\Http\Exceptions\HttpResponseException; }
L("LIKE gate CLOSED before grant (expect true): ".var_export($closed,true)." likes=".DB::selectOne("select count(*) c from likes")->c);

// 2) grant allow_likes via real 0017 write surface, then like
$u->grant('allow_likes','tenant'); Cache::flush();
$u->like();
$row = DB::selectOne("select tenant_id,user_id,value from likes");
L("LIKE after grant: rows=".DB::selectOne("select count(*) c from likes")->c." tenant_id==A:".var_export($row->tenant_id===$tA,true)." user_id==U:".var_export($row->user_id===$uid,true)." value=".var_export($row->value,true));
L("  likesCount()=".$u->likesCount()." (expect 1)  liked()=".var_export($u->liked(),true));

// 3) idempotent repeat like (no double count)
$u->like(); $u->like();
L("LIKE repeat x2 -> rows=".DB::selectOne("select count(*) c from likes")->c." likesCount()=".$u->likesCount()." (expect rows=1, count=1, no double)");

// 4) flip to dislike
$u->like(false);
$r2=DB::selectOne("select count(*) c, bool_and(value) v from likes");
L("FLIP to dislike -> rows=".$r2->c." value=".var_export($r2->v,true)." likesCount=".$u->likesCount()." dislikesCount=".$u->dislikesCount()." (expect rows=1,value=f,likes=0,dislikes=1)");

// 5) unlike
$u->unlike();
L("UNLIKE -> rows=".DB::selectOne("select count(*) c from likes")->c." likesCount=".$u->likesCount()." (expect 0/0)");

// 6) cross-tenant: tenant B user cannot see A's like (re-like as A first)
$u->like();
Context::set('admin','admin',$tB,null); $ub=User::create(['name'=>'UB','email'=>'ub@x.com','password'=>'x']);
Context::set('admin','admin',$tB,(string)$ub->getKey());
L("CROSS-TENANT: B sees likes table rows (scoped) = ".\App\Models\Like::count()." (expect 0 — A's like invisible to B)");

// 7) N+1 / lazy-loading tripwire + eager-load
Context::set('admin','admin',$tA,$uid);
$lazyBlocked='n/a';
if (method_exists($u,'getWithRelations')) {
  // lazy access without eager-load: tripwire should fire if preventLazyLoading is on
  try { $fresh=User::find($uid); $rolesLazy=$fresh->roles; $lazyBlocked='allowed(count='.$rolesLazy->count().')'; }
  catch(\Illuminate\Database\LazyLoadingViolationException $e){ $lazyBlocked='BLOCKED(tripwire active)'; }
  // eager path: count queries for a list
  DB::flushQueryLog(); DB::enableQueryLog();
  $q=User::query(); $q=$u->getWithRelations($q); $list=$q->get();
  foreach($list as $row){ $row->roles; } // would N+1 if not eager
  $n=count(DB::getQueryLog()); DB::disableQueryLog();
  L("N+1: list of ".$list->count()." users, total queries=".$n." (eager => ~2, N+1 => grows with rows). lazy tripwire=".$lazyBlocked);
} else { L("N+1: User has no getWithRelations (HasRelations not mounted)"); }
Context::forget(); Cache::flush();
L("done");
