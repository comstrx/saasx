<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function(){

    Route::prefix('oauth2/token')->name('token.')->namespace('\App\Http\Controllers')->group(function(){

        Route::controller(ApiTokenController::class)->group(function() {
            Route::post('', 'newAccessToken')->name('new_access_token');
        });

    });
    Route::prefix('webhook')->name('webhook.')->group(function(){

        Route::prefix('payment')->name('payment.')->namespace('\App\Payments')->group(function(){

            Route::prefix('paypal')->name('paypal.')->controller(PaypalPayment::class)->group(function(){
                Route::post('deposit', 'depositWebhook')->name('deposit');
                Route::post('withdraw', 'withdrawWebhook')->name('withdraw');
                Route::post('refund', 'refundWebhook')->name('refund');
            });
            Route::prefix('stripe')->name('stripe.')->controller(StripePayment::class)->group(function(){
                Route::post('deposit', 'depositWebhook')->name('deposit');
                Route::post('withdraw', 'withdrawWebhook')->name('withdraw');
                Route::post('refund', 'refundWebhook')->name('refund');
            });
            Route::prefix('paytabs')->name('paytabs.')->controller(PaytabsPayment::class)->group(function(){
                Route::post('deposit', 'depositWebhook')->name('deposit');
                Route::post('withdraw', 'withdrawWebhook')->name('withdraw');
                Route::post('refund', 'refundWebhook')->name('refund');
            });

        });

    });

});
