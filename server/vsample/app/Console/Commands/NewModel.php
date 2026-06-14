<?php

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class NewModel extends Command {

    protected $signature = 'new:model {name} {--fields=} {--options=}';
    protected $description = 'Generate ( Model + Repository + Service + Controller + Resource + Request + Migration )';

    public function dedent ( string $text ) {

        $lines = explode("\n", $text);

        $indents = array_filter(array_map(function ($line) {
            return trim($line) === '' ? null : strlen($line) - strlen(ltrim($line));
        }, $lines));

        $indent = !empty($indents) ? min($indents) : 0;

        $code = implode("\n", array_map(
            fn($line) => preg_match('/^\s*$/', $line) ? '' : substr($line, $indent),
            $lines
        ));

        return trim($code, "\n") . "\n";

    }
    public function generate_options () {

        return collect(explode(';', $this->option('options') ?? ''))
            ->mapWithKeys(function ($opt) {
                [$key, $value] = array_map('trim', explode('=', $opt) + [1 => 'true']);
                return [$key => filter_var($value, FILTER_VALIDATE_BOOLEAN)];
            })->all();

    }
    public function generate_migration () {

        $options = optional($this->generate_options());
        $inputFields = array_filter($this->option('fields') ? explode(';', $this->option('fields')) : []);

        $defaultFields = [
            'store_id:integer:default=0:index',
        ];
        $migrationFieldsMerged =
            collect($defaultFields)->mapWithKeys(fn($f) => [trim(explode(':', $f)[0]) => $f])
            ->union($inputFields)
            ->mapWithKeys(fn($field) => [trim(explode(':', $field)[0]) => $field])
            ->values()
        ->all();

        return collect($migrationFieldsMerged)->map(function ($field) {
            
            $parts = array_map('trim', explode(':', $field));
            $name = trim(array_shift($parts));
            $typeRaw = trim(array_shift($parts));

            preg_match('/^([a-z_]+)(\(([^)]+)\))?$/', $typeRaw, $matches);
            $type = $matches[1] ?? 'string';
            $typeParams = isset($matches[3]) ? explode(',', $matches[3]) : [];

            $modifiers = $parts;
            $enumValues = [];
            $isRequired = false;
            $isNullable = false;
            $default = null;
            $isIndex = false;
            $isUnique = false;

            foreach ( $modifiers as $mod ) {

                $mod = strtolower($mod);

                if ( $mod === 'required' ) $isRequired = true;
                elseif ( $mod === 'nullable' ) $isNullable = true;
                elseif ( $mod === 'index' ) $isIndex = true;
                elseif ( $mod === 'unique' ) $isUnique = true;
                elseif ( str_starts_with($mod, 'default=') )$default = substr($mod, 8);
                elseif ( str_starts_with($mod, 'values=') ) $enumValues = explode(',', trim(substr($mod, 7), '[]{}'));

            }

            if ( $type === 'enum' ) $line = "\$table->enum('{$name}', [" . collect($enumValues)->map(fn($v) => "'{$v}'")->implode(', ') . "])";
            elseif ( $type === 'morph' ) $line = $isNullable ? "\$table->nullableMorphs('{$name}')" : "\$table->morphs('{$name}')";
            elseif ( $type === 'string' ) {
                $precision = $typeParams[0] ?? null;
                if ( isset($precision) ) $line = "\$table->string('{$name}', {$precision})";
                else $line = "\$table->string('{$name}')";
            }
            elseif ( $type === 'decimal' ) {
                [$precision, $scale] = array_pad($typeParams, 2, null);
                if ( isset($precision) && isset($scale) ) $line = "\$table->decimal('{$name}', {$precision}, {$scale})";
                elseif ( isset($precision) ) $line = "\$table->decimal('{$name}', {$precision})";
                else $line = "\$table->decimal('{$name}')";
            }
            else $line = "\$table->{$type}('{$name}')";

            if ( !isset($default) && $isNullable && !$isRequired ) $line .= "->nullable()";
            if ( isset($default) ) $line .= in_array($type, ['boolean']) ? "->default(" . ($default === 'true' ? 'true' : 'false') . ")" : (is_numeric($default) ? "->default({$default})" : "->default('{$default}')");
            if ( $isUnique ) $line .= "->unique()";
            if ( $isIndex ) $line .= "->index()";

            return $line . ';';

        })->filter()->implode("\n                        ");

    }
    public function generate_resource () {
      
        $inputFields    = array_filter($this->option('fields') ? explode(';', $this->option('fields')) : []);
        $options        = $this->generate_options();
        $systemFields   = ['id', 'active', 'created_at', 'updated_at', 'notes'];
        $tinyFields     = [];
        $dataFields     = [];
        $relationFields = [];
        $flags          = [];

        $resourceFields = collect($inputFields)
            ->mapWithKeys(fn($field) => [trim(explode(':', $field)[0]) => $field])
            ->reject(fn($field, $key) => in_array($key, $systemFields))
            ->values()
            ->all();

        collect($resourceFields)->each(function ($field) use (&$tinyFields, &$dataFields, &$relationFields) {
          
            $parts = explode(':', $field);
            $name  = trim($parts[0] ?? '');
            $type  = strtolower(trim($parts[1] ?? 'string'));
            $mods  = $parts;

            if ( collect($mods)->contains(fn($m) => str_contains($m, 'tiny=true')) ) {

                $tinyFields[] = "'{$name}' => \$data->{$name},";

            }
            if ( Str::endsWith($name, '_id') ) {

                $relation = Str::beforeLast($name, '_id');
                $resourceClass = Str::studly($relation) . 'Resource';

                if ($relation === 'parent') {
                    return $relationFields[] = "'parent' => self::info(\$this->parent),";
                } elseif (in_array($relation, ['admin', 'vendor', 'client', 'owner'])) {
                    return $relationFields[] = "'{$relation}' => UserResource::info(\$this->{$relation}),";
                } elseif (class_exists("\App\\Http\\Resources\\{$resourceClass}")) {
                    return $relationFields[] = "'{$relation}' => {$resourceClass}::info(\$this->{$relation}),";
                }

            }
            if ($type === 'morph') {
                return $relationFields[] = "\$this->getRelatedName() => \$this->getRelatedResource(),";
            }
            if (in_array($type, ['date', 'datetime', 'timestamp'])) {
                $dataFields[] = "'{$name}' => \$this->formatDate('{$name}'),";
            }
            else {
                $dataFields[] = "'{$name}' => \$this->{$name},";
            }

        });
        $flagMap = [
            'translation' => true,
            'relations'   => true,
            'image'       => false,
            'files'       => false,
            'qrcode'      => false,
            'qrcodes'     => false,
            'permissions' => false,
        ];
        foreach ( $flagMap as $opt => $default ) {

            if ( array_key_exists($opt, $options) ) {

                $varName = match ($opt) {
                    'image'       => 'hasImage',
                    'files'       => 'hasAttachments',
                    'qrcode'      => 'hasQrcode',
                    'qrcodes'     => 'hasQrcodes',
                    'permissions' => 'hasPermissions',
                    default       => $opt,
                };

                $value = $options[$opt] ? 'true' : 'false';
                $flags[] = "\${$varName} = {$value}";

            }

        }

        return [
            'options'   => !empty($flags) ? "protected bool " . implode(', ', $flags) . ";" : "",
            'tiny'      => implode("\n                        ", $tinyFields),
            'data'      => implode("\n                        ", $dataFields),
            'relations' => implode("\n                        ", $relationFields)
        ];

    }
    public function generate_request ( string $table ) {

        $options = optional($this->generate_options());
        $inputFields = array_filter($this->option('fields') ? explode(';', $this->option('fields')) : []);

        return collect($inputFields)
            ->filter(fn ( $field ) => !str_contains($field, 'request=false'))
            ->mapWithKeys(function ( $field ) {
                $name = trim(explode(':', $field)[0] ?? '');
                $type = strtolower(trim(explode(':', $field)[1] ?? 'string'));
                return [$name => ['field' => $field, 'type' => $type]];
            })
            ->map(function ( $data, $key ) use ( $table ) {
                [$type, $field] = [$data['type'], $data['field']];

                $required = str_contains($field, ':required') && !str_contains($field, 'required=false');
                $unique = str_contains($field, ':unique') && !str_contains($field, 'unique=false');
                
                $values = collect(array_map('trim', explode(':', $field)))->filter(fn($mod ) => str_starts_with($mod, 'values='))->first();
                $values = explode(',', trim(substr($values, 7), '[]{}'));

                $rule = app(\App\Http\Requests\BaseRequest::class)->customRule($table, $key, $type, $required, $unique, $values);
                return "'{$key}' => {$rule},";
            })
        ->implode("\n                        ");

    }
    public function generate_files ( string $table ) {

        $options     = optional($this->generate_options());
        $table       = Str::plural(Str::snake($table));
        $name        = Str::studly(Str::singular($table));
        $model       = $name;
        $resource    = "{$name}Resource";
        $request     = "{$name}Request";
        $controller  = "{$name}Controller";
        $repository  = "{$name}Repository";
        $service     = "{$name}Service";
        $migration   = date('Y_m_d_His') . "_create_{$table}_table";

        File::ensureDirectoryExists(app_path('Models'));
        File::ensureDirectoryExists(app_path('Repositories'));
        File::ensureDirectoryExists(app_path('Services'));
        File::ensureDirectoryExists(app_path('Http/Resources'));
        File::ensureDirectoryExists(app_path('Http/Requests'));
        File::ensureDirectoryExists(app_path('Http/Controllers'));
        File::ensureDirectoryExists(database_path('migrations'));

        if ( File::exists(app_path("Models/{$model}.php")) ) return $this->error("model already exists .");
        if ( File::exists(app_path("Repositories/{$repository}.php")) ) return $this->error("repository already exists .");
        if ( File::exists(app_path("Services/{$service}.php")) ) return $this->error("service already exists .");
        if ( File::exists(app_path("Http/Resources/{$resource}.php")) ) return $this->error("resource already exists .");
        if ( File::exists(app_path("Http/Requests/{$request}.php")) ) return $this->error("request already exists .");
        if ( File::exists(app_path("Http/Controllers/{$controller}.php")) ) return $this->error("controller already exists .");
        if ( File::exists(database_path("migrations/{$migration}.php")) ) return $this->error("migration already exists .");

        $options['model'] !== false && File::put(app_path("Models/{$model}.php"), $this->dedent("
            <?php

            namespace App\Models;
            use Illuminate\Database\Eloquent\Model;
            use App\Traits\Model\HasBaseModel;

            class {$model} extends Model {

                use HasBaseModel;

            }
        "));
        $options['repository'] !== false && File::put(app_path("Repositories/{$repository}.php"), $this->dedent("
            <?php

            namespace App\Repositories;
            use App\Models\\{$model};

            class {$repository} extends BaseRepository {

                public function __construct ( {$model} \$model ) { parent::__construct(\$model); }

            }
        "));
        $options['service'] !== false && File::put(app_path("Services/{$service}.php"), $this->dedent("
            <?php

            namespace App\Services;
            use App\Repositories\\{$repository};

            class {$service} extends BaseService {

                public function __construct ( {$repository} \$" . lcfirst($repository) . " ) {

                    parent::__construct(\$" . lcfirst($repository) . ");

                }

            }
        "));
        $options['controller'] !== false && File::put(app_path("Http/Controllers/{$controller}.php"), $this->dedent("
            <?php

            namespace App\Http\Controllers;
            use Illuminate\Http\Request;" . ($options['request'] !== false ? "
            use App\Http\Requests\\{$request};" : "") . "
            use App\Services\\{$service};

            class {$controller} extends Controller {
                " . ($options['request'] !== false ? "
                protected function requestForm () { return {$request}::class; }
                " : "") . "
                public function __construct ( {$service} \$" . lcfirst($service) . " ) {
                
                    parent::__construct(\$" . lcfirst($service) . ");
                
                }

            }
        "));
        $options['migration'] !== false && File::put(database_path("migrations/{$migration}.php"), $this->dedent("
            <?php

            use Illuminate\Database\Migrations\Migration;
            use Illuminate\Database\Schema\Blueprint;
            use Illuminate\Support\Facades\Schema;

            return new class extends Migration {

                public function up () {

                    Schema::create('$table', function ( Blueprint \$table ) {
                        \$table->id();
                        {$this->generate_migration()}
                        \$table->boolean('processing')->default(false);
                        \$table->boolean('active')->default(true)->index();
                        \$table->timestamps();
                        \$table->softDeletes();
                    });

                }

            };
        "));
        $options['request'] !== false && File::put(app_path("Http/Requests/{$request}.php"), $this->dedent("
            <?php

            namespace App\Http\Requests;

            class {$request} extends BaseRequest {

                public function rules () {

                    return [
                        {$this->generate_request($table)}
                    ];

                }

            }
        "));
        $options['resource'] !== false && File::put(app_path("Http/Resources/{$resource}.php"), $this->dedent("
            <?php

            namespace App\Http\Resources;

            class {$resource} extends BaseResource { " . 
                (empty($this->generate_resource()['options']) ? "" : "

                {$this->generate_resource()['options']}")
                . "
                " .
                (empty($this->generate_resource()['tiny']) ? "" :
                "
                public function tiny ( \$data ) {

                    return [
                        {$this->generate_resource()['tiny']}
                    ];

                }")
                . "
                public function data () {

                    return [
                        {$this->generate_resource()['data']}
                    ];

                }
                public function relations () {

                    return [
                        {$this->generate_resource()['relations']}
                    ];

                }
            
            }
        "));

        return true;

    }
    public function handle () {

        $fileCreated = $this->generate_files($this->argument('name'));
        if ( $fileCreated ) $this->info("✅ {$this->argument('name')} Created Successfuly !");

    }

}

/*

php artisan new:model blablabla \
    --fields="related:morph; name:string:translation=true:tiny=true; code:string:unique; status:enum:values=[valid,invalid,none]; owner_id:integer:default=0; parent_id:integer:default=0" \
    --options="image=true; files=true; timestamp=true; softdelete=true; multitenancy=true; permissions=true; model=true; controller=true; request=true; resource=true; repository=true; service=true; migration=true"

*/
