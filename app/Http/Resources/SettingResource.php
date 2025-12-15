<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'instance_id' => $this->instance_id,
            'key' => $this->key,
            'value' => $this->value,
            'type' => $this->type,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relacionamentos
            'instance' => $this->whenLoaded('instance', function () {
                return [
                    'id' => $this->instance->id,
                    'name' => $this->instance->name,
                    'phone_number' => $this->instance->phone_number,
                ];
            }),
        ];
    }
}
