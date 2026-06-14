<?php

namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;
use App\Models\SiteInfo;

class NotificationMail extends Mailable implements ShouldQueue {

    use Queueable, SerializesModels;

    protected $user;
    protected $data;

    public function __construct ( $user, $data ) {

        $this->user = $user;
        $this->data = $data;

    }
    public function content () {

        $data = ['user' => $this->user, 'data' => $this->data];
        return new Content(view: 'mails.notification', with: $data);

    }

}
