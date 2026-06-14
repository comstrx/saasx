<?php

namespace App\Payments;
use Illuminate\Http\Request;
use Stripe\Webhook;

class StripePayment extends BasePayment {

    protected function booted () {

        $this->setClient(['Authorization' => "Bearer {$this->config->credential('secret_key')}"]);

    }
    public function depositRequest () {

        $response = $this->sendRequest('POST', '/v1/payment_intents', [
            'form_params' => [
                'amount'      => (int) ($this->get('paid_amount') * 100),
                'currency'    => strtolower($this->get('paid_currency')),
                'description' => $this->get('description'),
                'metadata'    => [ 'reference' => $this->get('unique_id') ],
            ]
        ]);

        $this->set('reference', data_get($response, 'id'));

        $this->set('pay_data', [
            'client_secret' => data_get($response, 'client_secret'),
            'amount'        => float(integer(data_get($response, 'amount')) / 100, 2),
            'currency'      => strtoupper(data_get($response, 'currency') ?? 'USD'),
        ]);

    }
    public function withdrawRequest () {

        $response = $this->sendRequest('POST', '/v1/payouts', [
            'form_params' => [
                'amount'      => (int) ($this->get('paid_amount') * 100),
                'currency'    => strtolower($this->get('paid_currency')),
                'metadata'    => [ 'reference' => $this->get('unique_id') ],
                'destination' => $this->get('recipient.id'),
            ]
        ]);

        if ( !data_get($response, 'id') ) throwError('withdraw', 'cannot create payout');
        $this->set('reference', data_get($response, 'id'));

    }
    public function refundRequest () {

        $response = $this->sendRequest('POST', '/v1/refunds', [
            'form_params' => [
                'payment_intent' => $this->get('reference'),
                'amount'         => (int) ($this->get('paid_amount') * 100),
                'metadata'       => [ 'reason' => $this->get('description') ],
            ]
        ]);

        if ( !data_get($response, 'id') ) throwError('refund', 'cannot create refund');
        $this->set('reference', data_get($response, 'id'));

    }
    public function verifyWebhook ( Request $req ) {

        $secret    = $this->config->webhook_secret('deposit');
        $payload   = $req->getContent();
        $sigHeader = $req->header('Stripe-Signature');

        try { return Webhook::constructEvent($payload, $sigHeader, $secret); }
        catch ( \Exception $e ) {}

    }
    public function depositWebhook ( Request $req ) {

        if ( !$event = $this->verifyWebhook($req) ) throwError('webhook', 'invalid webhook');
        if ( $event->type !== 'payment_intent.succeeded' ) throwError('event', 'invalid event');

        $this->paymentRepository->depositWebhook([
            'status'        => true,
            'reference'     => $event->data->object->id,
            'paid_currency' => strtoupper($event->data->object->currency),
            'paid_amount'   => $event->data->object->amount_received / 100,
            'recipient'     => ['email' => $event->data->object->receipt_email],
        ]);

    }

}
