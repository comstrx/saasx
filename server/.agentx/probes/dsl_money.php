<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
use App\Support\Context;
use App\Support\Num\Money;
use App\Models\User;
config(['database.connections.pgsql.database' => 'saasx_probe']);
DB::purge('pgsql'); DB::setDefaultConnection('pgsql');
function L($s){ echo $s."\n"; }
Context::set('admin','admin','01890000-0000-7000-8000-00000000000a','u');

// ============ FILTER DSL injection / fail-closed ============
$adversarial = [
  'email) OR 1=1 --' => 'x',                 // injection in column name
  'id; DROP TABLE users;--' => 'x',          // injection in column
  'email@like' => "%' OR '1'='1",            // value injection via like
  'id@union select password from users' => 'x', // injection in operator
  'name@=' => "robert'); DROP TABLE users;--",   // classic bobby tables as value
];
$q = User::query()->search(null, $adversarial, ['(select password from users)','email'], 'email); DROP TABLE users;--');
$sql = $q->toSql();
$bindings = $q->getBindings();
L("FILTER generated SQL:\n  ".$sql);
L("FILTER bindings: ".json_encode($bindings));
$dangerous = preg_match('/DROP|UNION|OR 1=1|--/i', $sql);
L("FILTER raw SQL contains injected DDL/keywords? ".($dangerous?'YES — INJECTION':'no — parameterized/allow-listed'));
// execute to prove it runs without error and table survives
$cnt = $q->count();
$tableAlive = DB::selectOne("select count(*) c from information_schema.tables where table_name='users'")->c;
L("FILTER executes ok (count=$cnt), users table still exists=".$tableAlive." (expect 1)");
// unknown column dropped: a filter on a real vs fake column
$q2 = User::query()->search(null, ['nonexistent_col@>' => 5], [], 'newest');
L("FILTER unknown column => where clause count: ".(substr_count($q2->toSql(),'"nonexistent_col"'))." (expect 0, dropped)");
Context::forget();

// ============ MONEY integer-only invariants ============
L("--- MONEY ---");
L("add(10,20)=".Money::add(10,20)." multiply(199,3)=".Money::multiply(199,3));
foreach (['10.99','0.1','-5.5','1.005','abc','','1e3','9999999999.99','  42 ','+3.14'] as $d) {
  $m = Money::fromDecimal($d,2);
  L("fromDecimal('".$d."') = ".var_export($m,true)." (".gettype($m).")  toDecimal=".Money::toDecimal($m,2));
}
// allocation conservation (no money created/lost)
foreach ([[100,[1,1,1]],[101,[1,1,1]],[1,[1,1,1]],[7,[2,3,5]],[-10,[1,1,1]],[0,[1,1]]] as [$amt,$ratios]) {
  $parts = Money::allocate($amt,$ratios);
  $sum = array_sum($parts);
  L("allocate($amt,".json_encode($ratios).") = ".json_encode($parts)." sum=$sum conserved=".($sum===$amt?'YES':'NO-LEAK'));
}
// type guarantee: every result integer, no float anywhere
$allInt = true;
foreach (['10.99','0.1','1.005'] as $d){ if(!is_int(Money::fromDecimal($d))) $allInt=false; }
foreach (Money::allocate(100,[1,2,3]) as $p){ if(!is_int($p)) $allInt=false; }
L("MONEY all results strictly int (no float): ".($allInt?'YES':'NO'));
L("done");
