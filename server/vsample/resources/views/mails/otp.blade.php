<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? 'Your verification code' }}</title>
    <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;">

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Your OTP is {{ $code }} (expires in {{ $expiresIn ?? 5 }} minutes).
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px;background:#f6f6f6;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                
                    <!-- Header Logo -->
                    <tr>
                        <td align="center" style="padding:20px; background:#333;">
                            <img src="{{ asset('storage/' . $logo) }}" alt="Logo" width="140" style="display:block;">
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding:20px; font-size:15px; color:#333333; line-height: 1.1rem;">
                            <p style="font-weight: bolder; font-size: 18px;">Dear {{ $userName ?? 'User' }},</p>
                            <p>{{ $intro ?? 'Your verification otp code bellow, please use it to continue your process' }}</p>
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td align="center" style="padding:16px 24px 0 24px;">
                            <h1 style="margin:0;font-size:20px;color:#111;">Verification Code</h1>
                            <p style="margin:15px 0 0 0;font-size:14px;color:#555; width: 20rem; line-height: 1.5rem">
                                Please, use this code bellow to continue.
                            </p>
                        </td>
                    </tr>

                    <!-- OTP boxes -->
                    @php
                        $otpVal = (string)($otp ?? $code ?? '000000');
                        $digits = str_split($otpVal);
                    @endphp

                    <tr>
                        <td align="center" style="padding:20px 24px 20px 24px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                @foreach($digits as $d)
                                    <td align="center" valign="middle"
                                        style="width:56px;height:56px;border:1px solid #e5e7eb;border-radius:8px;
                                                font-size:22px;font-weight:700;color:#111;background:#fff;margin:0 6px;"
                                        >
                                        {{ $d }}
                                    </td>
                                    <td style="width:8px;"></td>
                                @endforeach
                            </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Expiry + security note -->
                    <tr>
                        <td align="center" style="padding:0 24px 0 24px;font-size:15px;color:#666; width: 20rem;">
                            <div style="padding:0 24px 20px 24px;font-size:15px;color:#666; width: 25rem; line-height:1.5rem">
                                This code : <span><strong>{{ $otpVal }}</strong></span> expires in <strong>{{ $expiresIn }}</strong> minutes.
                                If you didn't request it, please ignore this email.
                            </div>
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
