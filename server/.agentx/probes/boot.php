<?php
declare(strict_types=1);
// Probe bootstrap: boots the real Laravel app (default .env => Postgres+Redis).
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
return $app;
