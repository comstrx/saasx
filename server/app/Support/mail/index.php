<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Mail\Mailer;
use App\Support\Mail\Message;
use App\Support\Mail\Address;

class Mail {

    public static function to ( string|Address ...$to ): Message {

        return (new Message())->to(array_map(Address::cast(...), $to));

    }
    public static function send ( Message $message ): void {

        (new Mailer())->send($message);

    }

}
