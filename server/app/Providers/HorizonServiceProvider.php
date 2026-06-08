<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider {

    public function boot () {

        parent::boot();

        // Horizon::routeMailNotificationsTo(env('HORIZON_NOTIFICATION_EMAIL'));
        // Horizon::routeSlackNotificationsTo(env('HORIZON_SLACK_WEBHOOK_URL'), env('HORIZON_SLACK_CHANNEL'));

    }
    protected function gate () {

        Gate::define('viewHorizon', function ($user) {

            return true;

        });

    }

}
