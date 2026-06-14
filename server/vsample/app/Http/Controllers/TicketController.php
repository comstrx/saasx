<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\TicketService;

class TicketController extends Controller {

    public function __construct ( protected TicketService $ticketService ) {

        parent::__construct($ticketService);
        $this->applyScopes(strict: true);
    
    }
    public function update ( Request $req, int $id, string $column = null ) {
        
        $this->applyScopes(['status' => 'pending']);
        return parent::update($req, $id, $column);

    }
    public function resolve ( Request $req, int $id ) {

        $this->applyScopes(['status' => 'pending']);
        return $this->ticketService->setResolved($id, $this->scopes);

    }
    public function close ( Request $req, int $id ) {

        $this->applyScopes(['status' => 'pending']);
        return $this->ticketService->setClosed($id, $this->scopes);

    }
    public function reopen ( Request $req, int $id ) {

        $this->applyScopes(['status' => 'closed']);
        return $this->ticketService->setPending($id, $this->scopes);

    }
    public function reply ( Request $req, int $id ) {
        
        $this->applyScopes(['status' => 'pending']);
        return parent::reply($req, $id);

    }

}
