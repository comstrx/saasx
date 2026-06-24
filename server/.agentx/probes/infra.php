<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\Redis;
use App\Support\Context;
use App\Support\Lock;
use App\Support\Throttle;
use App\Support\Cache;
use App\Support\Queue;
use App\Support\Queue\Tenant as QTenant;
function L($s){ echo $s."\n"; }
$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';
function as_t($t,$fn){ Context::set('admin','admin',$t,'u'); try { return $fn(); } finally { Context::forget(); } }

// ---- LOCK: mutual exclusion + tenant isolation of the same logical key ----
$held = as_t($tA, function(){
  $ok1 = Lock::acquire('order:42', 10);
  $ok2 = Lock::acquire('order:42', 10);   // same tenant, same key, second must fail (contended)
  return [$ok1,$ok2];
});
L("LOCK same-tenant contention [acquire1, acquire2(expect false)] = ".json_encode($held));
// other tenant acquires same logical key -> must succeed (tenant-isolated)
$bOk = as_t($tB, fn()=> Lock::acquire('order:42', 10));
L("LOCK other-tenant same key acquire (expect true) = ".var_export($bOk,true));
// show raw redis keys carry tenant prefix
$keys = Redis::connection('lock')->keys('*order:42*');
L("LOCK raw redis keys: ".json_encode($keys));
as_t($tA, fn()=> Lock::release('order:42')); as_t($tB, fn()=> Lock::release('order:42'));

// ---- LOCK block() releases on throw ----
$threw=false;
try { as_t($tA, fn()=> Lock::block('job:1', 5, function(){ throw new \RuntimeException('boom'); })); } catch(\Throwable $e){ $threw=true; }
$reacquired = as_t($tA, fn()=> Lock::acquire('job:1', 5));
L("LOCK block() released-on-throw? threw=".var_export($threw,true)." reacquire-after=".var_export($reacquired,true)." (expect true)");
as_t($tA, fn()=> Lock::release('job:1'));

// ---- THROTTLE: deny over window + retryAfter + tenant isolation ----
as_t($tA, function(){ Throttle::clear('login'); });
$res = as_t($tA, function(){
  $out=[];
  for($i=0;$i<4;$i++){ try { Throttle::attempt('login',2,60, fn()=>'ok'); $out[]='ok'; } catch(\Throwable $e){ $out[]='DENY'; } }
  return [$out, Throttle::retryAfter('login')];
});
L("THROTTLE max=2 over 4 tries = ".json_encode($res[0])." retryAfter=".$res[1]." (expect [ok,ok,DENY,DENY], retryAfter>0)");
$bThrottle = as_t($tB, fn()=> Throttle::tooMany('login',2,60));
L("THROTTLE other-tenant same key tooMany (expect false, isolated) = ".var_export($bThrottle,true));
as_t($tA, fn()=> Throttle::clear('login'));

// ---- CACHE: tenant isolation + tag invalidation ----
as_t($tA, fn()=> Cache::set('k1','A-value',60,['grp']));
as_t($tB, fn()=> Cache::set('k1','B-value',60,['grp']));
$av = as_t($tA, fn()=> Cache::get('k1')); $bv = as_t($tB, fn()=> Cache::get('k1'));
L("CACHE tenant isolation: A='".$av."' B='".$bv."' (expect A-value / B-value, no cross-talk)");
as_t($tA, fn()=> Cache::reset('grp'));
$aAfter = as_t($tA, fn()=> Cache::get('k1')); $bAfter = as_t($tB, fn()=> Cache::get('k1'));
L("CACHE tag reset on A only: A='".var_export($aAfter,true)."' (expect NULL) B='".var_export($bAfter,true)."' (expect B-value, untouched)");
as_t($tB, fn()=> Cache::reset('grp'));

// ---- QUEUE: tenant stamp/restore round trip ----
$ctx = as_t($tA, fn()=> QTenant::stamp());
L("QUEUE stamp under A = ".json_encode($ctx));
// simulate job boundary: restore in a clean context
Context::forget();
QTenant::restore($ctx);
L("QUEUE restored tenant inside handle = ".Context::tenantId()." role=".Context::role()." (expect A/admin)");
QTenant::reset();
L("QUEUE reset after handle -> tenantId=".var_export(Context::tenantId(),true)." (expect NULL)");
L("done");
