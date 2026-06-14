<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ProviderService;

class ProviderController extends Controller {

    public function __construct ( protected ProviderService $providerService ) {

        parent::__construct($providerService);

    }
    public function suppliers ( Request $req, int $storeId = null ) {

        return $this->providerService->suppliers($req->all(), $storeId);

    }
    public function link ( Request $req, int $storeId ) {

        return $this->providerService->link($storeId);

    }
    public function apiLink ( Request $req ) {

        return $this->providerService->apiLink($req->all());

    }
    public function unlink ( Request $req, int $id ) {

        return $this->providerService->unlink($id);
        
    }
    public function account ( Request $req, int $id ) {

        return $this->providerService->account($id);

    }
    public function fetch ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->fetch($id, $entity, $entityId, $req->all());

    }
    public function fetchLinked ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->fetchLinked($id, $entity, $entityId, $req->all());

    }
    public function import ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->import($id, $entity, $entityId, $req->all());

    }
    public function sync ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->sync($id, $entity, $entityId, $req->all());

    }
    public function detach ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->detach($id, $entity, $entityId, $req->all());

    }
    public function remove ( Request $req, int $id, string $entity = null, int $entityId = null ) {

        return $this->providerService->remove($id, $entity, $entityId, $req->all());

    }

}
