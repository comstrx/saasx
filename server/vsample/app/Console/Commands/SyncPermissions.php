<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SyncPermissions extends Command {

    protected $signature = 'permission:sync 
                            {--name=  : Entity name (e.g. admin, user)} 
                            {--path=  : Path to config (default: settings.permissions)}
                            {--store= : Store id (e.g. 1, 2} 
                            {--force  : Force reset special permissions} 
                            {--all    : Sync all entities from config}}';

    protected $description = 'Sync permissions from config to database with optional force or specific entity';

    protected function model ( string $name = null ) {

        if ( !$name && !$this->option('all') ) $name = $this->ask('Enter the entity name OR sync-all (Y/N Enter) : ');
        return "App\\Models\\" . Str::studly($name ?? 'Entity');

    }
    protected function sync () {

        $name  = string($this->option('name'));
        $store = integer($this->option('store'));
        $force = bool($this->option('force'));
        $all   = bool($this->option('all'));
        $path  = string($this->option('path') ?? 'settings.permissions');

        $modelClass = $this->model($name);
        if ( !class_exists($modelClass) ) return $this->error("Model [$modelClass] not found .");

        return $modelClass::syncPermissions($path, $name, ['store_id' => $store], $all, $force);

    }
    public function handle () {

        $this->sync();
        $this->info("✅ Permissions synced successfully .");
        return Command::SUCCESS;

    }

}
