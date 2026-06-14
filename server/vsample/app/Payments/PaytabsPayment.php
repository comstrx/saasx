<?php

namespace App\Payments;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaytabsPayment {

    // protected function booted () {

    //     $this->config = $this->gatewayRepository->findByName('paytabs', $store_id);
    //     if ( !$this->config ) throwError("invalid gateway");

    //     $headers = ['authorization' => $this->config->server_key, 'Content-Type' => 'application/json'];
    //     $this->client = new Client(['base_uri' => $this->config->api_url, 'headers' => $headers]);

    // }
    // public function deposit ( float $amount, array $options = [] ) : string {

    //     $this->setClient();
    //     $this->setOptions($amount, $options);

    //     try {

    //         $response = $this->client->post("/payment/request", [
    //             'json' => [
    //                 'profile_id'    => $this->config->profile_id,
    //                 "cart_id"       => $this->options['unique_id'],
    //                 "paypage_lang"  => $this->options['language'],
    //                 'cart_amount'   => $this->options['paid_amount'],
    //                 "cart_currency" => $this->options['paid_currency'],
    //                 "return"        => $this->options['redirect_url'],
    //                 "callback"      => "{$this->options['webhook_url']}/payment/paytabs/deposit",
    //                 "tran_type"     => "sale",
    //                 "tran_class"    => "ecom",
    //                 "cart_description" => "description",
    //                 "customer_details" => [
    //                     "name"=> "Coding Master",
    //                     "email"=> "codingmaster@gmail.com",
    //                     "phone"=> "01099188572",
    //                     "street1"=> "talat harb",
    //                     "city"=> "cairo",
    //                     "state"=> "qalubia",
    //                     "country"=> "EG",
    //                     "zip"=> "13713"
    //                 ],
    //                 "shipping_details" => [
    //                     "name"=> "product name",
    //                     "email"=> "codingmaster@gmail.com",
    //                     "phone"=> "01099188572",
    //                     "street1"=> "talat harb",
    //                     "city"=> "cairo",
    //                     "state"=> "qalubia",
    //                     "country"=> "EG",
    //                     "zip"=> "13713"
    //                 ],
    //             ],
    //         ]);

    //         $response = json_decode($response->getBody(), true);
    //         $this->options['reference'] = $response['tran_ref'];
    //         $this->options['pay_url']   = $response['redirect_url'];

    //     } catch ( \Exception $e ) { throwError("failed to process payment"); }

    //     $this->transactionRepository->create($this->options);
    //     return $this->options['pay_url'];

    // }
    // public function verifyWebhook ( Request $req ) : bool {
        
    //     $this->setClient();

    //     $signature = $req->header('signature');
    //     $fields = $req->all();
    //     $fields = array_filter($fields);

    //     ksort($fields);
    //     $computed = hash_hmac('sha256', json_encode($fields), $this->config->server_key);
    //     return hash_equals($computed, $signature);

    // }
    // public function depositWebhook ( Request $req ) : void {

    //     if ( !$this->verifyWebhook( $req ) ) throwError("invalid webhook");

    //     $data = ['reference' => $req->tran_ref, 'completed' => $req->payment_result['response_status'] === 'A'];
    //     logger( $data );

    // }

}
