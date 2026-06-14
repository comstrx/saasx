<?php

namespace App\Jobs;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;

class ExecuteJob implements ShouldQueue {

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct( protected $callback = null, protected array $arguments = [], protected $storeId = null ) {

        $this->storeId = $storeId ?? store_id() ?? throw new \Exception('No store context');

    }
    public function tags ()  {
        
        if ( is_array($this->callback) ) {

            [$class, $method] = $this->callback + [null, null];
            return ['execute-job', (is_object($class) ? get_class($class) : $class) . "@$method"];

        }
        elseif ( is_string($this->callback) ) return ['execute-job', $this->callback];
        else return ['execute-job', 'closure'];

    }
    public function handle () {

        set_real_store($this->storeId);
        
        try {

            if ( is_callable($this->callback) ) {

                call_user_func_array($this->callback, $this->arguments);

            }
            elseif ( is_array( $this->callback ) ) {

                [$class, $method] = $this->callback + [null, null];

                if ( is_object($class) && method_exists($class, $method) ) $class->$method(...$this->arguments);
                elseif ( class_exists($class) && method_exists($class, $method) ) app()->make($class)->$method(...$this->arguments);
                else throw new \Exception("Class [$class] or method [$method] not found.");

            }
            elseif ( is_string($this->callback) && str_contains($this->callback, '@') ) {

                [$class, $method] = explode('@', $this->callback) + [null, null];

                if ( class_exists($class) && method_exists($class, $method) ) app()->make($class)->$method(...$this->arguments);
                else throw new \Exception("Class [$class] or method [$method] not found.");
            }
            else {

                throw new \Exception("Invalid callback provided.");

            }

        }
        catch ( \Exception $e ) {

            logger()->error('Execute Job Failed', [
                'callback' => $this->callback,
                'arguments' => $this->arguments,
                'error' => $e->getMessage(),
            ]);

            throw $e;

        }

    }

}
