<?php

namespace App\Services;
use Illuminate\Support\Collection;
use App\Repositories\OrderRepository;
use App\Repositories\WalletRepository;
use App\Repositories\ProductRepository;
use App\Repositories\UserRepository;
use App\Repositories\ProviderRepository;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;

class OrderService extends BaseService {

    public function __construct(
        protected OrderRepository $orderRepository,
        protected WalletRepository $walletRepository,
        protected ProductRepository $productRepository,
        protected UserRepository $userRepository,
        protected ProviderRepository $providerRepository,
        protected PaymentService $paymentService,
        protected CouponService $couponService,
        protected GiftCodeService $giftCodeService,
        protected TicketService $ticketService,
        protected VerificationService $verificationService,
    ) { parent::__construct($orderRepository); }

    protected function normalizeChain ( Collection $chain ) {

        $baseProduct = $chain->last()->product;
        $quantity = $chain->last()->quantity;

        $chain = $chain->map(function ( $item ) use ( $baseProduct ) {

            $item->product->new_price       = $baseProduct->totalPrice();
            $item->product->max_quantity    = $baseProduct->max_quantity;
            $item->product->cancel_cost     = $baseProduct->cancel_cost;
            $item->product->cancel_before   = $baseProduct->cancel_before;
            $item->product->refund_before   = $baseProduct->refund_before;
            $item->product->delivery_method = $baseProduct->delivery_method;

            return $item;

        });
        
        $baseProduct->newUsage('max_quantity', $quantity);
        return $chain->reverse();

    }
    protected function rootOrder ( Order $order ) {

        while ( $order->ref_id ) {

            $next = $this->withoutTenant(fn() => $this->orderRepository->findBy('id', $order->ref_id));
            if ( !$next ) break;

            $order = $next;

        }

        return $order;

    }

    public function validateData ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {

        return match ( true ) {
            !in_array($payType, ['wallet', 'directly', 'later']) => ['pay_type' => 'invalid pay type'],
            $product->max_quantity < 1 || $quantity > $product->max_quantity => ['quantity' => 'maximum exceeded'],
            $payType === 'later' && !$product->has('allow_late_payments') => ['pay_later' => 'pay later not allowed'],
            !$user->active || !$user->has('allow_orders') => ['user' => 'permission access denied'],
            !$product->active || !$product->has('allow_orders') => ['product' => 'permission access denied'],
            !$product->store?->active || !$product->store->has('allow_orders') => ['store' => 'permission access denied'],
            $product->game && !$product->game->has('allow_orders') => ['game' => 'permission access denied'],
            $product->category && !$product->category->has('allow_orders') => ['category' => 'permission access denied'],
            $product->game?->category && !$product->game->category->has('allow_orders') => ['category' => 'permission access denied'],
            default => null
        };

    }
    public function buildChain ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {

        [$chain, $current, $client] = [collect(), $product, $user];

        while ( $current && $client ) {

            $storeId = $current->store_id;

            $error = $this->withTenant($storeId, callback: fn() => $this->validateData($current, $client, $quantity, $payType, $data));
            if ( $error ) throwError(array_keys($error)[0], array_values($error)[0]);

            $chain->push((object) [
                'storeId'  => $storeId,
                'clientId' => $client->id,
                'product'  => $current,
                'user'     => $client,
                'quantity' => $quantity,
                'pay_type' => $payType,
                'data'     => $data
            ]);

            $current = $this->withoutTenant(fn() => $this->productRepository->find($current->ref_id));
            if ( !$current || $current->store_id === $storeId ) break;
          
            $provider = $this->providerRepository->findBy('supplier_id', $current->store_id, ['active']);
            $client   = $this->withTenant($provider?->supplier_id, callback: fn() => $provider?->user);

            if ( !$client || $client->store_id === $storeId ) break;

        }

        return $this->normalizeChain($chain);

    }
    public function applyCoupon ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {

        $coupon = $data['coupon_id'] ?? $data['coupon_code'] ?? $data['coupon'] ?? null;
        $coupon = !$coupon ? [] : $this->couponService->apply($product, $user, $coupon, $quantity, true) ?? [];

        return [
            ...$user->toArray(),
            ...$data,
            'total_price' => $product->totalPrice() * $quantity,
            'quantity'    => $quantity,
            'pay_type'    => $payType,
            'coupon_code' => null,
            'coupon_id'   => null,
            'discount'    => null,
            ...$coupon,
        ];

    }
    public function applyGiftCode ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {

        $data['gift_code_id'] = $this->giftCodeService->apply($product, $user)?->id ?? 0;
        return $data;

    }
    public function completeOrder ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {

        if ( $payType === 'wallet' && !$user->wallet?->canPay($data['total_price']) ) throwError('balance', 'no enough balance');

        $order = $this->orderRepository->newOrder($product, $user, $data);
        $this->orderRepository->generateKey($order);

        $this->runJob([ProviderService::class, 'syncEntity'], [$product, ['only_purchase' => true]]);
        send_email($user, $order, 'invoice');

        if ( $payType === 'directly' ) return $this->paymentService->payOrder($order, $data);
        if ( $payType === 'wallet' ) $this->payOrder($order, $data);

        return success(['item' => $order->fresh()->toResource()]);

    }
    public function startOrder ( Product $product, User $user, int $quantity, string $payType, array $data = [] ) {
        
        return $this->orderRepository->dbTransaction(function () use ( $product, $user, $quantity, $payType, $data ) {

            $ref_id = null;

            return $this->buildChain($product, $user, $quantity, $payType, $data)->map(function ( $item ) use ( &$ref_id ) {
                
                return $this->withTenant($item->storeId, $item->clientId, function () use ( $item, &$ref_id ) {

                    $data  = $this->applyCoupon($item->product, $item->user, $item->quantity, $item->pay_type, $item->data);
                    $data  = $this->applyGiftCode($item->product, $item->user, $item->quantity, $item->pay_type, $data);
                    $order = $this->completeOrder($item->product, $item->user, $item->quantity, $item->pay_type, [...$data, 'ref_id' => $ref_id]);
                    
                    $ref_id = integer(data_get($order, 'original.item.id'));
                    return $order;

                });

            })->last();

        });

    }
   
    public function payOrder ( Order $order, array $data = [] ) {

        $amount = $order->canPay() ? $order->payAmount(float($data['amount'] ?? 0)) : 0;
        $wallet = $order->user?->wallet;

        if ( !$amount || !$wallet ) throwError('pay', 'cannot pay order');
        if ( !$this->walletRepository->pay($wallet, $amount) ) throwError('balance', 'not enough balance');

        $this->orderRepository->setPaid($order, $amount);
        $this->deleteCache();

    }
    public function cancelOrder ( Order $order, array $data = [] ) {

        $amount = $order->canRefund() ? $order->refundAmount(float($data['amount'] ?? 0)) : 0;
        $wallet = $order->user?->wallet;

        if ( !$order->canCancel() ) throwError('cancel', 'cannot cancel order');
        if ( $wallet && $this->walletRepository->addMoney($wallet, $amount) ) $this->orderRepository->setRefunded($order, $amount);

        $this->orderRepository->setCancelled($order);
        $this->deleteCache();
        
        $child = $this->withoutTenant(fn() => $this->orderRepository->findBy('ref_id', $order->id));
        if ( $child ) $this->withTenant($child->store_id, $child->user_id, fn() => $this->cancelOrder($child, $data));

    }
    public function updateOrder ( Order $order, array $data = [] ) {

        if ( is_client() ) {

            if ( !$order->isFinished() ) $this->update($order->id, $data);

        }
        else {

            [$pay, $cancel] = [bool(data_get($data, 'paid')), string(data_get($data, 'status')) === 'cancelled'];
        
            if ( $pay && !$order->paid && $order->canPay() ) $this->payOrder($order);
            if ( $cancel && $order->canCancel() ) $this->cancelOrder($order);

            $this->orderRepository->update($order->id, $this->orderRepository->allFields($data), strict: false);
            $this->deleteCache();

        }

        $child = $this->withoutTenant(fn() => $this->orderRepository->findBy('ref_id', $order->id));
        if ( $child ) $this->withTenant($child->store_id, $child->user_id, fn() => $this->updateOrder($child, $data));

    }

    public function store ( array $data = [], array $scopes = [] ) {

        return $this->startOrder(
            $this->productRepository->findOrFail($data['product_id'] ?? 0),
            $this->userRepository->findOrFail($data['user_id'] ?? 0),
            max(1, integer($data['quantity'] ?? 1)),
            strtolower(string($data['pay_type'] ?? 'wallet')),
            $data
        );

    }
    public function pay ( int $id, array $data = [], array $scopes = [] ) {

        $order = $this->find($id, $scopes);

        return $this->orderRepository->dbTransaction(function () use ( $order, $data ) {

            $this->payOrder($this->rootOrder($order), $data);
            return success(['item' => $order->fresh()->toResource()]);

        });

    }
    public function cancel ( int $id, array $data = [], array $scopes = [] ) {

        $order = $this->find($id, $scopes);

        return $this->orderRepository->dbTransaction(function () use ( $order, $data ) {
        
            $this->cancelOrder($this->rootOrder($order), $data);
            return success(['item' => $order->fresh()->toResource()]);

        });

    }
    public function update ( int $id, array $data = [], array $scopes = [] ) {
        
        $order = $this->find($id, $scopes);

        return $this->orderRepository->dbTransaction(function () use ( $order, $data ) {
        
            $this->updateOrder($this->rootOrder($order), $data);
            return success(['item' => $order->fresh()->toResource()]);

        });

    }
    public function ticket ( int $id, array $data = [], array $scopes = [] ) {

        $order = $this->find($id, $scopes);
        return $this->ticketService->store([...$data, 'order_id' => $order->id], $scopes);

    }
    public function verify ( int $id, array $scopes = [] ) {

        $order = $this->find($id, $scopes);
        if ( !$order->giftCode ) return notFoundFailed('gift_code');

        $this->verificationService->verify($order->user, 'order_gift_code', 'email');
        return success();

    }
    public function confirm ( int $id, array $scopes = [], string $code = null ) {

        $order = $this->find($id, $scopes);

        $status = $this->verificationService->confirm($code, 'order_gift_code');
        if ( !$status ) return notFoundFailed('code');

        return success(['gift_code' => $order->giftCode?->code]);

    }

}
