<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class RefreshConfig extends Command {

    protected $signature = 'config:refresh';
    protected $description = 'Refresh config and cache associated with settings .';

    protected function clearCaches () {

        cache()->tags(['forevercache', 'database'])->flush();

        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
    
        $this->line('🚀 Cache Cleared Successfully .');

    }
    protected function cacheEverything () {

        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        $this->line('🚀 ( Config, Route, View ) Cached Successfully .');

    }
    protected function migrateForce () {

        Artisan::call('migrate', ['--force' => true]);

        $this->line('🚀 Migrations Pushed Successfully .');

    }
    public function handle () {

        $this->clearCaches();

        $this->migrateForce();

        $this->cacheEverything();

        $this->info('✅ All Config Refreshed Successfully .');
    
    }

}
