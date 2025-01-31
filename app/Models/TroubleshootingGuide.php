<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TroubleshootingGuide extends Model
{
    protected $fillable = [
        'title',
        'description',
        'solution',
        'image_path',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array'
    ];

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->whereFullText(['title', 'description', 'solution'], $search)
              ->orWhere('title', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhere('solution', 'LIKE', "%{$search}%")
              ->orWhereJsonContains('tags', strtolower($search));
        });
    }
} 