<?php

namespace App\Http\Controllers;

use App\Models\TroubleshootingGuide;
use App\Models\ChatMessage;
use App\Models\FAQ;
use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function troubleshoot(Request $request)
    {
        try {
            $message = $request->input('message');
            
            // Search for matching guide
            $guide = TroubleshootingGuide::where(function($query) use ($message) {
                $query->whereJsonContains('tags', strtolower($message))
                      ->orWhere('title', 'like', "%{$message}%")
                      ->orWhere('description', 'like', "%{$message}%");
            })->first();

            if ($guide) {
                // Store user message with guide reference
                ChatMessage::create([
                    'session_id' => session()->getId(),
                    'title' => $guide->title, // Use guide title for consistency
                    'message' => $message,
                    'type' => 'user',
                    'is_faq' => false,
                    'frequency' => 1,
                    'guide_id' => $guide->id
                ]);

                // Store bot response
                ChatMessage::create([
                    'session_id' => session()->getId(),
                    'title' => $guide->title,
                    'message' => $guide->solution,
                    'type' => 'bot',
                    'is_faq' => false,
                    'frequency' => 1,
                    'guide_id' => $guide->id
                ]);

                // Update FAQ status based on frequency
                ChatMessage::updateFAQStatus();
            } else {
                // Store user message without guide
                ChatMessage::create([
                    'session_id' => session()->getId(),
                    'title' => $message,
                    'message' => $message,
                    'type' => 'user',
                    'is_faq' => false,
                    'frequency' => 1,
                    'guide_id' => null
                ]);
            }

            return response()->json(['guide' => $guide]);
        } catch (\Exception $e) {
            Log::error('Troubleshoot error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    public function ai(Request $request)
    {
        try {
            $message = $request->input('message');

            if (!config('openai.api_key')) {
                // Store AI unavailable message
                ChatMessage::create([
                    'session_id' => session()->getId(),
                    'title' => 'AI Unavailable',
                    'message' => 'I apologize, but the AI assistant is not configured. Please contact support for help.',
                    'type' => 'bot',
                    'is_faq' => false,
                    'frequency' => 1,
                    'guide_id' => null
                ]);

                return response()->json([
                    'message' => 'I apologize, but the AI assistant is not configured. Please contact support for help.',
                ]);
            }

            $response = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful technical support assistant.'],
                    ['role' => 'user', 'content' => $message],
                ],
            ]);

            // Store AI response
            ChatMessage::create([
                'session_id' => session()->getId(),
                'title' => 'AI Response',
                'message' => $response->choices[0]->message->content,
                'type' => 'ai',
                'is_faq' => false,
                'frequency' => 1,
                'guide_id' => null
            ]);

            return response()->json([
                'message' => $response->choices[0]->message->content,
            ]);
        } catch (\Exception $e) {
            Log::error('AI error: ' . $e->getMessage());
            
            // Store error message
            ChatMessage::create([
                'session_id' => session()->getId(),
                'title' => 'Error',
                'message' => 'I apologize, but I am unable to process your request at the moment. Please try again later.',
                'type' => 'bot',
                'is_faq' => false,
                'frequency' => 1,
                'guide_id' => null
            ]);

            return response()->json([
                'message' => 'I apologize, but I am unable to process your request at the moment. Please try again later.'
            ]);
        }
    }

    public function suggestions(Request $request)
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return response()->json(['suggestions' => []]);
        }

        $guides = TroubleshootingGuide::search($query)
            ->limit(5)
            ->get(['id', 'title', 'description', 'solution'])
            ->map(function($guide) {
                return [
                    'id' => $guide->id,
                    'title' => $guide->title,
                    'type' => 'guide',
                    'solution' => $guide->solution
                ];
            });

        return response()->json(['suggestions' => $guides]);
    }

    public function topFAQs()
    {
        try {
            // Get frequently asked questions
            $faqs = ChatMessage::where('type', 'user')
                ->where('is_faq', true)
                ->whereNotNull('guide_id')
                ->select('guide_id', 'title')
                ->selectRaw('COUNT(*) as frequency')
                ->groupBy('guide_id', 'title')
                ->orderByDesc('frequency')
                ->limit(5)
                ->get()
                ->map(function($message) {
                    return [
                        'id' => $message->guide_id,
                        'title' => $message->title,
                        'type' => 'guide',
                        'frequency' => $message->frequency
                    ];
                });

            // If no FAQs yet, return default guides
            if ($faqs->isEmpty()) {
                $faqs = TroubleshootingGuide::limit(5)
                    ->get(['id', 'title'])
                    ->map(function($guide) {
                        return [
                            'id' => $guide->id,
                            'title' => $guide->title,
                            'type' => 'guide',
                            'frequency' => 0
                        ];
                    });
            }

            return response()->json(['faqs' => $faqs]);
        } catch (\Exception $e) {
            Log::error('Top FAQs error: ' . $e->getMessage());
            return response()->json(['faqs' => []], 200);
        }
    }
} 