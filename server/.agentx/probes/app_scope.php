<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
use App\Support\Context;
use App\Models\User;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
DB::statement("delete from users");
function L($s){ echo $s."\n"; }
$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';
function actAs($panel,$role,$tenant,$user,$fn){ Context::set($panel,$role,$tenant,$user); try { return $fn(); } finally { Context::forget(); } }

// seed B's user under B's context (auto-stamp)
actAs('admin','admin',$tB,'u-b', fn()=> User::create(['name'=>'B','email'=>'b@x.com','password'=>'x']));
// seed A's user
actAs('admin','admin',$tA,'u-a', fn()=> User::create(['name'=>'A','email'=>'a@x.com','password'=>'x']));

// 1) A sees only A
L("A sees count=".actAs('admin','admin',$tA,'u-a', fn()=> User::count())." (expect 1)");
L("A sees B's email? ".(actAs('admin','admin',$tA,'u-a', fn()=> User::where('email','b@x.com')->exists())?'YES-LEAK':'no')." (expect no)");
// 2) stamp check
$stamped = actAs('admin','admin',$tA,'u-a', fn()=> User::where('email','a@x.com')->value('tenant_id'));
L("A's row tenant_id == tA ? ".($stamped===$tA?'yes':'NO ('.$stamped.')'));
// 3) fail-closed: no tenant, not super
$noctx = User::count(); // no Context at all
L("no-context (guest) User::count()=".$noctx." (expect 0, sentinel fail-closed)");
// 4) withoutTenancy requires super
$denied=false; try { actAs('admin','admin',$tA,'u-a', fn()=> User::withoutTenancy(fn()=>User::count())); } catch(\Throwable $e){ $denied=true; }
L("withoutTenancy as admin denied? ".($denied?'yes':'NO-LEAK'));
// 5) super withoutTenancy spans tenants
$spans = actAs('super','super',null,'u-s', fn()=> User::withoutTenancy(fn()=> User::count()));
L("super withoutTenancy count=".$spans." (expect 2, spans tenants)");
// super WITHOUT bypass sees 0 (no ambient cross-tenant)
$superNoBypass = actAs('super','super',null,'u-s', fn()=> User::count());
L("super without bypass count=".$superNoBypass." (expect 0 — no ambient default)");

// 6) THE STATIC BLEED PROBE: prove $tenancyBypassed is process-global static state.
$ref = new ReflectionClass(User::class);
// find the property (declared by trait on the using class)
$prop = null;
foreach(['tenancyBypassed'] as $p){ if($ref->hasProperty($p)){ $prop=$ref->getProperty($p); } }
if($prop){ $prop->setAccessible(true);
  L("static \$tenancyBypassed visible on User: yes, current value=".var_export($prop->getValue(),true));
  // simulate a skipped finally (fatal mid-closure) by forcing the flag true and NOT resetting
  $prop->setValue(null, true);
  $leak = User::count(); // non-super, no context, but flag stuck true
  L("LEAK SIM: flag stuck true -> non-super no-context User::count()=".$leak." (if >0, every later request on this worker reads cross-tenant)");
  $prop->setValue(null, false); // restore
} else { L("could not reflect tenancyBypassed"); }
L("done");
