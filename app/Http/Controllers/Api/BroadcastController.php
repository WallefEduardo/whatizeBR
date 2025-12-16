<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendBroadcastMessage;
use App\Models\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BroadcastController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Broadcast::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $broadcasts = $query->latest()->get();

        return response()->json(['data' => $broadcasts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'message_type' => 'required|in:text,image,video,document',
            'message_content' => 'required|string',
            'instance_id' => 'required|exists:whatsapp_instances,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $broadcast = Broadcast::create([
            'instance_id' => $request->instance_id,
            'name' => $request->name,
            'message_type' => $request->message_type,
            'message_content' => $request->message_content,
            'filters' => $request->filters ?? [],
            'status' => 'draft',
        ]);

        return response()->json(['data' => $broadcast], 201);
    }

    public function schedule(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $broadcast = Broadcast::findOrFail($id);

        $broadcast->update([
            'scheduled_at' => $request->scheduled_at,
            'status' => 'scheduled',
        ]);

        return response()->json(['data' => $broadcast]);
    }

    public function send(string $id): JsonResponse
    {
        $broadcast = Broadcast::findOrFail($id);

        SendBroadcastMessage::dispatch($broadcast);

        $broadcast->update(['status' => 'processing']);

        return response()->json(['data' => $broadcast]);
    }

    public function cancel(string $id): JsonResponse
    {
        $broadcast = Broadcast::findOrFail($id);

        $broadcast->update(['status' => 'cancelled']);

        return response()->json(['data' => $broadcast]);
    }
}
