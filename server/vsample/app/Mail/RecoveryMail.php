<?php

namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RecoveryMail extends Mailable implements ShouldQueue  {

    use Queueable, SerializesModels;
    protected $store, $siteInfo, $frontUrl;

    public function __construct ( protected $user, protected string $token ) {

        $this->store    = store();
        $this->siteInfo = optional((object)site_info()?->toResource()?->toArray(request()));
        $this->frontUrl = 'https://' . $this->store?->domains?->firstWhere('dest', 'client')?->name;

    }
    public function envelope () {

        return new Envelope(
            subject: 'Password Recovery',
            tags: ['recovery', 'password'],
            metadata: [
                'user_id' => $this->user?->id,
                'email'   => $this->user?->email,
            ],
        );

    }
    public function content () {

        return new Content(view: 'mails.recovery', with: [
            'name'      => $this->siteInfo?->name,
            'logo'      => $this->siteInfo?->logo,
            'socials'   => $this->siteInfo?->socials,
            'userName'  => $this->user?->name,
            'actionUrl' => $this->frontUrl . '/reset-password/' . $this->token,
        ]);

    }

}
