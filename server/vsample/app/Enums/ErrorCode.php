<?php

namespace App\Enums;

enum ErrorCode: int {

    case SERVER       = 500;
    case VALIDATION   = 422;
    case NOT_FOUND    = 404;
    case FORBIDDEN    = 403;
    case UNAUTHORIZED = 401;
    case METHOD_NOT_ALLOWED = 405;
    
}
