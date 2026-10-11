<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artifact extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'condition',
        'origin',
        'acquisition_date',
        'image_path',
        'created_by',
    ];

    public function exhibits()
    {
        return $this->belongsToMany(Exhibit::class, 'artifact_exhibit')->withTimestamps();
    }

    public function loanRequests()
    {
        return $this->hasMany(LoanRequest::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}