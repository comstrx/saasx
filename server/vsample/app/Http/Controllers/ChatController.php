<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\MessageService;
use App\Services\RoomService;

class ChatController extends Controller {

    public bool $global_route = false;

    public function __construct ( protected RoomService $roomService, protected MessageService $messageService ) {
        
        parent::__construct($roomService);
        $this->applyScopes(['user_id' => user_id(), 'user_role' => user_role()], true);
        $this->setProperties();

    }
    public function setProperties () {

        $this->roomId    = integer(request()->route('room') ?? $this->roomService->supportId());
        $this->userId    = integer(request()->route('user'));
        $this->messageId = integer(request()->route('message'));

    }
    
    public function rooms ( Request $req ) {

        return $this->roomService->index($req->all(), $this->scopes);

    }
    public function showRoom ( Request $req ) {

        return $this->roomService->show($this->roomId, $this->scopes);

    }
    public function newRoom ( Request $req ) {

        return $this->roomService->newRoom($this->userId);

    }
    public function typingRoom ( Request $req ) {

        return $this->roomService->typing($this->roomId);

    }
    public function archiveRoom ( Request $req ) {

        return $this->roomService->archive($this->roomId);

    }
    public function unarchiveRoom ( Request $req ) {

        return $this->roomService->unarchive($this->roomId);

    }
    public function muteRoom ( Request $req ) {

        return $this->roomService->mute($this->roomId);

    }
    public function unmuteRoom ( Request $req ) {

        return $this->roomService->unmute($this->roomId);

    }
    public function pinRoom ( Request $req ) {

        return $this->roomService->pin($this->roomId);

    }
    public function unpinRoom ( Request $req ) {

        return $this->roomService->unpin($this->roomId);

    }
    public function removeRoom ( Request $req ) {

        return $this->roomService->remove($this->roomId, $req->input('type'));

    }
    public function destroyRoom ( Request $req ) {

        return $this->roomService->destroy($this->roomId);

    }

    public function messages ( Request $req ) {

        $room = $this->messageService->setRoom($this->roomId);
        $room->read();
        return $room->index($req->all(), [...$this->scopes, 'room_id' => $this->roomId]);

    }
    public function showMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->show($this->messageId, [...$this->scopes, 'room_id' => $this->roomId]);

    }
    public function sendMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->send($req->all(), $this->messageId);

    }
    public function messagesRead ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->read();

    }
    public function messagesDelivered ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->delivered();

    }
    public function reactionMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->reaction($this->messageId, $req->input('reaction'));

    }
    public function unreactionMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->unreaction($this->messageId);

    }
    public function starMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->star($this->messageId);

    }
    public function unstarMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->unstar($this->messageId);

    }
    public function pinMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->pin($this->messageId);

    }
    public function unpinMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->unpin($this->messageId);

    }
    public function removeMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->remove($this->messageId, $req->input('type'));

    }
    public function destroyMessage ( Request $req ) {

        return $this->messageService->setRoom($this->roomId)->destroy($this->messageId);

    }

}
