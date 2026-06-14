<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;

class SyncGateways extends Command {

    protected $signature   = 'gateway:sync {--store= : Store id (e.g. 1, 2}';
    protected $description = 'Sync gateways from config to database';

    protected function sync () {

        $storeId = integer($this->option('store'));
        return app(\App\Services\SeedingService::class)->gateways(\App\Models\Store::findOrFail($storeId));

    }
    public function handle () {

        $this->sync();
        $this->info("✅ gateways synced successfully .");
        return Command::SUCCESS;

    }

}
