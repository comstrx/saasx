<?php

namespace App\Services;
use App\Repositories\EntityRepository;

class HomeService extends BaseService {
   
    public function __construct(
        protected EntityRepository $entityRepository,
        protected CategoryService $categoryService,
        protected GameService $gameService,
        protected ProductService $productService,
    ) { parent::__construct($entityRepository); }

    public function recentlyOffers ( array $params = [], array $scopes = [], array $permissions = [] ) {

        return success(['items' => []]);

    }
    public function recentlyCategories ( array $params = [], array $scopes = [], array $permissions = [] ) {

        return $this->categoryService->index($params, $scopes, $permissions);
        
    }
    public function recentlyGames ( array $params = [], array $scopes = [], array $permissions = [] ) {

        return $this->gameService->index($params, [...$scopes, 'type' => 'game'], $permissions);
        
    }
    public function recentlyProducts ( array $params = [], array $scopes = [], array $permissions = [] ) {

        return $this->productService->index($params, [...$scopes, 'type' => 'product', 'category_id' => ['!=', 0]], $permissions);
        
    }
    public function recentlyGiftCards ( array $params = [], array $scopes = [], array $permissions = [] ) {

        return $this->gameService->index($params, [...$scopes, 'type' => 'gift_card'], $permissions);
        
    }

}
