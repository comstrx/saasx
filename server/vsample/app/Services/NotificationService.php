<?php

namespace App\Services;
use App\Repositories\NotificationRepository;
use App\Repositories\NotificationActionRepository;

class NotificationService extends BaseService {

    public function __construct(
        protected NotificationRepository $notificationRepository,
        protected NotificationActionRepository $notifyActionRepo,
    ) { parent::__construct($notificationRepository); }

    public function updateAction ( int $id, int $userId, array $data = [] ) {

        $this->notifyActionRepo->updateOrCreate(['notification_id' => $id, 'user_id' => $userId], $data, boot: false);
        $this->deleteCache();

    }
    public function setAction ( int|array $id, array $scopes = [], array $data = [] ) {

        if ( is_int($id) ) $this->updateAction($this->find($id, $scopes)->id, $scopes['user_id'], $data);
        else $this->query(['ids' => $id], $scopes)->cursor()->each(fn($item) => $this->updateAction($item->id, $scopes['user_id'], $data));
       
        return success();

    }
    public function read ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'read' => false], ['read' => true, 'read_at' => utc_date()]);

    }
    public function unread ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'read' => true], ['read' => false]);

    }
    public function pin ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'pinned' => false], ['pinned' => true, 'pinned_at' => utc_date()]);

    }
    public function unpin ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'pinned' => true], ['pinned' => false]);

    }
    public function delete ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'deleted' => false], ['deleted' => true]);

    }
    public function restore ( int|array $id, array $scopes = [] ) {

        return $this->setAction($id, [...$scopes, 'deleted' => true], ['deleted' => false]);

    }
    public function view ( int $id, array $scopes = [] ) {
        
        $this->read($id, $scopes);

    }
    public function stats ( array $scopes = [] ) {
        
        return $this->successRemember(
            key: [...$scopes, 'type' => 'stats'],
            callback: fn() => [
                'count' => $this->query(scopes: $scopes)->count(),
                'unread' => $this->query(scopes: [...$scopes, 'read' => false])->count(),
                'pinned' => $this->query(scopes: [...$scopes, 'pinned' => true])->count(),
                'deleted' => $this->query(scopes: [...$scopes, 'deleted' => true])->count(),
            ]
        );

    }

}
