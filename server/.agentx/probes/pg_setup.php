<?php
declare(strict_types=1);
$app = require __DIR__ . '/boot.php';
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

$probeDb = 'saasx_probe';

// 1) create the probe database via the maintenance 'postgres' db (drop if exists — it is ours)
$base = config('database.connections.pgsql');
$maint = array_merge($base, ['database' => 'postgres']);
config(['database.connections._maint' => $maint]);
DB::purge('_maint');
DB::connection('_maint')->getPdo()->exec("DROP DATABASE IF EXISTS {$probeDb} WITH (FORCE)");
DB::connection('_maint')->getPdo()->exec("CREATE DATABASE {$probeDb}");
echo "created db {$probeDb}\n";

// 2) point the pgsql connection at the probe db and migrate fresh
config(['database.connections.pgsql.database' => $probeDb]);
DB::purge('pgsql');
DB::setDefaultConnection('pgsql');
Artisan::call('migrate', ['--force' => true, '--no-interaction' => true]);
echo Artisan::output();
$tables = DB::connection('pgsql')->select("select tablename from pg_tables where schemaname='public' order by 1");
echo "tables: ".implode(',', array_map(fn($t)=>$t->tablename, $tables))."\n";
