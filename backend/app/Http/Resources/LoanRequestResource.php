<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'artifact_id' => $this->artifact_id,
            'user_id' => $this->user_id,
            'purpose' => $this->purpose,
            'date_needed' => $this->date_needed,
            'return_date' => $this->return_date,
            'status' => $this->status,
            'admin_remarks' => $this->admin_remarks,
            'artifact' => $this->whenLoaded('artifact', fn () => [
                'id' => $this->artifact->id,
                'name' => $this->artifact->name,
                'category' => $this->artifact->category,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}