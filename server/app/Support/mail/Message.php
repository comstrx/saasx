<?php

declare(strict_types=1);

namespace App\Support\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class Message extends Mailable implements ShouldQueue {

    use Queueable, SerializesModels;

}
