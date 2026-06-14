<?php

namespace App\Http\Resources;

class BlogResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'title' => $data->title,
        ];

    }
    public function data () {

        return [
            'description' => $this->description,
            'content'     => $this->content,
            'location'    => $this->location,
            'phone'       => $this->phone,
            'language'    => $this->language,
            'country'     => $this->country,
            'city'        => $this->city,
            'views'       => $this->views,
            'likes'       => $this->likes,
            'dislikes'    => $this->dislikes,
        ];

    }
    public function relations () {

        return [
            'in_favorites' => $this->isFavorite(),
            'comments'     => $this->comments()->notDeleted()->count(),
        ];

    }

}
