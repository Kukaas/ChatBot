<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FAQ extends Model
{
    protected $fillable = [
        'title',
        'message',
        'frequency',
        'guide_id'
    ];

    public function guide(): BelongsTo
    {
        return $this->belongsTo(TroubleshootingGuide::class);
    }

    public static function updateFromChatMessages()
    {
        // Get messages with frequency >= 5
        $frequentMessages = ChatMessage::select('title', 'message', 'guide_id')
            ->selectRaw('COUNT(*) as frequency')
            ->where('type', 'user')
            ->groupBy('title', 'message', 'guide_id')
            ->havingRaw('COUNT(*) >= 5')
            ->get();

        foreach ($frequentMessages as $message) {
            self::updateOrCreate(
                ['guide_id' => $message->guide_id],
                [
                    'title' => $message->title,
                    'message' => $message->message,
                    'frequency' => $message->frequency
                ]
            );
        }
    }
} 