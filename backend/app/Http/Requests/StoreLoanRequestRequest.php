<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'artifact_id' => 'required|integer|exists:artifacts,id',
            'purpose' => 'required|string|max:500',
            'date_needed' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:date_needed',
        ];
    }
}