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
                    'title' => $guide->title,
                    'message' => $message,
                    'type' => 'user',
                    'is_faq' => false,
                    'frequency' => 1,
                    'guide_id' => $guide->id
                ]);

                return response()->json([
                    'guide' => $guide
                ]);
            } else {
                // Check if OpenAI API key is configured
                if (!config('openai.api_key')) {
                    Log::warning('OpenAI API key is not configured');
                    return response()->json([
                        'guide' => null,
                        'error' => 'AI assistance is currently unavailable.'
                    ]);
                }

                try {
                    Log::info('Attempting OpenAI request with API key: ' . substr(config('openai.api_key'), 0, 7) . '...');
                    
                    // No guide found, use AI
                    $response = OpenAI::chat()->create([
                        'model' => 'gpt-3.5-turbo',
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a helpful technical support assistant. Provide clear, step-by-step solutions.'],
                            ['role' => 'user', 'content' => $message],
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 500,
                    ]);

                    // Store user message
                    ChatMessage::create([
                        'session_id' => session()->getId(),
                        'title' => 'User Query',
                        'message' => $message,
                        'type' => 'user',
                        'is_faq' => false,
                        'frequency' => 1,
                    ]);

                    // Store AI response
                    ChatMessage::create([
                        'session_id' => session()->getId(),
                        'title' => 'AI Response',
                        'message' => $response->choices[0]->message->content,
                        'type' => 'ai',
                        'is_faq' => false,
                        'frequency' => 1,
                    ]);

                    return response()->json([
                        'guide' => null,
                        'ai_response' => $response->choices[0]->message->content
                    ]);
                } catch (\Exception $e) {
                    Log::error('OpenAI error: ' . $e->getMessage());
                    return response()->json([
                        'guide' => null,
                        'error' => 'AI service is temporarily unavailable. Please try again later.'
                    ], 200);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error in troubleshoot: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while processing your request.'
            ], 200);
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
        $query = $request->input('query');
        
        if (empty($query)) {
            return response()->json(['suggestions' => []]);
        }

        $guides = TroubleshootingGuide::where(function($q) use ($query) {
            $q->where('title', 'LIKE', "%{$query}%")
              ->orWhere('description', 'LIKE', "%{$query}%")
              ->orWhereJsonContains('tags', strtolower($query));
        })
        ->limit(5)
        ->get(['id', 'title', 'description'])
        ->map(function($guide) {
            return [
                'id' => $guide->id,
                'title' => $guide->title,
                'type' => 'guide',
                'description' => $guide->description
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