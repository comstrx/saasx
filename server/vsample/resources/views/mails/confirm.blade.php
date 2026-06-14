<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? 'Account Notification' }}</title>
</head>
<body style="margin:0; padding:0; background:#f6f6f6; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px; background:#f6f6f6;">
        <tr>
            <td align="center">

                <!-- Container -->
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
                            <p>{{  'Thank you for using our service. Please complete your request by clicking the button below.' }}</p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td align="center" style="padding:20px;">
                            <a href="{{ $actionUrl ?? '#' }}" 
                               style="background:#ffb400; color:#000; padding:16px 30px; font-size:15px; font-weight:bold; text-decoration:none; border-radius:4px; display:inline-block;">
                                {{ $actionText ?? 'Verify the email address' }}
                            </a>
                        </td>
                    </tr>

                    <!-- Fallback link -->
                    <tr>
                        <td style="padding:20px; font-size:16px; color:#666666; word-break:break-all; line-height: 2rem">
                            If the button above doesn't work, copy and paste this URL into your browser:<br>
                            <a href="{{ $actionUrl ?? '#' }}" style="color:#1a73e8;">{{ $actionUrl ?? '#' }}</a>
                        </td>
                    </tr>

                    <!-- Closing -->
                    <tr>
                        <td style="padding:20px; font-size:17px; color:#333; line-height: 1.5rem">
                            Best wishes, <br> Support Team
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
