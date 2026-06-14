<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{user_id}', function ( $user, $userId ) {
    $access = $user->has('allow_chats') && ( $user->hasRole('admin') || (int) $user->id === (int) $userId );
    return $access ? $user->toResource() : null;
});
Broadcast::channel('mail.{user_id}', function ( $user, $user_id ) {
    if ( !$user->allow_mails ) return false;
    return $user->id == $user_id;
});
Broadcast::channel('transaction.{user_id}', function ( $user, $user_id ) {
    return $user->id == $user_id;
});
Broadcast::channel('notification.{user_id}', function ( $user, $user_id ) {
    return $user->id == $user_id;
});
Broadcast::channel('wallet.{user_id}', function ( $user, $user_id ) {
    return $user->id == $user_id;
});
Broadcast::channel('user.{user_id}', function ( $user, $user_id ) {
    return $user->id == $user_id;
});
