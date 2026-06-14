<?php

namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable implements ShouldQueue {

    use Queueable, SerializesModels;
    protected $store, $siteInfo, $frontUrl;

    public function __construct ( protected $user, protected string $code ) {

        $this->store    = store();
        $this->siteInfo = optional((object)site_info()?->toResource()?->toArray(request()));
        $this->frontUrl = 'https://' . $this->store?->domains?->firstWhere('dest', 'client')?->name;

    }
    public function envelope () {

        return new Envelope(
            subject: 'Otp Verification',
            tags: ['verify', 'otp'],
            metadata: [
                'user_id' => $this->user?->id,
                'email'   => $this->user?->email,
            ],
        );

    }
    public function content () {

        return new Content(view: 'mails.otp', with: [
            'name'      => $this->siteInfo?->name,
            'logo'      => $this->siteInfo?->logo,
            'socials'   => $this->siteInfo?->socials,
            'userName'  => $this->user?->name,
            'code'      => $this->code,
            'actionUrl' => $this->frontUrl,
            'expiresIn' => 5,
        ]);

    }

}
