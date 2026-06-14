<?php

use Illuminate\Support\Facades\Route;

Route::namespace('\App\Http\Controllers')->group(function(){
    
    Route::prefix('account')->name('account.')->controller(AccountController::class)->group(function(){
        Route::get('', 'index')->name('index');
        Route::put('', 'updateAdmin')->name('update');
        Route::get('me', 'info')->name('me');
        Route::post('unlock', 'unlock')->name('unlock');
        Route::post('logout', 'logout')->name('logout');
        Route::post('logout-all', 'logoutAll')->name('logout.all');
        Route::post('logout-others', 'logoutOthers')->name('logout.others');
        Route::post('image', 'changeImage')->name('image.update');
        Route::delete('image', 'resetImage')->name('image.delete');
        Route::post('attach-social', 'attachSocial')->name('attach.social');
        Route::post('unattach-social/{provider?}', 'unattachSocial')->name('unattach.social');
        Route::get('{field}', 'getField')->name('field');
        Route::put('{field}', 'updateField')->name('field.update');
    });
    Route::prefix('tokens')->name('tokens.')->controller(AccessTokenController::class)->group(function(){
        Route::get('', 'index')->name('index');
        Route::delete('', 'deleteBatch')->name('delete.batch');
        Route::delete('current', 'deleteCurrent')->name('delete.current');
        Route::delete('others', 'deleteOthers')->name('delete.others');

        Route::prefix('{token}')->whereNumber('token')->group(function(){
            Route::get('', 'show')->name('show');
            Route::delete('', 'delete')->name('delete');
        });
    });
    Route::prefix('notifications')->name('notifications.')->middleware('has:allow_notifications')->controller(NotificationController::class)->group(function(){
        Route::get('', 'index')->name('index');
        Route::delete('', 'delete')->name('delete.all');
        Route::get('stats', 'stats')->name('stats');
        Route::post('read', 'read')->name('read.all');
        Route::post('unread', 'unread')->name('unread.all');
        Route::post('pin', 'pin')->name('pin.all');
        Route::post('unpin', 'unpin')->name('unpin.all');
        Route::post('restore', 'restore')->name('restore.all');

        Route::prefix('{notification}')->whereNumber('notification')->group(function(){
            Route::get('', 'show')->name('show');
            Route::delete('', 'delete')->name('delete');
            Route::post('read', 'read')->name('read');
            Route::post('unread', 'unread')->name('unread');
            Route::post('pin', 'pin')->name('pin');
            Route::post('unpin', 'unpin')->name('unpin');
            Route::post('restore', 'restore')->name('restore');
        });
    });
    Route::prefix('chat')->name('chat.')->middleware('has:allow_chats')->controller(ChatController::class)->group(function(){

        Route::prefix('support')->name('support.')->group(function(){

            Route::prefix('messages')->name('messages.')->group(function(){

                Route::get('', 'messages')->name('index');
                Route::post('send', 'sendMessage')->name('send');
                Route::post('read', 'messagesRead')->name('read');
                Route::post('delivered', 'messagesDelivered')->name('delivered');

                Route::prefix('{message}')->whereNumber('message')->group(function(){
                    Route::get('', 'showMessage')->name('show');
                    Route::post('edit', 'sendMessage')->name('edit');
                    Route::post('reaction', 'reactionMessage')->name('reaction');
                    Route::post('unreaction', 'unreactionMessage')->name('unreaction');
                    Route::post('star', 'starMessage')->name('star');
                    Route::post('unstar', 'unstarMessage')->name('unstar');
                    Route::post('pin', 'pinMessage')->name('pin');
                    Route::post('unpin', 'unpinMessage')->name('unpin');
                    Route::delete('', 'removeMessage')->name('delete');
                });

            });

        });
        Route::prefix('rooms')->name('rooms.')->group(function () {

            Route::get('', 'rooms')->name('index');
            Route::post('new/{user}', 'newRoom')->name('new');
            
            Route::prefix('{room}')->whereNumber('room')->group(function() {

                Route::get('', 'showRoom')->name('show');
                Route::post('typing', 'typingRoom')->name('typing');
                Route::post('archive', 'archiveRoom')->name('archive');
                Route::post('unarchive', 'unarchiveRoom')->name('unarchive');
                Route::post('mute', 'muteRoom')->name('mute');
                Route::post('unmute', 'unmuteRoom')->name('unmute');
                Route::post('pin', 'pinRoom')->name('pin');
                Route::post('unpin', 'unpinRoom')->name('unpin');
                Route::post('report', 'report')->name('report');
                Route::delete('', 'removeRoom')->name('delete');
                Route::delete('destroy', 'destroyRoom')->name('destroy');
                
                Route::prefix('messages')->name('messages.')->group(function(){

                    Route::get('', 'messages')->name('index');
                    Route::post('send', 'sendMessage')->name('send');
                    Route::post('read', 'messagesRead')->name('read');
                    Route::post('delivered', 'messagesDelivered')->name('delivered');
    
                    Route::prefix('{message}')->whereNumber('message')->group(function(){
                        Route::get('', 'showMessage')->name('show');
                        Route::post('edit', 'sendMessage')->name('edit');
                        Route::post('reaction', 'reactionMessage')->name('reaction');
                        Route::post('unreaction', 'unreactionMessage')->name('unreaction');
                        Route::post('star', 'starMessage')->name('star');
                        Route::post('unstar', 'unstarMessage')->name('unstar');
                        Route::post('pin', 'pinMessage')->name('pin');
                        Route::post('unpin', 'unpinMessage')->name('unpin');
                        Route::delete('', 'removeMessage')->name('delete');
                        Route::delete('destroy', 'destroyMessage')->name('destroy');
                    });
                    
                });

            });

        });

    });

});
