<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exhibit extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'start_date',
        'end_date',
    ];

    public function artifacts()
    {
        return $this->belongsToMany(Artifact::class, 'artifact_exhibit')->withTimestamps();
    }
}