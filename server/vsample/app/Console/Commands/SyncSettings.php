<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;

class SyncSettings extends Command {

    protected $signature   = 'setting:sync {--store= : Store id (e.g. 1, 2}';
    protected $description = 'Sync settings from config to database';

    protected function sync () {

        $storeId = integer($this->option('store'));
        return app(\App\Services\SeedingService::class)->settings(\App\Models\Store::findOrFail($storeId));

    }
    public function handle () {
        
        $this->sync();
        $this->info("✅ settings synced successfully .");
        return Command::SUCCESS;

    }

}
