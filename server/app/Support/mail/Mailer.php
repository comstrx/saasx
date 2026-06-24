<?php

declare(strict_types=1);

namespace App\Support\Mail;

class Mailer {

    public function send ( Message $message ): void {

        \Illuminate\Support\Facades\Mail::send($message->mailer('mailgun'));

    }

}
