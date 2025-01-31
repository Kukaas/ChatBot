<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = [
        'session_id',
        'title',
        'message',
        'type',
        'is_faq',
        'frequency',
        'guide_id'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(TroubleshootingGuide::class);
    }

    public function incrementFrequency()
    {
        $this->increment('frequency');
        
        // Update is_faq if frequency reaches 4
        if ($this->frequency >= 4 && !$this->is_faq) {
            $this->update(['is_faq' => true]);
        }
    }

    public static function recordFAQ($message, $guide)
    {
        // Try to find existing FAQ for this guide
        $existingMessage = self::where('guide_id', $guide->id)
            ->where('type', 'user')
            ->first();

        if ($existingMessage) {
            // If message exists, just increment frequency
            $existingMessage->incrementFrequency();
            return $existingMessage;
        }

        // Create new message if it doesn't exist
        return self::create([
            'session_id' => session()->getId(),
            'title' => $guide->title,
            'message' => $message,
            'type' => 'user',
            'is_faq' => true, // Set to true by default for guide-related messages
            'frequency' => 1,
            'guide_id' => $guide->id
        ]);
    }

    public static function updateFAQStatus()
    {
        // Get messages grouped by guide_id with count >= 5
        $frequentQueries = self::selectRaw('guide_id, COUNT(*) as frequency')
            ->where('type', 'user')
            ->whereNotNull('guide_id')
            ->groupBy('guide_id')
            ->having('frequency', '>=', 5)
            ->get();

        // Update is_faq status for these messages
        foreach ($frequentQueries as $query) {
            self::where('guide_id', $query->guide_id)
                ->where('type', 'user')
                ->update(['is_faq' => true]);
        }
    }
} 