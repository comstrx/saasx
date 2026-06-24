<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');

// recreate the non-owner role
if ( DB::selectOne("select 1 e from pg_roles where rolname='saasx_probe_app'") ) { DB::statement("DROP OWNED BY saasx_probe_app CASCADE"); DB::statement("DROP ROLE saasx_probe_app"); }
DB::statement("CREATE ROLE saasx_probe_app LOGIN PASSWORD 'probe' NOSUPERUSER NOBYPASSRLS");
DB::statement("GRANT USAGE ON SCHEMA public TO saasx_probe_app");
DB::statement("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO saasx_probe_app");
$base = config('database.connections.pgsql');
function fresh($base,$name){ config(["database.connections.$name" => array_merge($base, ['username'=>'saasx_probe_app','password'=>'probe'])]); \Illuminate\Support\Facades\DB::purge($name); return \Illuminate\Support\Facades\DB::connection($name); }
function L($s){ echo $s."\n"; }

// (A) GENUINE unset GUC on a brand-new connection (no set_config ever): intended fail-closed path
$c1 = fresh($base,'_g1');
try { $r = $c1->select("select count(*) c from users"); L("(A) never-set GUC: count=".$r[0]->c."  => graceful (NULL::uuid), NO error"); }
catch (\Throwable $e){ L("(A) never-set GUC: ERROR ".substr($e->getMessage(),0,70)); }

// (B) exactly what App\Support\Database\Rls::apply(null) emits: set_config('app.tenant_id','',true)
$c2 = fresh($base,'_g2');
try {
  $c2->transaction(function() use ($c2){
    $c2->statement("select set_config('app.tenant_id', ?, true)", [(string) null]); // (string)null === ''
    $n = $c2->select("select count(*) c from users");
    L("(B) Rls::apply(null) '' GUC: count=".$n[0]->c);
  });
} catch (\Throwable $e){ L("(B) Rls::apply(null) '' GUC: ERROR ".substr($e->getMessage(),0,70)); }

// (C) does a local '' set in a COMMITTED tx bleed to the next statement on the SAME pooled connection? (Octane reuse)
$c3 = fresh($base,'_g3');
try {
  $c3->transaction(function() use ($c3){ $c3->statement("select set_config('app.tenant_id', '', true)"); }); // commits
  $r = $c3->select("select count(*) c from users"); // next statement, no tx
  L("(C) post-commit reuse after local '': count=".$r[0]->c."  => no bleed");
} catch (\Throwable $e){ L("(C) post-commit reuse after local '': ERROR ".substr($e->getMessage(),0,70)."  => '' BLED into next stmt"); }

// (D) does a SESSION-level set bleed (the forbidden pattern, for contrast)?
$c4 = fresh($base,'_g4');
try {
  $c4->statement("select set_config('app.tenant_id', '01890000-0000-7000-8000-00000000000a', false)"); // session-level
  $r = $c4->select("select tenant_id, count(*) c from users group by 1 order by 1");
  L("(D) session-level set, next stmt sees: ".json_encode(array_map(fn($x)=>[$x->tenant_id,(int)$x->c],$r))."  (session GUC persists across statements = Octane bleed risk if used)");
} catch (\Throwable $e){ L("(D) session-level: ERROR ".substr($e->getMessage(),0,70)); }

DB::statement("DROP OWNED BY saasx_probe_app CASCADE"); DB::statement("DROP ROLE saasx_probe_app");
L("done");
