<?php

namespace App\Http\Controllers;

use App\Models\ChatbotFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatbotFlowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chatbot_id' => 'required|uuid|exists:chatbots,id',
            'name' => 'required|string|max:255',
            'nodes' => 'required|array',
            'edges' => 'required|array',
            'start_node_id' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $flow = ChatbotFlow::create($validated);

        return redirect()->back()->with('success', 'Fluxo criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ChatbotFlow $chatbotFlow)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ChatbotFlow $chatbotFlow)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ChatbotFlow $chatbotFlow)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'nodes' => 'sometimes|array',
            'edges' => 'sometimes|array',
            'start_node_id' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $chatbotFlow->update($validated);

        return redirect()->back()->with('success', 'Fluxo atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChatbotFlow $chatbotFlow)
    {
        // Check if flow has active sessions
        if ($chatbotFlow->sessions()->where('status', 'active')->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Não é possível excluir um fluxo com sessões ativas.',
            ]);
        }

        $chatbotFlow->delete();

        return redirect()->back()->with('success', 'Fluxo excluído com sucesso!');
    }
}
