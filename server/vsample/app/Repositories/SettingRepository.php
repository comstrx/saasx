<?php

namespace App\Repositories;
use App\Models\Setting;
use App\Models\User;

class SettingRepository extends BaseRepository {

    public function __construct( Setting $model ) { parent::__construct($model); }

    public function findSetting ( string $key, string $group = null ) {

        return $this->query()
            ->where('key', $key)
            ->when($group, fn($q) => $q->where('group', $group))
            ->active()
            ->latest()
            ->first();

    }
    public function getKey ( Setting $setting ) {

        return (string) $setting->key;

    }
    public function getValue ( Setting $setting, bool $object = false ) {

        $value = (array) $setting->json_value;
        return $object ? optional((object) $value) : $value;

    }
    public function setValue ( Setting $setting, string $key, string $value = null ) {

        $value = [...$this->getValue($setting), $key => $value];
        $setting->update(['json_value' => $value]);
        return $value;

    }
    public function setNewUsage ( Setting $setting ) {

        $usages = integer(data_get($this->getValue($setting), 'max_usages'));
        $this->setValue($setting, 'max_usages', positive($usages - 1));

    }
    public function validateCommission ( Setting $setting, User $user, float $amount = null ) {

        $value = $this->getValue($setting, true);

        if (
            !$user?->active ||
            !$user?->has('allow_commissions') ||
            $value->max_usages <= 0 ||
            ($value->min_level && $user->level < $value->min_level) ||
            ($value->max_level && $user->level > $value->max_level) ||
            ($value->min_price && $amount && $amount < $value->min_price) ||
            ($value->max_price && $amount && $amount > $value->max_price)
        ) return false;

        return true;

    }
    public function commissionContext ( Setting $setting, float $amount = null ) {

        $key   = $this->getKey($setting);
        $value = $this->getValue($setting, true);

        $isFixed = $value->amount_type === 'fixed';
        $perUnit = $value->scope === 'unit';
        $balance = string($value->balance ?? 'buy');
        $type    = string($value->type);
      
        $ValPoints  = positive($value->points);
        $valAmount  = positive($value->amount);
        $maxAmount  = positive($value->max_amount);
        $maxPoints  = positive($value->max_points);
        $mainAmount = positive($amount);

        $amount = positive($isFixed ? $valAmount : $mainAmount * $valAmount / 100);
        $amount = positive($perUnit ? $amount * $mainAmount : $amount);
        $points = floor($perUnit ? $ValPoints * $mainAmount : $ValPoints);

        $amount = $maxAmount ? min($maxAmount, $amount) : $amount;
        $points = $maxPoints ? min($maxPoints, $points) : $points;

        return [
            ...$this->getValue($setting),
            'reward_amount' => $amount,
            'reward_points' => $points,
            'balance'       => $balance,
            'type'          => $type,
            'key'           => $key,
        ];

    }

}
