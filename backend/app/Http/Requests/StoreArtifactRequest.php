<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArtifactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role check is done by the admin middleware
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'condition' => 'required|in:Excellent,Good,Fair,Poor',
            'origin' => 'nullable|string|max:255',
            'acquisition_date' => 'nullable|date|before_or_equal:today',
        ];
    }
}