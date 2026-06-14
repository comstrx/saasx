<?php

namespace App\Services;
use App\Repositories\EntityRepository;

class EntityService extends BaseService {
   
    public function __construct(
        protected EntityRepository $entityRepository
    ) { parent::__construct($entityRepository); }

    public function assignPermission ( int $id, string $permission = null, array $params = [] ) {

        $entity = $this->find($id);

        [$permissions, $allow, $all, $force] = [
            [...parse(data_get($params, 'permissions')), $permission],
            bool(data_get($params, 'allow')),
            bool(data_get($params, 'all')),
            bool(data_get($params, 'force'))
        ];

        $model = $this->entityRepository->getModel()->setEntity($entity->name);
        $model->assignPermission($all ? $model->allEntityPermissions() : $permissions, $allow, $force);

        return success();

    }

}
