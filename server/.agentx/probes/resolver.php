<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
use App\Support\Cache;
use App\Traits\Dna\Permissions\Resolver;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
function L($s){ echo $s."\n"; }
Cache::flush(); // clear rbac shared cache between runs

$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';
$pid='01890000-0000-7000-8000-0000000000f1';
DB::statement("delete from permission_settings"); DB::statement("delete from permissions");
DB::insert("insert into permissions (id,key,\"group\",label,created_at,updated_at) values (?,?,?,?,now(),now())",[$pid,'view_products','catalog','View']);

function setting($id,$tenant,$scope,$auth,$allow,$locked,$role=null,$tt=null,$ti=null,$uid=null){
  DB::insert("insert into permission_settings (id,tenant_id,permission_id,scope,role,target_type,target_id,user_id,allow,locked,authority,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,now(),now())",
    [$id,$tenant,$GLOBALS['pid'],$scope,$role,$tt,$ti,$uid,$allow,$locked,$auth]);
}

// 1) tenant B grants itself allow=true at tenant scope. Tenant A must NOT see it.
setting('01890000-0000-7000-8000-0000000000c1',$tB,'tenant','tenant',true,false);
$a = Resolver::resolve($tA,'view_products');
$b = Resolver::resolve($tB,'view_products');
L("CROSS-TENANT: A resolve=".json_encode($a)." (expect allow=false/deny)");
L("CROSS-TENANT: B resolve=".json_encode($b)." (expect allow=true)");

// 2) non-global row with tenant_id NULL must be ignored (no cross-tenant grant via null)
Cache::flush();
setting('01890000-0000-7000-8000-0000000000c2',null,'tenant','tenant',true,false); // illegal: tenant scope, null tenant
$a2 = Resolver::resolve($tA,'view_products');
L("NULL-TENANT non-global row: A resolve=".json_encode($a2)." (expect allow=false — illegal row ignored)");

// 3) GLOBAL row with a STRAY non-null tenant_id = B, allow=true locked=true. Does it leak to A?
Cache::flush();
DB::statement("delete from permission_settings");
setting('01890000-0000-7000-8000-0000000000c3',$tB,'global','super',true,true); // malformed: global must be tenant NULL
$a3 = Resolver::resolve($tA,'view_products');
L("GLOBAL-STRAY-TENANT(B): A resolve=".json_encode($a3)." (if allow=true -> stray global leaks to A)");

// 4) proper global (tenant NULL) super-lock applies to everyone (expected)
Cache::flush();
DB::statement("delete from permission_settings");
setting('01890000-0000-7000-8000-0000000000c4',null,'global','super',true,true);
$a4 = Resolver::resolve($tA,'view_products'); $b4 = Resolver::resolve($tB,'view_products');
L("GLOBAL super-lock(allow): A=".json_encode($a4)." B=".json_encode($b4)." (expect both allow=true locked=true)");

// 5) super-lock DENY beats a tenant allow (locked wins from top)
Cache::flush();
DB::statement("delete from permission_settings");
setting('01890000-0000-7000-8000-0000000000c5',null,'global','super',false,true); // global super lock=deny
setting('01890000-0000-7000-8000-0000000000c6',$tA,'tenant','tenant',true,false); // tenant tries allow
$a5 = Resolver::resolve($tA,'view_products');
L("SUPER-LOCK-DENY vs tenant-allow: A=".json_encode($a5)." (expect allow=false locked=true source super:global)");
Cache::flush();
L("done");
