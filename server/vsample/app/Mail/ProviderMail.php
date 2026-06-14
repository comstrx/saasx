<?php

namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProviderMail extends Mailable implements ShouldQueue {

    use Queueable, SerializesModels;
    protected $siteInfo, $provider, $event, $entity, $entityId, $items, $fromMe, $title;

    public function __construct ( protected $user, protected array $data ) {

        $this->siteInfo = optional((object) site_info($user->store_id)?->toResource()?->toArray(request()));
        $this->provider = optional(data_get($data, 'provider'));
        $this->event    = string(data_get($data, 'event'));
        $this->entity   = string(data_get($data, 'entity'));
        $this->entityId = integer(data_get($data, 'id'));
        $this->items    = integer(data_get($data, 'items') );
        $this->fromMe   = bool(data_get($data, 'fromMe'));
        $this->title    = ucfirst($this->entity ?? 'data') . ' - ' . ucfirst($this->event ?? '');

    }
    public function envelope () {

        return new Envelope(
            subject: $this->title,
            tags: ['provider', 'data', $this->event],
            metadata: [ 'user_id' => $this->user->id, 'email' => $this->user->email ]
        );

    }
    public function content () {

        return new Content(view: 'mails.provider', with: [
            'title'    => "{$this->title} | {$this->siteInfo->name}",
            'name'     => $this->siteInfo->name,
            'logo'     => $this->siteInfo->logo,
            'socials'  => $this->siteInfo->socials,
            'siteInfo' => $this->siteInfo,
            'user'     => $this->user,
            'provider' => $this->provider,
            'event'    => $this->event,
            'entity'   => $this->entity,
            'entityId' => $this->entityId,
            'items'    => $this->items,
            'fromMe'   => $this->fromMe,
        ]);

    }

}
