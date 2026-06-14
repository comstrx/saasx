<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? 'Order Summary' }}</title>
    <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px;background:#f5f7fa;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:6px; overflow:hidden;">
                    
                    <!-- Header Logo -->
                    <tr>
                        <td align="center" style="padding:20px; background:#333;">
                            <img src="{{ asset('storage/' . $logo) }}" alt="Logo" width="140" style="display:block;">
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding:20px; font-size:15px; color:#333333; line-height: 1.5rem;">
                            <p style="font-weight: bolder; font-size: 18px;">Dear {{ $userName ?? 'User' }},</p>
                            <p>{{ 'Your order is currently under review. We are verifying the payment process and the order will be processed soon.' }}</p>
                        </td>
                    </tr>

                    <!-- Order card -->
                    <tr>
                        <td style="padding:0 0 12px 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
                            
                                <!-- Top meta row -->
                                <tr>
                                    <td style="padding:17px 16px;border-bottom:1px solid #eef1f5;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td valign="middle" style="font-size:14px;color:#111111;font-weight:400;">
                                                    <span style="display:inline-block;width:16px;height:16px;background:#ffb400;border-radius:50%;text-align:center;line-height:16px;color:#ffffff;font-weight:700;font-size:12px;margin-right:8px;">✓</span>
                                                    {{ "Order status : " . $order->status ?? 'Pending' }}
                                                </td>
                                                <td style="font-size:13px;color:#000;">
                                                    {{ $order->created_at }}&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;
                                                    {{ $order->secret_key }}&nbsp;&nbsp;&nbsp;
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Product row -->
                                <tr>
                                    <td style="padding:14px 16px;border-bottom:1px solid #eef1f5;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td valign="top" width="64" style="padding-right:12px;">
                                                    <img src="{{ asset('storage/' . $order->product?->getImage()) }}" alt="" width="64" height="64" style="display:block;border-radius:4px;border:1px solid #eef1f5;object-fit:cover;">
                                                </td>
                                                <td valign="top">
                                                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                                        <div>
                                                            <div style="font-size:14px;color:#333;font-weight:700;line-height:1.4;">
                                                                {{ localize($order->product?->name) }}
                                                            </div>
                                                            <div style="margin-top:8px;font-size:15px;color:#374151;">
                                                                {{ $order->product?->totalPrice() }} x {{ $order->quantity }}
                                                            </div>
                                                        </div>
                                                        <div style="margin-top:8px;font-size:18px;color:#000; font-weight: bold; margin-left: 15rem">
                                                            ${{ $order->amount }}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Safety + form fields -->
                                <tr>
                                    <td style="padding:14px 16px;border-bottom:1px solid #eef1f5; line-height: 2rem">
                                        <div style="font-size:14px;color:#059669;font-weight:700;margin-bottom:8px;">
                                            {{ $safetyText ?? 'Games ensures your information safety.' }} &gt;
                                        </div>
                                        <div style="font-size:14px;color:#374151;line-height:1.9;">
                                            UID : {{ $order->player_id ?? '' }}<br>
                                            Do you play this game on PS/Xbox :
                                        </div>
                                    </td>
                                </tr>

                                <!-- Action buttons -->
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <table cellpadding="0" cellspacing="0" border="0" align="right">
                                            <tr>
                                                <td style="padding:0 8px 0 0;">
                                                    <a href="{{ $actionUrl ?? '#' }}" style="display:inline-block;padding:10px 14px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;font-size:13px;color:#374151;background:#ffffff;">Customer Service</a>
                                                </td>
                                                <td>
                                                    <a href="{{ $actionUrl ?? '#' }}" style="display:inline-block;padding:10px 14px;border-radius:6px;text-decoration:none;font-size:13px;color:#111111;background:#ffb400;font-weight:700;">Post Review</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- Order Information card -->
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
                                <tr>
                                    <td style="padding:16px 16px 10px 16px;font-size:16px;color:#111111;font-weight:700;">Order Information</td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:0 16px 16px 16px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;color:#374151; line-height: 1.5rem">
                                            <tr>
                                                <td width="40%" style="padding:8px 0;">Order number :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ $order->secret_key }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;">Order created at :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ $order->created_at }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;">Price :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ $order->amount }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;">Official Discount :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ $order->discount ?? '0.00' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;">Actual payment :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ $order->transaction?->amount ?? '0.00' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:8px 0;">Amount Due :</td>
                                                <td style="padding:8px 0;color:#111111;">{{ '0.00' }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 20px;">
                            <hr style="border:none; border-top:1px solid #eeeeee;">
                        </td>
                    </tr>

                    <!-- Introduction Section -->
                    <tr>
                        <td style="padding:20px; font-size:14px; color:#333;">
                            <strong style="color:#ffb400;">{{ 'Service Introduction' }}</strong>
                            <p>{{ 'Our platform provides various types of transactions with offers and discounts.' }}</p>
                            <ul style="padding-left:20px; color:#555; line-height: 1.5rem">
                                <li>{{ 'Convenient and diverse payment methods available worldwide.' }}</li>
                                <li>{{ 'Multi-layer security protection ensures safe trading.' }}</li>
                            </ul>
                        </td>
                    </tr>

                    <!-- Footer: Company + Socials (SVG data:images) -->
                    <tr>
                        <td style="padding:0 20px 20px 20px; font-size:16px; color:#000; font-weight: bold; line-height: 1.5rem">
                            Inquires
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 20px 20px 20px; font-size:13px; color:#777; line-height: 1.5rem">
                            {{ $name ?? 'Company Ltd.' }} •
                            VAT: {{ $companyVat ?? '—' }} • Reg: {{ $companyReg ?? '—' }} <br>
                            If you encounter any issues, please contact us through the following channels:
                        </td>
                    </tr>
                    <tr>
                        <tr>
                            <td align="center" style="padding:0 20px 20px 20px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                                    <tr>
                                        @foreach(($socials ?? []) as $social)
                                            @php
                                                $socialName = strtolower(trim($social['name'] ?? ''));
                                                $socialUrl  = trim($social['url'] ?? '');
                                                $socialPath = "media/{$socialName}.png";
                                            @endphp

                                            <td align="center" valign="middle" style="padding:0 8px;">
                                                <a href="{{ $socialUrl }}" style="display:inline-block; text-decoration:none;">
                                                    <img src="{{ asset($socialPath) }}" alt="{{ ucfirst($socialName) }}" width="32" height="32" style="display:block; border:0; outline:none;">
                                                </a>
                                            </td>
                                        @endforeach
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
