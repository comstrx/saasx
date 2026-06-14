<?php

namespace App\Services;
use App\Repositories\TicketRepository;

class TicketService extends BaseService {
   
    public function __construct(
        protected TicketRepository $ticketRepository
    ) { parent::__construct($ticketRepository); }

    public function setResolved ( int $id, array $scopes = [] ) {

        $this->ticketRepository->update($id, ['status' => 'resolved', 'resolved_at' => utc_date()], $scopes, strict: false);
        return success();

    }
    public function setClosed ( int $id, array $scopes = [] ) {

        $this->ticketRepository->update($id, ['status' => 'closed', 'closed_at' => utc_date()], $scopes, strict: false);
        return success();

    }
    public function setPending ( int $id, array $scopes = [] ) {

        $this->ticketRepository->update($id, ['status' => 'pending', 'reopened_at' => utc_date()], $scopes, strict: false);
        return success();

    }

}
