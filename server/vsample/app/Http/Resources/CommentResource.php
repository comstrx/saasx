<?php

namespace App\Http\Resources;

class CommentResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'title'   => $data->title,
            'content' => $data->content,
        ];

    }
    public function data () {

        return [
            'views'    => $this->views,
            'likes'    => $this->likes,
            'dislikes' => $this->dislikes,
            'deleted'  => $this->deleted,
        ];

    }
    public function relations () {

        return [
            'user'    => UserResource::info( $this->user ),
            'replies' => $this->replies()->notDeleted()->count(),
            $this->getRelatedName() => $this->getRelatedResource(),
        ];

    }

}
