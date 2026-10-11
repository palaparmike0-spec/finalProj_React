<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'artifact_id',
        'user_id',
        'purpose',
        'date_needed',
        'return_date',
        'status',
        'admin_remarks',
    ];

    public function artifact()
    {
        return $this->belongsTo(Artifact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}