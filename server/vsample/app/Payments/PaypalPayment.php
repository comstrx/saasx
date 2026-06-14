<?php

namespace App\Payments;
use Illuminate\Http\Request;

class PaypalPayment extends BasePayment {
    
    protected function booted () {

        $basic = base64_encode("{$this->config->credential('client_id')}:{$this->config->credential('client_secret')}");

        $response = $this->sendRequest('POST', '/v1/oauth2/token', [
            'headers' => ['Authorization' => "Basic {$basic}", 'Content-Type' => 'application/x-www-form-urlencoded'],
            'form_params' => ['grant_type' => 'client_credentials'],
        ]);

        if ( !data_get($response, 'access_token') ) throwError("credentials", 'invalid credentials');
        $this->setClient(['Authorization' => "Bearer {$response['access_token']}"]);

    }
    public function depositRequest () {

        $response = $this->sendRequest('POST', '/v2/checkout/orders', [
            'json' => [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'amount' => [
                            'value' => $this->get('paid_amount'),
                            'currency_code' => $this->get('paid_currency'),
                        ],
                    ],
                ],
                'application_context' => [
                    'return_url' => $this->get('redirect_url'),
                    'cancel_url' => $this->get('failed_url'),
                ],
            ]
        ]);

        $this->set('reference', data_get($response, 'id'));
        
        $this->set('pay_data', [
            'pay_url' => collect($response['links'])->where('rel', 'approve')->first()['href'] ?? null,
        ]);

    }
    public function withdrawRequest () {

        $response = $this->sendRequest('POST', "/v1/payments/payouts", [
            'json' => [
                'sender_batch_header' => [
                    'sender_batch_id' => $this->get('unique_id'),
                    'email_subject' => 'You have a payout',
                ],
                'items' => [
                    [
                        'recipient_type' => 'EMAIL',
                        'amount' => [
                            'value' => $this->get('paid_amount'),
                            'currency' => $this->get('paid_currency'),
                        ],
                        'receiver' => $this->get('recipient.email'),
                        'sender_item_id' => $this->get('unique_id'),
                        'note' => $this->get('description'),
                    ],
                ],
            ]
        ]);

        $this->set('reference', data_get($response, 'batch_header.payout_batch_id'));

    }
    public function refundRequest () {

        $response = $this->sendRequest('POST', "/v2/payments/captures/{$this->get('reference')}/refund", [
            'json' => [
                'amount' => [
                    'value' => $this->get('paid_amount'),
                    'currency_code' => $this->get('paid_currency'),
                ],
                'note_to_payer' => $this->get('description'),
            ]
        ]);

        $this->set('reference', data_get($response, 'id'));

    }
    public function verifyWebhook ( string $event, string $reference ) {
        
        $this->setConfig( $this->paymentRepository->findTransaction($reference ?? '')->store_id ?? 0 );

        $response = $this->sendRequest('POST', '/v1/notifications/verify-webhook-signature', [
            'json' => [
                'transmission_id' => request()->header('PayPal-Transmission-Id'),
                'transmission_time' => request()->header('PayPal-Transmission-Time'),
                'transmission_sig' => request()->header('PayPal-Transmission-Sig'),
                'cert_url' => request()->header('PayPal-Cert-Url'),
                'auth_algo' => request()->header('PayPal-Auth-Algo'),
                'webhook_event' => request()->all(),
                'webhook_id' => $this->config->webhook_id($event),
            ],
        ]);

        return true;
        return data_get($response, 'verification_status') === 'SUCCESS';

    }
    public function depositWebhook ( Request $req ) {

        if ( !$this->verifyWebhook('deposit', $req->resource['id'] ?? null) ) throwError('webhook', 'invalid deposit webhook');

        $response = $this->sendRequest('POST', "/v2/checkout/orders/{$req->resource['id']}/capture");
        if ( !$response ) throwError('capture', 'cannot capture order');

        $this->paymentRepository->depositWebhook([
            'reference'     => data_get($response, 'id'),
            'status'        => data_get($response, 'status') === 'COMPLETED',
            'new_reference' => data_get($response, 'purchase_units.0.payments.captures.0.id'),
            'paid_currency' => data_get($response, 'purchase_units.0.payments.captures.0.amount.currency_code'),
            'paid_amount'   => data_get($response, 'purchase_units.0.payments.captures.0.amount.value'),
            'net_amount'    => data_get($response, 'purchase_units.0.payments.captures.0.seller_receivable_breakdown.net_amount.value'),
            'fee_amount'    => data_get($response, 'purchase_units.0.payments.captures.0.seller_receivable_breakdown.paypal_fee.value'),
        ]);
       
    }
    public function withdrawWebhook ( Request $req ) {

        if ( !$this->verifyWebhook('withdraw', $req->resource['payout_batch_id'] ?? null) ) throwError('webhook', 'invalid withdraw webhook');

        $this->paymentRepository->withdrawWebhook([
            'reference'     => data_get($req->resource, 'payout_batch_id'),
            'status'        => data_get($req->resource, 'transaction_status') === 'SUCCESS',
            'new_reference' => data_get($req->resource, 'transaction_id'),
            'paid_currency' => data_get($req->resource, 'payout_item.amount.currency'),
            'paid_amount'   => data_get($req->resource, 'payout_item.amount.value'),
            'fee_amount'    => data_get($req->resource, 'payout_item_fee.value'),
            'recipient'     => ['email' => data_get($req->resource, 'payout_item.receiver')],
        ]);
       
    }
    public function refundWebhook ( Request $req ) {

        if ( !$this->verifyWebhook('refund', $req->resource['id'] ?? null) ) throwError('webhook', 'invalid refund webhook');

        $this->paymentRepository->refundWebhook([
            'reference'     => data_get($req->resource, 'id'),
            'status'        => data_get($req->resource, 'status') === 'COMPLETED',
            'paid_currency' => data_get($req->resource, 'amount.currency_code'),
            'paid_amount'   => data_get($req->resource, 'amount.value'),
            'fee_amount'    => data_get($req->resource, 'seller_payable_breakdown.paypal_fee.value'),
            'recipient'     => ['email' => data_get($req->resource, 'payer.email_address')],
        ]);

    }

}
