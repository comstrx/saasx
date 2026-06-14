<?php

namespace App\Repositories;
use App\Models\Blog;

class BlogRepository extends BaseRepository {

    public function __construct( Blog $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'phone'       => string($data['phone']),
            'language'    => string($data['language']),
            'country'     => string($data['country']),
            'city'        => string($data['city']),
            'notes'       => string($data['notes']),
            'title'       => $data['title'],
            'content'     => $data['content'],
            'location'    => $data['location'],
            'description' => $data['description'],
        ];

    }

}
