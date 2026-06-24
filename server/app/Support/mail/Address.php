<?php

declare(strict_types=1);

namespace App\Support\Mail;
use Illuminate\Mail\Mailables\Address as MailAddress;

class Address {

    public function __construct (
        public readonly string $email,
        public readonly ?string $name = null
    ) {}

    public static function make ( string $email, ?string $name = null ): self {

        return new self($email, $name);

    }
    public function toMail (): MailAddress {

        return new MailAddress($this->email, $this->name);

    }
    public static function cast ( string|self $address ): MailAddress {

        return $address instanceof self ? $address->toMail() : new MailAddress($address);

    }

}
