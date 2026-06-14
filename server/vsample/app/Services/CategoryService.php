<?php

namespace App\Services;
use App\Repositories\CategoryRepository;

class CategoryService extends BaseService {
   
    public function __construct(
        protected CategoryRepository $categoryRepository,
        protected GameService $gameService,
        protected ProductService $productService,
    ) { parent::__construct($categoryRepository); }

    public function items ( int $id, array $params = [], array $scopes = [], array $permissions = [] ) {

        $params['limit'] = ceil((integer($params['limit'] ?? null) ?: 10) / 2);

        return $this->successRemember(
            key: [$id, $params, $scopes, $permissions],
            callback: fn() =>
                $this->categoryRepository->getModel()->getResourceMany([
                    $this->gameService->query($params, [...$scopes, 'category_id' => $id], $permissions),
                    $this->productService->query($params, [...$scopes, 'category_id' => $id], $permissions),
                ])
        );

    }
    public function giftCards ( int $id, array $params = [], array $scopes = [], array $permissions = [] ) {

        return parent::related($id, 'games', $params, [...$scopes, 'type' => 'gift_card'], $permissions);

    }

}
