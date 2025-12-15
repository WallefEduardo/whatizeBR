<?php

namespace App\Http\Controllers;

use App\Models\Chatbot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $chatbots = Chatbot::with(['instance', 'flows'])
            ->withCount(['flows', 'sessions'])
            ->byPriority()
            ->get();

        $instances = \App\Models\WhatsAppInstance::all(['id', 'name']);

        return Inertia::render('Chatbots/Index', [
            'chatbots' => $chatbots,
            'instances' => $instances,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|in:keyword,always,business_hours,custom',
            'trigger_value' => 'nullable|string|max:255',
            'instance_id' => 'nullable|exists:whatsapp_instances,id',
            'priority' => 'integer|min:0|max:100',
        ]);

        // Chatbot starts as inactive by default (will be activated when connected to instance)
        Chatbot::create([
            ...$validated,
            'is_active' => false,
        ]);

        return redirect()->route('chatbots.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Chatbot $chatbot)
    {
        $chatbot->load(['instance', 'flows', 'sessions']);

        return Inertia::render('Chatbots/Show', [
            'chatbot' => $chatbot,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Chatbot $chatbot)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'sometimes|in:keyword,always,business_hours,custom',
            'trigger_value' => 'nullable|string|max:255',
            'instance_id' => 'nullable|exists:whatsapp_instances,id',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0|max:100',
        ]);

        // If trying to activate, ensure it's connected to an instance
        if (isset($validated['is_active']) && $validated['is_active'] && !$chatbot->canActivate()) {
            return redirect()->back()->withErrors([
                'error' => 'O chatbot precisa estar conectado a uma instância e ter pelo menos um fluxo para ser ativado.',
            ]);
        }

        $chatbot->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chatbot $chatbot)
    {
        // Check if chatbot has active sessions
        if ($chatbot->sessions()->where('status', 'active')->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Não é possível excluir um chatbot com sessões ativas.',
            ]);
        }

        $chatbot->delete();

        return redirect()->back();
    }

    /**
     * Show the flow builder for the chatbot.
     */
    public function builder(Chatbot $chatbot)
    {
        $flow = $chatbot->flows()->first();

        return Inertia::render('Chatbots/Builder', [
            'chatbot' => $chatbot,
            'flow' => $flow,
        ]);
    }

    /**
     * Toggle the active status of the chatbot.
     */
    public function toggle(Chatbot $chatbot)
    {
        // If trying to activate, ensure it's connected to an instance
        if (!$chatbot->is_active && !$chatbot->canActivate()) {
            return redirect()->back()->withErrors([
                'error' => 'O chatbot precisa estar conectado a uma instância e ter pelo menos um fluxo para ser ativado.',
            ]);
        }

        $chatbot->update([
            'is_active' => !$chatbot->is_active,
        ]);

        return redirect()->back();
    }
}
