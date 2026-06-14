<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::middleware(tenantMiddleware())->prefix('v1/admin')->name('admin.')->namespace('\App\Http\Controllers')->group(function() {

    Route::prefix('auth')->controller(AuthController::class)->group(function(){
        Route::post('login', 'adminLogin')->name('login');
    });
    Route::middleware(authMiddleware('admin'))->group(function(){

        require base_path('routes/apis/shared.php');

        Route::prefix('wallets')->name('wallets.')->middleware("has:view_wallets")->controller(WalletController::class)->group(function(){
            Route::prefix('{user}')->whereNumber('user')->group(function(){
                Route::get('', 'balance')->name('balance');

                Route::middleware("has:edit_wallets")->controller(WalletController::class)->group(function(){
                    Route::post('increment', 'increment')->name('increment');
                    Route::post('decrement', 'decrement')->name('decrement');
                    Route::post('suspend', 'suspend')->name('suspend');
                    Route::post('release', 'release')->name('release');
                    Route::post('freeze', 'freeze')->name('freeze');
                    Route::post('unfreeze', 'unfreeze')->name('unfreeze');
                    Route::post('reset', 'reset')->name('reset');
                    Route::post('deposit', 'deposit')->name('deposit');
                    Route::post('withdraw', 'withdraw')->name('withdraw');
                });
            });
        });
        Route::prefix('coupons')->name('coupons.')->middleware("has:view_coupons")->controller(CouponController::class)->group(function(){
            Route::prefix('{coupon}')->whereNumber('coupon')->group(function(){
                Route::get('validate', 'validate')->name('validate');
            });
        });
        Route::prefix('entities')->name('entities.')->middleware("has:view_entities")->controller(EntityController::class)->group(function(){
            Route::prefix('{entity}')->whereNumber('entity')->group(function(){
                Route::prefix('permissions')->middleware('has:view_permissions')->group(function(){
                    Route::post('assign/{permission?}', 'assignPermission')->middleware('has:edit_permissions')->name('assign');
                });
            });
        });
        Route::middleware("has:view_providers")->controller(ProviderController::class)->group(function(){
            Route::prefix('suppliers')->name('suppliers.')->group(function(){
                Route::post('link', 'apiLink')->name('apiLink');
                Route::get('{id?}', 'suppliers')->whereNumber('id')->name('supplier');

                Route::prefix('{supplier}')->whereNumber('supplier')->group(function(){
                    Route::post('link', 'link')->name('link');
                });
            });
            Route::prefix('providers')->name('providers.')->group(function(){
                Route::prefix('{provider}')->whereNumber('provider')->group(function(){
                    Route::get('account', 'account')->name('account');
                    Route::get('fetch/{entity?}/{id?}', 'fetch')->name('fetch');
                    Route::get('fetch-linked/{entity?}/{id?}', 'fetchLinked')->name('fetch_linked');
                    Route::post('import/{entity?}/{id?}', 'import')->name('import');
                    Route::post('sync/{entity?}/{id?}', 'sync')->name('sync');
                    Route::post('detach/{entity?}/{id?}', 'detach')->name('detach');
                    Route::post('remove/{entity?}/{id?}', 'remove')->name('remove');
                    Route::post('unlink', 'unlink')->name('unlink');
                });
            });
        });
        collect(glob(app_path('Http/Controllers/*.php')))->map(fn( $file ) => pathinfo($file, PATHINFO_FILENAME))->each(function ( $controller ) {
            
            $class = "\App\Http\Controllers\\{$controller}";
            if ( $controller === 'Controller' || !getClassProperty($class, 'global_route', true) ) return;

            $route = getClassProperty($class, 'route_name', Str::plural(Str::snake(str_replace('Controller', '', $controller))));

            Route::prefix($route)->name("$route.")->controller($controller)->group(function() use ( $route, $controller ) {

                Route::middleware("has:view_$route")->group(function() use ( $route ) {
                    Route::get('', 'index')->name('index');
                    Route::post('', 'store')->name('store')->middleware("has:add_$route");
                    Route::delete('', 'deleteMultiple')->name('delete.all')->middleware("has:delete_$route");

                    Route::get('statistics', 'statistics')->name('statistics')->middleware('has:allow_statistics');
                    Route::post('download', 'download')->name('download')->middleware('has:allow_downloads');
                });
                Route::prefix('{id}')->whereNumber('id')->group(function() use ( $route, $controller ) {

                    Route::middleware("has:view_$route")->group(function() use ( $route ) {
                        Route::get('', 'show')->name('show');
                        Route::delete('', 'delete')->name('delete')->middleware("has:delete_$route");
                        
                        Route::middleware("has:edit_$route")->group(function() {
                            Route::put('{column?}', 'update')->name('update');
                            Route::post('image', 'updateImage')->name('image');
                            Route::post('files', 'uploadFiles')->name('files');
                            Route::delete('image', 'deleteImage')->name('image.delete');
                            Route::delete('files', 'deleteFiles')->name('files.delete');

                            Route::middleware("has:view_permissions")->prefix('permissions')->name('permissions.')->group(function(){
                                Route::get('', 'allPermissions')->name('index');
                                Route::post('allow/{permission?}', 'allowPermission')->middleware('has:edit_permissions')->name('allow');
                                Route::post('deny/{permission?}', 'denyPermission')->middleware('has:edit_permissions')->name('deny');
                            });
                        });
                    });
                    Route::prefix('{related}')->name('related.')->middleware("has:view_{related}")->group(function() use ( $controller ) {
                        Route::get('', fn($id, $related) =>
                            app("\App\Http\Controllers\\{$controller}")->{'related' . ucfirst(Str::camel($related))}($id)
                        )->name('index');
                        Route::get('{related_id}', fn($id, $related, $relatedId) =>
                            app("\App\Http\Controllers\\{$controller}")->{'showRelated' . ucfirst(Str::camel($related))}($id, $relatedId)
                        )->whereNumber('related_id')->name('show');
                        Route::middleware('has:allow_statistics')->get('statistics', fn($id, $related) =>
                            app("\App\Http\Controllers\\{$controller}")->{'statisticsRelated' . ucfirst(Str::camel($related))}($id)
                        )->name('statistics');
                        Route::middleware('has:allow_downloads')->post('download', fn($id, $related) =>
                            app("\App\Http\Controllers\\{$controller}")->{'downloadRelated' . ucfirst(Str::camel($related))}($id)
                        )->name('download');
                    });

                });

            });

        });

    });

});
