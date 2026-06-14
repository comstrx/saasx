<?php

namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFactory extends Factory {

    public function definition () {

        return [
            'monthly_old_price'   => 0,
            'yearly_old_price'    => 0,
            'lifetime_old_price'  => 0,
            'monthly_new_price'   => 0,
            'yearly_new_price'    => 0,
            'lifetime_new_price'  => 0,
            'monthly_trial_days'  => 0,
            'yearly_trial_days'   => 0,
            'lifetime_trial_days' => 0,
            'max_subscriptions'   => 1000,
            'currency'            => 'USD',
            'free'                => false,
            'recommended'         => false,
            'popular'             => false,
            'basic'               => false,
            'premium'             => false,
        ];

    }
    public function basic () {

        return $this->state(function (array $attributes) {
            return [
                'free'     => true,
                'basic'    => true,
                'name'     => ['en' => 'Starter', 'ar' => 'مبتدأ'],
                'features' => [
                    'en' => ['Up to 1 store', 'Basic analytics', 'Community support'],
                    'ar' => ['حتى متجر واحد', 'التحليلات الأساسية', 'دعم المجتمع'],
                ],
            ];
        });

    }
    public function pro () {

        return $this->state(function (array $attributes) {
            return [
                'monthly_new_price'   => 20,
                'yearly_new_price'    => 199,
                'lifetime_new_price'  => 399,
                'monthly_trial_days'  => 20,
                'yearly_trial_days'   => 20,
                'lifetime_trial_days' => 20,
                'popular'     => true,
                'recommended' => true,
                'name'        => ['en' => 'Pro', 'ar' => 'محترف'],
                'features'    => [
                    'en' => ['Up to 5 stores', 'Advanced analytics', 'Email support', 'Custom branding'],
                    'ar' => ['ما يصل إلى 5 متاجر', 'التحليلات المتقدمة', 'دعم البريد الإلكتروني', 'العلامات التجارية المخصصة'],
                ],
            ];
        });

    }
    public function premium () {

        return $this->state(function (array $attributes) {
            return [
                'monthly_new_price'   => 99,
                'yearly_new_price'    => 999,
                'lifetime_new_price'  => 4999,
                'monthly_trial_days'  => 20,
                'yearly_trial_days'   => 20,
                'lifetime_trial_days' => 20,
                'premium'  => true,
                'name'     => ['en' => 'Premium', 'ar' => 'متقدم'],
                'features' => [
                    'en' => ['Unlimited stores', 'Full analytics suite', 'Priority support', 'SLA uptime'],
                    'ar' => ['متاجر غير محدودة', 'مجموعة تحليلات كاملة', 'الدعم ذو الأولوية', 'وقت تشغيل اتفاقية مستوى الخدمة'],
                ],
            ];
        });

    }

}
