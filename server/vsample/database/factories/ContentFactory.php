<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContentFactory extends Factory {

    public function definition () {

        return [
            'store_id'    => 1,
            'title'       => ['en' => $this->faker->sentence(3), 'ar' => $this->faker->sentence(3)],
            'content'     => ['en' => $this->faker->paragraph(5), 'ar' => $this->faker->paragraph(5)],
            'description' => ['en' => $this->faker->paragraph(2), 'ar' => $this->faker->paragraph(2)],
        ];

    }
    public function banner ( string $key = 'banner', string $page = 'home', string $location = 'top' ) {

        return $this->state(fn () => [
            'type'     => 'banner',
            'key'      => $key,
            'page'     => $page,
            'location' => $location,
            'url'      => $this->faker->url(),
        ]);

    }
    public function slider ( string $key = 'slider', string $page = 'home', string $location = 'top' ) {

        return $this->state(fn () => [
            'type'     => 'slider',
            'key'      => $key,
            'page'     => $page,
            'location' => $location,
        ]);

    }
    public function page ( string $page, string $location = 'center' ) {

        $pages = [
            'about' => '
                <h1>About Our Company</h1>
                <p>We are a global technology company focused on building modern SaaS platforms that help businesses scale faster and smarter.</p>

                <h2>Our Mission</h2>
                <p>To empower organizations by providing cutting-edge tools that simplify workflows and maximize efficiency.</p>

                <h2>Our Story</h2>
                <p>Founded in 2020, we started as a small team of engineers and designers with a shared vision. Today, we proudly serve thousands of clients worldwide.</p>

                <h2>Watch Our Journey</h2>
                <div style="margin:20px 0;">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Company Journey Video" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>

                <h2>Learn More</h2>
                <p>Check our <a href="/careers">Careers</a> page to join our growing team.</p>

                <img src="https://via.placeholder.com/800x400" alt="Our Office" style="width:100%;border-radius:8px;margin-top:15px;">
            ',
            'policy' => '
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to us. This policy outlines how we handle your data responsibly.</p>

                <h2>Information We Collect</h2>
                <ul>
                    <li>Account details (name, email, phone number)</li>
                    <li>Billing and payment information</li>
                    <li>Usage statistics and device information</li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>We use your information to deliver services, improve user experience, and send important updates.</p>

                <h2>Third-Party Services</h2>
                <p>We may integrate with trusted partners such as <a href="https://stripe.com" target="_blank">Stripe</a> and <a href="https://firebase.google.com" target="_blank">Firebase</a> for payments and analytics.</p>

                <h2>Contact Us</h2>
                <p>If you have questions, please email us at <a href="mailto:support@example.com">support@example.com</a>.</p>
            ',
            'faq' => '
                <h1>FAQ</h1>

                <h2>1. How can I create an account?</h2>
                <p>Simply visit the <a href="/register">registration page</a> and fill in the required details. You will receive a confirmation email within minutes.</p>

                <h2>2. What payment methods are supported?</h2>
                <p>We accept major credit cards, PayPal, and bank transfers. For enterprise customers, we also support invoicing.</p>

                <h2>3. How do I contact customer support?</h2>
                <p>You can reach us via live chat on our website or by emailing <a href="mailto:support@example.com">support@example.com</a>. Our support team is available 24/7.</p>

                <h2>4. Do you offer refunds?</h2>
                <p>Yes. If you are not satisfied within the first 14 days, you can request a full refund through your account dashboard.</p>

                <h2>5. Where can I find tutorials?</h2>
                <p>Check out our <a href="/docs">documentation</a> and <a href="https://www.youtube.com/channel/UC123456789">YouTube channel</a> for step-by-step guides.</p>

                <img src="https://via.placeholder.com/700x300" alt="Help Center" style="width:100%;margin-top:15px;border-radius:6px;">
            ',
        ];
        return $this->state(fn () => [
            'type'     => 'page',
            'key'      => 'content',
            'page'     => $page,
            'location' => $location,
            'title'    => [
                'en' => ucfirst($page),
                'ar' => $page === 'about' ? 'من نحن' : ($page === 'policy' ? 'السياسة' : 'الأسئلة الشائعة'),
            ],
            'content'  => [
                'en' => $pages[$page] ?? [],
                'ar' => $pages[$page] ?? [],
                'fr' => $pages[$page] ?? [],
            ]
        ]);

    }

}
