<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class NotificationController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected NotificationService $notificationService ) {
        
        parent::__construct($notificationService);
        $this->applyScopes(['user_id' => user_id(), 'user_role' => user_role()], true);
    
    }
    public function stats ( Request $req ) {

        return $this->notificationService->stats($this->scopes);

    }
    public function read ( Request $req, int $id = null ) {

        return $this->notificationService->read($id ?? parse($req->ids), $this->scopes);

    }
    public function unread ( Request $req, int $id = null ) {

        return $this->notificationService->unread($id ?? parse($req->ids), $this->scopes);

    }
    public function pin ( Request $req, int $id = null ) {

        return $this->notificationService->pin($id ?? parse($req->ids), $this->scopes);

    }
    public function unpin ( Request $req, int $id = null ) {

        return $this->notificationService->unpin($id ?? parse($req->ids), $this->scopes);

    }
    public function delete ( Request $req, int $id = null ) {

        return $this->notificationService->delete($id ?? parse($req->ids), $this->scopes);

    }
    public function restore ( Request $req, int $id = null ) {

        return $this->notificationService->restore($id ?? parse($req->ids), $this->scopes);

    }

}
