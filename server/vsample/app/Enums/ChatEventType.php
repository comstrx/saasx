<?php

namespace App\Enums;

enum ChatEventType: string {

    case ROOM_CREATED             = 'ROOM.CREATED';
    case ROOM_DELETED             = 'ROOM.DELETED';
    case ROOM_ARCHIVED            = 'ROOM.ARCHIVED';
    case ROOM_TYPING              = 'ROOM.TYPING';
    case MESSAGE_CREATED          = 'MESSAGE.CREATED';
    case MESSAGE_DELETED          = 'MESSAGE.DELETED';
    case MESSAGE_READ             = 'MESSAGE.READ';
    case MESSAGE_DELIVERED        = "MESSAGE.DELIVERED";
    case MESSAGE_STARRED          = 'MESSAGE.STARRED';
    case MESSAGE_REACTION         = 'MESSAGE.REACTION';
    case MESSAGE_STARRED_DELETED  = 'MESSAGE.STARRED.DELETED';
    case MESSAGE_REACTION_DELETED = 'MESSAGE.REACTION.DELETED';

}
