<?php

namespace App\Services;
use App\Repositories\CartRepository;

class CartService extends BaseService {

    public function __construct (
        protected CartRepository $cartRepository,
        protected CouponService $couponService,
        protected OrderService $orderService,
    ) { parent::__construct($cartRepository); }
  
    public function addItem ( int $id ) {

        if ( $this->cartRepository->addItem($id, client_id()) ) $this->deleteCache();
        return success();

    }
    public function removeItem ( int $id ) {

        if ( $this->cartRepository->removeItem($id, client_id()) ) $this->deleteCache();
        return success();

    }
    public function increment ( int $id, array $data = [], array $scopes = [] ) {

        if ( $this->cartRepository->increment($id, integer($data['quantity'] ?? 1), $scopes) ) $this->deleteCache();
        return success();

    }
    public function decrement ( int $id, array $data = [], array $scopes = [] ) {

        if ( $this->cartRepository->decrement($id, integer($data['quantity'] ?? 1), $scopes) ) $this->deleteCache();
        return success();

    }
    public function coupon ( int $id, int|string $coupon = null, array $scopes = [] ) {

        $cart = $this->find($id, $scopes);
        return $this->couponService->validate($coupon, ['product_id' => $cart->product_id, 'quantity' => $cart->quantity]);

    }
    public function checkout ( int $id, array $data = [], array $scopes = [] ) {

        $cart = $this->find($id, $scopes);

        $order = $this->orderService->startOrder($cart->product, client(), $cart->quantity, 'wallet', $data);
        if ( data_get($order, 'original.item') ) $this->delete($cart->id);

        return $order;

    }
    public function checkoutAll ( array $data = [], array $scopes = [] ) {

        return $this->cartRepository->dbTransaction(function () use ( $data, $scopes ) {

            $orders = collect(parse($data['items'] ?? []))->map(function( $item ) use ( $scopes ) {

                try {
                    
                    $id = integer($item['id'] ?? 0);
                    return data_get($this->checkout($id, (array) $item, $scopes), 'original.item');

                } catch ( \Exception $e ) { throwError('cart', "failed to checkout item {$id}"); }
                
            })->filter();
            
            return success([
                'items'          => $orders,
                'total_amount'   => $orders->sum('amount'),
                'total_paid'     => $orders->sum('paid_amount'),
                'total_discount' => $orders->sum('discount'),
                'total_quantity' => $orders->sum('quantity'),
            ]);

        });

    }

}
