<?php

namespace App\Services;
use App\Repositories\EntityRepository;

class SearchService extends BaseService {
   
    public function __construct(
        protected EntityRepository $entityRepository,
        protected CategoryService $categoryService,
        protected GameService $gameService,
        protected ProductService $productService,
    ) { parent::__construct($entityRepository); }

    public function index ( array $params = [], array $scopes = [], array $permissions = [], array $callbacks = [] ) {

        $params['limit'] = ceil((integer($params['limit'] ?? null) ?: 10) / 3);

        return $this->successRemember(
            key: ['search', $params, $scopes, $permissions, $callbacks],
            callback: fn() =>
                $this->entityRepository->getModel()->getResourceMany([
                    $this->categoryService->query($params, $scopes, $permissions, $callbacks),
                    $this->gameService->query($params, $scopes, $permissions, $callbacks),
                    $this->productService->query($params, $scopes, $permissions, $callbacks),
                ])
        );

    }

}
