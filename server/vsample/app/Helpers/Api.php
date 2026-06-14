<?php

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use Vonage\Client as SMSClient;
use Vonage\Client\Credentials\Basic;
use Vonage\SMS\Message\SMS;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use App\Models\User;

function exchange_rate ( string $from, string $to ) {

    try {

        $api_key = 'e56d9853c10a15d2957053fa';
        $response = Http::timeout(5)->get("https://v6.exchangerate-api.com/v6/{$api_key}/latest/{$from}");
        return $response['conversion_rates'][$to] ?? 0;

    } catch (\Exception $e) {}

    return 0;

}
function exchange ( float $amount, string $from, string $to ) {

    $rate = remember("exchange:rate", "{$from}_{$to}", 10, fn() => exchange_rate($from, $to));
    return ['amount' => round(abs($amount) * $rate, 2), 'rate' => $rate];

}
function location ( $address ) {

    try{

        $client = new Client();

        $response = $client->get('https://nominatim.openstreetmap.org/search', [
            'query' => ['q' => $address, 'format' => 'json', 'limit' => 1, 'accept-language' => 'ar'],
            'headers' => ['User-Agent' => 'microtech/1.0 (microtech@gmail.com)'],
        ]);
        $data = json_decode($response->getBody(), true);
        if ( !empty($data) ) return ['longitude' => $data[0]['lon'], 'latitude' => $data[0]['lat']];

    } catch (\Exception $e) {}

    return ['longitude' => '46.6753', 'latitude' => '24.7136'];

}
function send_alert ( $user, $message ) {

    event(new \App\Events\AlertEvent($user, $message));

}
function send_email ( User $user, mixed $message, string $type = null ) {
    
    if ( $type === 'recovery' ) $mailer = new \App\Mail\RecoveryMail($user, $message);
    elseif ( $type === 'confirm' ) $mailer = new \App\Mail\ConfirmMail($user, $message);
    elseif ( $type === 'invoice' ) $mailer = new \App\Mail\InvoiceMail($user, $message);
    elseif ( $type === 'store' ) $mailer = new \App\Mail\StoreMail($user, $message);
    elseif ( $type === 'otp' ) $mailer = new \App\Mail\OtpMail($user, $message);
    elseif ( $type === 'provider' ) $mailer = new \App\Mail\ProviderMail($user, $message);
    else $mailer = new \App\Mail\NotificationMail($user, $message);

    Mail::to($user->email)->queue($mailer);

}
function send_sms ( User $user, string $message ) {

    try{

        $api_key = "7019ef4b";
        $sec_key = "q8SVI6913VMfCyR5";
        $company = env('APP_NAME');
        $basic  = new Basic($api_key, $sec_key);
        $client = new SMSClient($basic);
        $response = $client->sms()->send(new SMS($user->phone, $company, $message));
        
    } catch (\Exception $e) {}

}
function send_whatsapp ( User $user, string $message ) {

    try {

        $instance_id = "instance89613";
        $api_token = "a600sm5p56zzpfawhhh";
        $client = new Client();
        $params = ['token' => $api_token, 'to' => $user->phone, 'body' => $message];
        $options = ['form_params' => $params ];
        $headers = ['Content-Type' => 'application/x-www-form-urlencoded'];
        $request = new Request('POST', "https://api.ultramsg.com/{$instance_id}/messages/chat", $headers);
        $response = $client->sendAsync($request, $options)->wait();

    } catch (\Exception $e) {}
    
}
