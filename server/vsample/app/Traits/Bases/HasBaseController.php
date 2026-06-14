<?php

namespace App\Traits\Bases;
use Illuminate\Http\Request;

trait HasBaseController {

    protected array $scopes = [], $permissions = [];

    public function initialize () {

        $this->applyScopes()->applyPermissions();
    
    }
    public function defaultPermissions ( bool $strict = false ) {

        return match ( user_role() ) {
            'admin' => parse(request()->input('permissions')),
            default => [],
        };

    }
    public function defaultScopes ( bool $strict = false ) {

        $defaultRules = match ( user_role() ) {
            'admin' => [],
            'vendor' => [
                'active' => true,
            ],
            default => [
                'active' => true,
                'allow' => true,
                'deleted' => false
            ],
        };
        $strictRules = match ( user_role() ) {
            'admin' => [],
            'vendor' => [
                'vendor_id' => user_id(),
                'wallet_id' => user_wallet()?->id
            ],
            default => [
                'user_id' => user_id(),
                'client_id' => user_id(),
                'owner_id' => user_id(),
                'wallet_id' => user_wallet()?->id
            ],
        };

        return $strict ? array_merge($defaultRules, $strictRules) : array_merge($defaultRules);

    }
    public function applyPermissions ( array $permissions = [] ) {

        $this->permissions = array_merge($this->permissions, $this->defaultPermissions(), $permissions);
        return $this;

    }
    public function applyScopes ( array $scopes = [], bool $strict = false ) {

        $this->scopes = array_merge($this->scopes, $this->defaultScopes($strict), $scopes);
        return $this;

    }

    public function index ( Request $req ) {

        return $this->baseService->index( $req->all(), $this->scopes, $this->permissions );

    }
    public function show ( Request $req, int $id ) {

        return $this->baseService->show( $id, $this->scopes, $this->permissions );
        
    }
    public function store ( Request $req ) {

        $req = method_exists($this, 'requestForm') ? app($this->requestForm()) : $req;
        $this->applyScopes(strict: true);
        return $this->baseService->store( $req->all(), $this->scopes );

    }
    public function update ( Request $req, int $id, string $column = null ) {

        $req = method_exists($this, 'requestForm') && !$column ? app($this->requestForm()) : $req;
        $this->applyScopes(strict: true);
        return $this->baseService->update( $id, $column ? [$column => $req->input($column)] : $req->all(), $this->scopes );
        
    }
    public function delete ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->delete( $id, $this->scopes );
        
    }
    public function deleteMultiple ( Request $req ) {

        $this->applyScopes(strict: true);
        return $this->baseService->deleteMultiple( parse($req->ids), $this->scopes );
        
    }
    public function setDeleted ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->setDeleted( $id, $this->scopes );
        
    }
    public function setDeletedMultiple ( Request $req ) {

        $this->applyScopes(strict: true);
        return $this->baseService->setDeletedMultiple( parse($req->ids), $this->scopes );
        
    }
    public function statistics ( Request $req ) {

        $this->applyScopes(strict: true);
        return $this->baseService->statistics( $req->all(), $this->scopes, $this->permissions );

    }
    public function download ( Request $req ) {

        $this->applyScopes(strict: true);
        return $this->baseService->download( $req->all(), $this->scopes, $this->permissions );

    }
    
    public function allPermissions ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->allPermissions($id, $this->scopes);

    }
    public function allowPermission ( Request $req, int $id, string $permission = null ) {

        $this->applyScopes(strict: true);
        return $this->baseService->allowPermissions( $id, array_merge(parse($req->permissions), (array) $permission), $this->scopes );

    }
    public function denyPermission ( Request $req, int $id, string $permission = null ) {

        $this->applyScopes(strict: true);
        return $this->baseService->denyPermissions( $id, array_merge(parse($req->permissions), (array) $permission), $this->scopes );

    }

    public function uploadFiles ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->uploadFiles( $id, $req->allFiles(), $this->scopes );

    }
    public function deleteFiles ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->deleteFiles( $id, parse($req->ids), $this->scopes );

    }
    public function updateImage ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->updateImage( $id, collect($req->allFiles())->first(), $this->scopes );

    }
    public function deleteImage ( Request $req, int $id ) {

        $this->applyScopes(strict: true);
        return $this->baseService->deleteImage( $id, $this->scopes );

    }

    public function report ( Request $req, int $id ) {

        return $this->baseService->report( $id, $req->all(), $this->scopes );

    }
    public function review ( Request $req, int $id ) {

        return $this->baseService->review( $id, $req->all(), $this->scopes );

    }
    public function comment ( Request $req, int $id ) {

        return $this->baseService->comment( $id, $req->all(), $this->scopes );

    }
    public function reply ( Request $req, int $id ) {

        return $this->baseService->reply( $id, $req->all(), $this->scopes );

    }
    public function favorite ( Request $req, int $id ) {

        return $this->baseService->favorite( $id, $this->scopes );

    }
    public function unfavorite ( Request $req, int $id ) {

        return $this->baseService->unfavorite( $id, $this->scopes );

    }
    public function like ( Request $req, int $id ) {

        return $this->baseService->like( $id, $this->scopes );

    }
    public function dislike ( Request $req, int $id ) {

        return $this->baseService->dislike( $id, $this->scopes );

    }

    public function __call ( $method, $args ) {

        try {

            foreach ( ['related', 'showRelated', 'statisticsRelated', 'downloadRelated'] as $func ) {

                if ( !str_starts_with($method, $func) ) continue;

                $relation = lcfirst(str_replace($func, '', $method));
                $exists = method_exists($this->baseService, $relation) && !in_array($relation, ['index', 'store', 'update', 'show', 'delete']);

                return match ( $exists ) {
                    true =>
                        $func === 'showRelated' ?
                            $this->baseService->$relation(integer($args[0] ?? null), integer($args[1] ?? null), request()->all(), $this->scopes, $this->permissions) :
                            $this->baseService->$relation(integer($args[0] ?? null), request()->all(), $this->scopes, $this->permissions),
                    default =>
                        $func === 'showRelated' ?
                            $this->baseService->$func(integer($args[0] ?? null), $relation, integer($args[1] ?? null), request()->all(), $this->scopes, $this->permissions) :
                            $this->baseService->$func(integer($args[0] ?? null), $relation, request()->all(), $this->scopes, $this->permissions)
                };

            }
            
        } catch ( \Exception $e ) {}

        throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException();

    }

}
