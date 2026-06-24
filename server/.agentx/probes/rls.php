<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;

config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
$pdo = DB::connection('pgsql')->getPdo();

function line($s){ echo $s."\n"; }

// --- 0) confirm RLS forced + policy present
$rls = DB::select("select relname, relrowsecurity, relforcerowsecurity from pg_class where relname in ('users','roles','permission_settings','user_roles') order by 1");
foreach($rls as $r){ line("rls {$r->relname}: enabled=".var_export($r->relrowsecurity,true)." forced=".var_export($r->relforcerowsecurity,true)); }

$tA='01890000-0000-7000-8000-00000000000a';
$tB='01890000-0000-7000-8000-00000000000b';

// --- 1) seed as owner (postgres bypasses RLS): one user per tenant + one platform (NULL) user
DB::statement("delete from users");
DB::insert("insert into users (id, tenant_id, name, email, password, created_at, updated_at) values (?,?,?,?,?,now(),now())", ['01890000-0000-7000-8000-0000000000a1',$tA,'A','a@x.com','x']);
DB::insert("insert into users (id, tenant_id, name, email, password, created_at, updated_at) values (?,?,?,?,?,now(),now())", ['01890000-0000-7000-8000-0000000000b1',$tB,'B','b@x.com','x']);
DB::insert("insert into users (id, tenant_id, name, email, password, created_at, updated_at) values (?,?,?,?,?,now(),now())", ['01890000-0000-7000-8000-0000000000c1',null,'super','s@x.com','x']);
line("seeded: ".DB::selectOne("select count(*) c from users")->c." users (as owner, RLS bypassed)");

// --- 2) create a NON-OWNER, NOBYPASSRLS role and grant DML (this is what prod must connect as)
if ( DB::selectOne("select 1 e from pg_roles where rolname='saasx_probe_app'") ) {
    DB::statement("DROP OWNED BY saasx_probe_app CASCADE");
    DB::statement("DROP ROLE saasx_probe_app");
}
DB::statement("CREATE ROLE saasx_probe_app LOGIN PASSWORD 'probe' NOSUPERUSER NOBYPASSRLS");
DB::statement("GRANT USAGE ON SCHEMA public TO saasx_probe_app");
DB::statement("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO saasx_probe_app");

// --- 3) connect AS the non-owner role
$base = config('database.connections.pgsql');
config(['database.connections._app' => array_merge($base, ['username'=>'saasx_probe_app','password'=>'probe'])]);
DB::purge('_app');
$as = DB::connection('_app');
$who = $as->selectOne("select current_user u, (select rolbypassrls from pg_roles where rolname=current_user) b");
line("connected as {$who->u} bypassrls=".var_export($who->b,true));

// helper: run inside a transaction with GUC set transaction-local, return visible count
function visibleUnder($conn, ?string $tenant): array {
    return $conn->transaction(function() use ($conn, $tenant) {
        $conn->statement("select set_config('app.tenant_id', ?, true)", [(string)$tenant]);
        return $conn->select("select tenant_id, count(*) c from users group by tenant_id order by 1");
    });
}

// --- 4) tenant A GUC: must see ONLY tenant A rows + NULL-tenant rows (policy allows NULL)
try {
  $rowsA = visibleUnder($as, $tA);
  line("GUC=A visible groups: ".json_encode(array_map(fn($r)=>[$r->tenant_id,(int)$r->c],$rowsA)));
} catch (\Throwable $e) { line("GUC=A ERROR: ".$e->getMessage()); }

// --- 5) tenant B GUC
try {
  $rowsB = visibleUnder($as, $tB);
  line("GUC=B visible groups: ".json_encode(array_map(fn($r)=>[$r->tenant_id,(int)$r->c],$rowsB)));
} catch (\Throwable $e) { line("GUC=B ERROR: ".$e->getMessage()); }

// --- 6) the Rls::apply empty-tenant case: set_config('', true) then query  ->  ''::uuid
try {
  $rowsE = visibleUnder($as, null); // (string) null = ''
  line("GUC='' visible groups: ".json_encode(array_map(fn($r)=>[$r->tenant_id,(int)$r->c],$rowsE)));
} catch (\Throwable $e) { line("GUC='' ERROR: ".$e->getMessage()); }

// --- 7) no GUC at all (unset): current_setting(...,true) => NULL  -> only NULL-tenant rows
try {
  $rowsN = $as->select("select tenant_id, count(*) c from users group by tenant_id order by 1");
  line("no-GUC visible groups: ".json_encode(array_map(fn($r)=>[$r->tenant_id,(int)$r->c],$rowsN)));
} catch (\Throwable $e) { line("no-GUC ERROR: ".$e->getMessage()); }

// --- 8) cross-tenant WRITE attempt as tenant A: insert a row stamped tenant B
try {
  $as->transaction(function() use ($as,$tA,$tB){
    $as->statement("select set_config('app.tenant_id', ?, true)", [$tA]);
    $as->insert("insert into users (id, tenant_id, name, email, password, created_at, updated_at) values (?,?,?,?,?,now(),now())", ['01890000-0000-7000-8000-0000000000ff',$tB,'evil','evil@x.com','x']);
  });
  line("cross-tenant INSERT as A stamped B: SUCCEEDED (leak!)");
} catch (\Throwable $e) { line("cross-tenant INSERT as A stamped B: BLOCKED (".substr($e->getMessage(),0,60)."...)"); }

// cleanup role
DB::statement("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM saasx_probe_app");
DB::statement("REVOKE USAGE ON SCHEMA public FROM saasx_probe_app");
DB::statement("DROP ROLE IF EXISTS saasx_probe_app");
line("done");
