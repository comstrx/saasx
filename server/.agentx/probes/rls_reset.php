<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
if ( DB::selectOne("select 1 e from pg_roles where rolname='saasx_probe_app'") ) { DB::statement("DROP OWNED BY saasx_probe_app CASCADE"); DB::statement("DROP ROLE saasx_probe_app"); }
DB::statement("CREATE ROLE saasx_probe_app LOGIN PASSWORD 'probe' NOSUPERUSER NOBYPASSRLS");
DB::statement("GRANT USAGE ON SCHEMA public TO saasx_probe_app");
DB::statement("GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO saasx_probe_app");
$base = config('database.connections.pgsql');
config(["database.connections._r" => array_merge($base, ['username'=>'saasx_probe_app','password'=>'probe'])]); DB::purge('_r');
$c = DB::connection('_r');
function cs($c){ $v=$c->selectOne("select current_setting('app.tenant_id', true) v"); return var_export($v->v,true); }
function L($s){ echo $s."\n"; }

$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';

L("initial current_setting (never touched): ".cs($c));
// simulate request 1 for tenant A: transaction-local set, commit (like a per-request tx)
$c->transaction(fn()=> $c->statement("select set_config('app.tenant_id', ?, true)", [$tA]));
L("after req1 (local set A, committed) -> next-stmt current_setting: ".cs($c));
// simulate request 2 for tenant B
$c->transaction(fn()=> $c->statement("select set_config('app.tenant_id', ?, true)", [$tB]));
L("after req2 (local set B, committed) -> next-stmt current_setting: ".cs($c));
// simulate request 3 = guest/no-tenant: Rls::apply(null) => '' local set, commit
$c->transaction(fn()=> $c->statement("select set_config('app.tenant_id', ?, true)", [(string)null]));
L("after req3 (local set '', committed) -> next-stmt current_setting: ".cs($c));
// CRITICAL: now a bare query with whatever reset value lingers — which tenant's rows?
DB::statement("delete from users");
DB::insert("insert into users (id,tenant_id,name,email,password,created_at,updated_at) values (?,?,?,?,?,now(),now())",['01890000-0000-7000-8000-0000000000a1',$tA,'A','a@x.com','x']);
DB::insert("insert into users (id,tenant_id,name,email,password,created_at,updated_at) values (?,?,?,?,?,now(),now())",['01890000-0000-7000-8000-0000000000b1',$tB,'B','b@x.com','x']);
try { $r=$c->select("select tenant_id,count(*) c from users group by 1 order by 1"); L("bare query after req3 sees: ".json_encode(array_map(fn($x)=>[$x->tenant_id,(int)$x->c],$r))); }
catch(\Throwable $e){ L("bare query after req3: ERROR ".substr($e->getMessage(),0,60)); }
DB::statement("DROP OWNED BY saasx_probe_app CASCADE"); DB::statement("DROP ROLE saasx_probe_app");
L("done");
