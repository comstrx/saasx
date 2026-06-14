<?php

namespace App\Traits\Bases;
use Illuminate\Support\Arr;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use App\Jobs\ExecuteJob;

trait HasBaseService {

    protected array $scopes = [], $permissions = [], $callbacks = [], $filters = [], $params = [];
    protected ?string $resource = null, $cacheTag = null, $cacheKey = null;
    protected ?int $cacheMinutes = null;

    public function initialize () {
        
        $this->resource = $this->baseRepository?->getModel()?->getResourceClass() ?? '';
        if ( method_exists($this, 'boot') ) $this->boot();
        
    }
    protected function setCacheTag ( string $tag = null, string $key = null, int $minutes = null ) {

        [$this->cacheTag, $this->cacheKey, $this->cacheMinutes] = [$tag, $key, $minutes];

    }
    protected function remember ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null ) {

        return $this->baseRepository->getModel()->remember(
            $tag ?? $this->cacheTag,
            $key ?? $this->cacheKey,
            $minutes ?? $this->cacheMinutes,
            $callback
        );

    }
    protected function successRemember ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null ) {

        return $this->baseRepository->getModel()->successRemember(
            $tag ?? $this->cacheTag,
            $key ?? $this->cacheKey,
            $minutes ?? $this->cacheMinutes,
            $callback
        );

    }
    protected function successDownload ( string $tag = null, string|array $key = null, int $minutes = null, callable $callback = null ) {

        return $this->baseRepository->getModel()->successDownload(
            $tag ?? $this->cacheTag,
            $key ?? $this->cacheKey,
            $minutes ?? $this->cacheMinutes,
            $callback
        );

    }
    protected function cache ( bool $response = false, ...$args ) {

        return $response ? $this->successRemember(...$args) : $this->remember(...$args);

    }
    protected function deleteCache ( string $tag = null ) {

        return $this->baseRepository->getModel()->deleteCacheTag($tag ?? $this->cacheTag);

    }
    protected function failNow ( string $name = null ) {

        return $this->baseRepository->getModel()->failNow($name);

    }
    protected function runJob ( mixed $job, array $args = [] ) {

        return dispatch(new ExecuteJob($job, $args))->afterCommit();

    }
    protected function withTenant ( int $id = null, int $userId = null, callable $callback = null ) {
       
        return $this->baseRepository->getModel()->setTenant($id, $userId, $callback);

    }
    protected function withoutTenant ( callable $callback ) {

        return $this->baseRepository->getModel()->setTenant(callback: $callback);

    }

    protected function buildParams ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [], int|array $id = null ) {

        return [
            'id'         => $id ?? parse($params['ids'] ?? null),
            'text'       => string($params['search'] ?? null),
            'page'       => integer($params['page'] ?? null),
            'limit'      => integer($params['limit'] ?? null),
            'sortBy'     => string($params['sort'] ?? null),
            'field'      => parse($params['fields'] ?? []),
            'filter'     => parse($params['filters'] ?? []),
            'aggregates' => parse($params['aggregates'] ?? []),
            'scope'      => $scopes,
            'callback'   => $callbacks,
            'permission' => $permissions,
        ];

    }
    protected function buildResponse ( Builder $query, array $options = [], string $resource = null, int $id = null, bool $one = false ) {

        $searchOptions = $this->buildParams(...$options);

        return $query->getModel()->successRemember(
            tag: $this->cacheTag,
            key: [...$searchOptions, 'id' => $id, 'type' => 'resource'],
            callback: fn() => $query->search(...$searchOptions)->getResource($resource, $one)
        );

    }
    protected function buildResponseStats ( Builder $query, array $options = [], int $id = null ) {

        $searchOptions = $this->buildParams(...$options);

        return $query->getModel()->successRemember(
            tag: $this->cacheTag,
            key: [...$searchOptions, 'id' => $id, 'type' => 'stats'],
            callback: fn() => $query->search(...$searchOptions)->getStats($options['params'] ?? [])
        );

    }
    protected function buildResponseDownload ( Builder $query, array $options = [], int $id = null ) {

        $searchOptions = $this->buildParams(...$options);

        return $query->getModel()->successDownload(
            tag: $this->cacheTag,
            key: [...$searchOptions, 'id' => $id, 'type' => 'download'],
            callback: fn() => $query->search(...$searchOptions)->getItems()
        );

    }
    protected function buildResponseShow ( Builder $query, int $id = null, array $options = [] ) {

        $searchOptions = $this->buildParams(...$options);

        return $query->getModel()->successRemember(
            tag: $this->cacheTag,
            key: [...$searchOptions, 'id' => $id, 'type' => 'resource'],
            callback: fn() => $query->search(...$searchOptions)->findResource($id)
        );

    }
    protected function buildResponseFind ( Builder $query, int $id = null, array $options = [], bool $fail = true ) {

        $searchOptions = $this->buildParams(...$options);

        return $query->getModel()->remember(
            tag: $this->cacheTag,
            key: [...$searchOptions, 'id' => $id, 'type' => 'find'],
            callback: fn() => $fail ?
                $query->search(...$searchOptions)->getFirstOrFail($id) :
                $query->search(...$searchOptions)->getFirst($id)
        );

    }

    public function query ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->baseRepository->query()->search(...$this->buildParams(...compact('params', 'scopes', 'permissions', 'callbacks')));

    }
    public function index ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->buildResponse($this->baseRepository->query(), compact('params', 'scopes', 'permissions', 'callbacks'), $this->resource);

    }
    public function find ( int $id, array $scopes = [], array $permissions = [], array $callbacks = [], bool $fail = true ) {

        if ( !$id ) return $fail ? $this->failNow() : null;
        return $this->buildResponseFind($this->baseRepository->query(), $id, compact('scopes', 'permissions', 'callbacks'), $fail);

    }
    public function show ( int $id, array $scopes = [], array $permissions = [], array $callbacks = [] ) {
     
        if ( !$id ) $this->failNow();
       
        $response = $this->buildResponseShow($this->baseRepository->query(), $id, compact('scopes', 'permissions', 'callbacks'));
        if ( is_client() ) $this->runJob([static::class, 'view'], [$id, $scopes]);
   
        return $response;

    }
    public function statistics ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->buildResponseStats($this->baseRepository->query(), compact('params', 'scopes', 'permissions', 'callbacks'));

    }
    public function download ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->buildResponseDownload($this->baseRepository->query(), compact('params', 'scopes', 'permissions', 'callbacks'));

    }
    public function related ( int $id, string $relation, array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {

        return $this->buildResponse(
            $this->find($id, $scopes)->$relation()->getQuery(),
            compact('params', 'scopes', 'permissions', 'callbacks'),
            id: $id,
            one: $this->baseRepository->getModel()->isOneRelation($relation)
        );

    }
    public function showRelated ( int $id, string $relation, int $relationId, array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {

        return $this->buildResponseShow(
            $this->find($id, $scopes)->$relation()->getQuery(),
            $relationId,
            compact('params', 'scopes', 'permissions', 'callbacks'),
        );

    }
    public function statisticsRelated ( int $id, string $relation, array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->buildResponseStats(
            $this->find($id, $scopes)->$relation()->getQuery(),
            compact('params', 'scopes', 'permissions', 'callbacks'),
            $id
        );

    }
    public function downloadRelated ( int $id, string $relation, array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {
        
        return $this->buildResponseDownload(
            $this->find($id, $scopes)->$relation()->getQuery(),
            compact('params', 'scopes', 'permissions', 'callbacks'),
            $id
        );

    }
    
    public function store ( array $data = [], array $scopes = [] ) {

        if ( $item = $this->baseRepository->create($data, $scopes) ) $this->deleteCache();
        return $this->show($item->id, $scopes);

    }
    public function update ( int $id, array $data = [], array $scopes = [] ) {

        if ( $this->baseRepository->update($id, $data, $scopes) ) $this->deleteCache();
        return $this->show($id, $scopes);

    }
    public function insert ( array $data = [], array $scopes = [] ) {

        if ( $items = $this->baseRepository->insert($data, $scopes) ) $this->deleteCache();
        return $this->resource::collection($items);

    }
    public function firstOrCreate ( array $condition = [], array $data = [], array $scopes = [], bool $boot = true, bool $strict = true ) {

        if ( $item = $this->baseRepository->firstOrCreate($condition, $data, $scopes, $boot, $strict) ) $this->deleteCache();
        return $this->show($item->id, $scopes);

    }
    public function updateOrCreate ( array $condition = [], array $data = [], array $scopes = [], bool $boot = true, bool $strict = true ) {

        if ( $item = $this->baseRepository->updateOrCreate($condition, $data, $scopes, $boot, $strict) ) $this->deleteCache();
        return $this->show($item->id, $scopes);

    }
    public function delete ( int $id, array $scopes = [] ) {

        if ( $this->baseRepository->delete($id, $scopes) ) $this->deleteCache();
        else $this->failNow();

        return success();

    }
    public function setDeleted ( int $id, array $scopes = [] ) {

        if ( $this->baseRepository->setDeleted($id, $scopes) ) $this->deleteCache();
        else $this->failNow();

        return success();

    }
    public function deleteMultiple ( array $ids = [], array $scopes = [] ) {

        if ( $this->baseRepository->delete($ids, $scopes) ) $this->deleteCache();
        return success();
        
    }
    public function setDeletedMultiple ( array $ids = [], array $scopes = [] ) {

        if ( $this->baseRepository->setDeleted($ids, $scopes) ) $this->deleteCache();
        return success();
        
    }
    
    public function allPermissions ( int $id, array $scopes = [] ) {

        return success($this->find($id, $scopes)->permissionsResource());

    }
    public function allowPermissions ( int $id, array $permissions = [], array $scopes = [] ) {

        return success(['status' => $this->find($id, $scopes)->allow(...$permissions)]);
    
    }
    public function denyPermissions ( int $id, array $permissions = [], array $scopes = [] ) {

        return success(['status' => $this->find($id, $scopes)->deny(...$permissions)]);
    
    }
    
    public function uploadFiles ( int $id, array $files = [], array $scopes = [] ) {

        $files = $this->find($id, $scopes)->uploadFiles($files)?->toResource();
        if ( $files ) $this->deleteCache();
        return success(['files' => $files]);

    }
    public function updateImage ( int $id, $image, array $scopes = [] ) {

        $image = $this->find($id, $scopes)->uploadFile($image)?->path;
        if ( $image ) $this->deleteCache();
        return success(['image' => $image]);

    }
    public function deleteFiles ( int $id, array $fileIds = [], array $scopes = [] ) {

        if ( $this->find($id, $scopes)->deleteFiles($fileIds) ) $this->deleteCache();
        return success();

    }
    public function deleteImage ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->deleteImage() ) $this->deleteCache();
        return success();

    }

    public function report ( int $id, array $data = [], array $scopes = [] ) {

        return success(['item' => $this->find($id, $scopes)->newReport(user_id(), $data)->toResource()]);

    }
    public function review ( int $id, array $data = [], array $scopes = [] ) {

        return success(['item' => $this->find($id, $scopes)->newReview(user_id(), $data)->toResource()]);

    }
    public function comment ( int $id, array $data = [], array $scopes = [] ) {

        return success(['item' => $this->find($id, $scopes)->newComment(user_id(), $data)->toResource()]);

    }
    public function reply ( int $id, array $data = [], array $scopes = [] ) {

        return success(['item' => $this->find($id, $scopes)->newReply(user_id(), $data)->toResource()]);

    }
    public function favorite ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->newFavorite(user_id(), true) ) $this->deleteCache();
        return success();

    }
    public function unfavorite ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->newFavorite(user_id(), false) ) $this->deleteCache();
        return success();

    }
    public function like ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->newLike(user_id(), true) ) $this->deleteCache();
        return success();

    }
    public function dislike ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->newLike(user_id(), false) ) $this->deleteCache();
        return success();

    }
    public function view ( int $id, array $scopes = [] ) {

        if ( $this->find($id, $scopes)->newView(user_id()) ) $this->deleteCache();
        return success();

    }

}
