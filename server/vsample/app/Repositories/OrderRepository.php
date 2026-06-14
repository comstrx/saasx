<?php

namespace App\Repositories;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;

class OrderRepository extends BaseRepository {

    public function __construct( Order $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        return [
            'name'      => string(data_get($data, 'name')),
            'email'     => string(data_get($data, 'email')),
            'phone'     => string(data_get($data, 'phone')),
            'language'  => string(data_get($data, 'language')),
            'country'   => string(data_get($data, 'country')),
            'state'     => string(data_get($data, 'state')),
            'city'      => string(data_get($data, 'city')),
            'zip_code'  => string(data_get($data, 'zip_code')),
            'address'   => string(data_get($data, 'address')),
            'pay_type'  => string(data_get($data, 'pay_type')),
            'player_id' => string(data_get($data, 'player_id')),
            'notes'     => string(data_get($data, 'notes')),
        ];

    }
    public function allFields ( array $data = [] ) {

        $fields = [
            'paid'            => bool(data_get($data, 'paid')),
            'status'          => string(data_get($data, 'status')),
            'region_id'       => integer(data_get($data, 'region_id')),
            'platform_id'     => integer(data_get($data, 'platform_id')),
            'gift_code_id'    => integer(data_get($data, 'gift_code_id')),
            'delivery_method' => string(data_get($data, 'delivery_method')),
        ];

        return collect(array_intersect_key($fields, $data))
            ->merge(array_intersect_key($this->fields($data), $data))
            ->filter(fn($v) => !is_null($v))
            ->all();

    }
    public function newOrder ( Product $product, User $user, array $data = [] ) {

        return parent::create([
            ...$this->fields($data),
            'amount'          => positive(data_get($data, 'total_price')),
            'quantity'        => positive(data_get($data, 'quantity')),
            'discount'        => positive(data_get($data, 'discount')),
            'ref_id'          => integer(data_get($data, 'ref_id')),
            'coupon_id'       => integer(data_get($data, 'coupon_id')),
            'coupon_code'     => string(data_get($data, 'coupon_code')),
            'gift_code_id'    => integer(data_get($data, 'gift_code_id')),
            'user_id'         => $user->id,
            'product_id'      => $product->id,
            'cancel_cost'     => $product->cancel_cost,
            'cancel_before'   => $product->cancel_before,
            'refund_before'   => $product->refund_before,
            'region_id'       => $product->region_id,
            'platform_id'     => $product->platform_id,
            'allow_cancel'    => $product->has('allow_cancellations'),
            'allow_refund'    => $product->has('allow_refunds'),
            'allow_pay_later' => $product->has('allow_late_payments'),
            'delivery_method' => string(data_get($data, 'delivery_method', $product->delivery_method)),
            'ip'              => ip(),
            'agent'           => agent(),
        ], strict: false);

    }
    public function generateKey ( Order $order ) {

        do { $secret_key = random_key(); } while ( parent::findBy('secret_key', $secret_key) );

        $order->update(['secret_key' => $secret_key]);
        // $order->newQrcode('secret_key', $secret_key);
        
        return $secret_key;
        
    }
    public function setCompleted ( Order $order ) {

        return parent::update($order->id, [
            'status' => 'completed',
            ...(!$order->completed_at ? ['completed_at' => utc_date()] : []),
        ], strict: false);

    }
    public function setCancelled ( Order $order ) {

        return parent::update($order->id, [
            'status' => 'cancelled',
            ...(!$order->cancelled_at ? ['cancelled_at' => utc_date()] : []),
        ], strict: false);

    }
    public function setRefunded ( Order $order, float $amount ) {

        return parent::update($order->id, [
            'refunded' => true,
            'refunded_amount' => positive($order->refunded_amount) + positive($amount),
            ...(!$order->refunded_at ? ['refunded_at' => utc_date()] : []),
        ], strict: false);

    }
    public function setPaid ( Order $order, float $amount ) {

        app(\App\Services\SettingService::class)->handleCommissions($order->user, ['order', 'referral'], $amount);
        $this->getModel()->deleteCacheTag();

        return parent::update($order->id, [
            'paid' => true,
            'paid_amount' => positive($order->paid_amount) + positive($amount),
            ...(!$order->paid_at ? ['paid_at' => utc_date()] : []),
            ...($order->giftCode ? ['status' => 'completed', ...(!$order->completed_at ? ['completed_at' => utc_date()] : [])] : [])
        ], strict: false);

    }

}
