<?php

namespace App\Http\Resources;

class OrderResource extends BaseResource {

    protected bool $hasQrcode = true;

    public function tiny ( $data ) {

        return [
            'name'      => $data->name,
            'paid'      => $data->paid,
            'status'    => $data->status,
            'refunded'  => $data->refunded,
            'deleted'   => $data->deleted,
            'player_id' => $data->player_id,
            'pay_type'  => $data->pay_type,
        ];

    }
    public function data () {

        return [
            'email'            => $this->email,
            'phone'            => $this->phone,
            'language'         => $this->language,
            'currency'         => $this->currency,
            'country'          => $this->country,
            'city'             => $this->city,
            'address'          => $this->address,
            'ip'               => $this->ip,
            'agent'            => $this->agent,
            'cancel_notes'     => $this->cancel_notes,
            'upgrades'         => $this->upgrades,
            'views'            => $this->views,
            'quantity'         => $this->quantity,
            'secret_key'       => $this->secret_key,
            'amount'           => $this->amount,
            'paid_amount'      => $this->paid_amount,
            'remaining_amount' => $this->remainingAmount(),
            'refunded_amount'  => $this->refunded_amount,
            'supplier_earning' => $this->supplier_earning,
            'net_profit'       => $this->net_profit,
            'discount'         => $this->discount,
            'coupon_code'      => $this->coupon_code,
            'cancel_cost'      => $this->cancel_cost,
            'delivery_method'  => $this->delivery_method,
            'allow_cancel'     => $this->allow_cancel,
            'allow_refund'     => $this->allow_refund,
            'allow_pay_later'  => $this->allow_pay_later,
            'cancel_before'    => $this->formatDate('cancel_before'),
            'refund_before'    => $this->formatDate('refund_before'),
            'cancelled_at'     => $this->formatDate('cancelled_at'),
            'completed_at'     => $this->formatDate('completed_at'),
            'paid_at'          => $this->formatDate('paid_at'),
        ];

    }
    public function relations () {

        return [
            'user'        => UserResource::info( $this->user ),
            'coupon'      => CouponResource::info( $this->coupon ),
            'product'     => ProductResource::info( $this->product ),
            'region'      => RegionResource::info( $this->region ),
            'platform'    => PlatformResource::info( $this->platform ),
            'transaction' => TransactionResource::info( $this->transaction ),
            'reviews'     => $this->reviewsCount(),
            'has_gift_code' => !!$this->giftCode,
            'gift_code'     => is_admin() ?
                GiftCodeResource::info($this->giftCode) :
                ( $this->created_at >= now()->subHours(12) ? $this->giftCode?->code : null )
        ];

    }

}
