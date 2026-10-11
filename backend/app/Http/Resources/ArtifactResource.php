<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArtifactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'condition' => $this->condition,
            'origin' => $this->origin,
            'acquisition_date' => $this->acquisition_date,
            'image_path' => $this->image_path,
            'created_by' => $this->created_by,
            'exhibits' => ExhibitResource::collection($this->whenLoaded('exhibits')),
            'created_at' => $this->created_at,
        ];
    }
}