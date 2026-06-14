<?php

namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StoreMail extends Mailable implements ShouldQueue {

    use Queueable, SerializesModels;
    protected $siteInfo, $frontUrl, $adminUrl;

    public function __construct ( protected $user, protected $store ) {

        $this->siteInfo = optional((object)site_info()?->toResource()?->toArray(request()));
        $this->frontUrl = 'https://' . $this->store->domains?->firstWhere('dest', 'client')?->name;
        $this->adminUrl = 'https://' . $this->store->domains?->firstWhere('dest', 'admin')?->name;

    }
    public function envelope () {

        return new Envelope(
            subject: 'Store Created',
            tags: ['store', 'created'],
            metadata: [
                'user_id' => $this->user?->id,
                'email'   => $this->user?->email,
            ],
        );

    }
    public function content () {

        return new Content(view: 'mails.store', with: [
            'name'      => $this->siteInfo?->name,
            'logo'      => $this->siteInfo?->logo,
            'socials'   => $this->siteInfo?->socials,
            'userName'  => $this->user?->name,
            'frontUrl'  => $this->frontUrl,
            'adminUrl'  => $this->adminUrl,
        ]);

    }

}
