<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display a listing of schedules.
     */
    public function index(Request $request)
    {
        $query = Schedule::with('instance')
            ->latest('scheduled_at');

        // Filter by status
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $schedules = $query->paginate(15);

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'filters' => $request->only(['status', 'type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new schedule.
     */
    public function create()
    {
        return Inertia::render('Schedules/Create');
    }

    /**
     * Store a newly created schedule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'instance_id' => 'required|exists:whatsapp_instances,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:daily,weekly,monthly,once',
            'scheduled_at' => 'required|date|after:now',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string',
            'message_type' => 'required|in:text,image,video,document',
            'message_content' => 'nullable|string',
            'media_url' => 'nullable|url|max:500',
        ]);

        $schedule = Schedule::create($validated);

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Agendamento criado com sucesso!');
    }

    /**
     * Display the specified schedule.
     */
    public function show(Schedule $schedule)
    {
        $schedule->load('instance');

        return Inertia::render('Schedules/Show', [
            'schedule' => $schedule,
        ]);
    }

    /**
     * Show the form for editing the specified schedule.
     */
    public function edit(Schedule $schedule)
    {
        // Only allow editing pending schedules
        if ($schedule->status !== 'pending') {
            return redirect()
                ->route('schedules.index')
                ->with('error', 'Não é possível editar este agendamento.');
        }

        return Inertia::render('Schedules/Edit', [
            'schedule' => $schedule,
        ]);
    }

    /**
     * Update the specified schedule.
     */
    public function update(Request $request, Schedule $schedule)
    {
        // Only allow updating pending schedules
        if ($schedule->status !== 'pending') {
            return redirect()
                ->route('schedules.index')
                ->with('error', 'Não é possível editar este agendamento.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:daily,weekly,monthly,once',
            'scheduled_at' => 'required|date|after:now',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string',
            'message_type' => 'required|in:text,image,video,document',
            'message_content' => 'nullable|string',
            'media_url' => 'nullable|url|max:500',
        ]);

        $schedule->update($validated);

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Agendamento atualizado com sucesso!');
    }

    /**
     * Cancel the specified schedule.
     */
    public function cancel(Schedule $schedule)
    {
        if (!in_array($schedule->status, ['pending', 'processing'])) {
            return redirect()
                ->route('schedules.index')
                ->with('error', 'Não é possível cancelar este agendamento.');
        }

        $schedule->update(['status' => 'cancelled']);

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Agendamento cancelado com sucesso!');
    }

    /**
     * Remove the specified schedule.
     */
    public function destroy(Schedule $schedule)
    {
        // Only allow deleting cancelled or failed schedules
        if (!in_array($schedule->status, ['cancelled', 'failed', 'completed'])) {
            return redirect()
                ->route('schedules.index')
                ->with('error', 'Não é possível deletar este agendamento.');
        }

        $schedule->delete();

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Agendamento deletado com sucesso!');
    }
}
