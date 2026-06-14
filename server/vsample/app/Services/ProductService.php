<?php

namespace App\Services;
use App\Repositories\ProductRepository;

class ProductService extends BaseService {

    public function __construct (
        protected ProductRepository $productRepository,
        protected OrderService $orderService,
        protected CouponService $couponService,
        protected GatewayService $gatewayService,
        protected CartService $cartService,
    ) { parent::__construct($productRepository); }
  
    public function cart ( int $id, array $scopes = [] ) {

        return $this->cartService->addItem($this->find($id, $scopes)->id);

    }
    public function discart ( int $id, array $scopes = [] ) {

        return $this->cartService->removeItem($this->find($id, $scopes)->id);

    }
    public function order ( int $id, array $scopes = [] ) {
        
        return success([
            'product' => data_get($this->show($id, $scopes), 'original.item'),
            'gateways' => data_get($this->gatewayService->index(scopes: ['active']), 'original.items') ?? [],
        ]);

    }
    public function coupon ( int $id, int|string $coupon = null, array $data = [], array $scopes = [] ) {

        $data['product_id'] = $this->find($id, $scopes)->id;
        return $this->couponService->validate($coupon, $data);

    }
    public function checkout ( int $id, array $data = [], array $scopes = [] ) {

        return $this->orderService->startOrder(
            $this->find($id, $scopes),
            client(),
            max(1, integer($data['quantity'] ?? 1)),
            strtolower(string($data['pay_type'] ?? 'wallet')),
            $data
        );

    }

}
