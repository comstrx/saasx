<?php

namespace App\Http\Resources;

class MailResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'title'       => $data->title,
            'description' => $data->description,
        ];

    }
    public function data () {

        return [
            'content'            => $this->content,
            'star_sender'        => $this->star_sender,
            'star_receiver'      => $this->star_receiver,
            'important_sender'   => $this->important_sender,
            'important_receiver' => $this->important_receiver,
            'archived_sender'    => $this->archived_sender,
            'archived_receiver'  => $this->archived_receiver,
            'readen'             => $this->readen,
            'readen_at'          => $this->formatDate('readen_at'),
        ];

    }
    public function relations () {

        return [
            'sender'   => UserResource::info( $this->sender ),
            'receiver' => UserResource::info( $this->receiver ),
        ];

    }

}
