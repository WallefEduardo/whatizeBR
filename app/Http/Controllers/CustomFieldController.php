<?php

namespace App\Http\Controllers;

use App\Models\CustomField;
use App\Models\WhatsAppInstance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomFieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get user's first instance (or you can filter by request)
        $instance = auth()->user()->whatsappInstances()->first();

        if (!$instance) {
            return Inertia::render('CustomFields/Index', [
                'customFields' => [],
                'fieldTypes' => $this->getFieldTypes(),
            ]);
        }

        $customFields = CustomField::forInstance($instance->id)
            ->ordered()
            ->get();

        return Inertia::render('CustomFields/Index', [
            'customFields' => $customFields,
            'fieldTypes' => $this->getFieldTypes(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CustomFields/Create', [
            'fieldTypes' => $this->getFieldTypes(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $instance = auth()->user()->whatsappInstances()->first();

        if (!$instance) {
            return back()->withErrors(['error' => 'Você precisa ter uma instância do WhatsApp configurada.']);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'field_type' => ['required', 'in:text,number,date,select,checkbox,textarea'],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
            'is_required' => ['boolean'],
            'order_index' => ['integer', 'min:0'],
        ]);

        // Validate options for select type
        if ($validated['field_type'] === 'select') {
            if (!isset($validated['options']) || count($validated['options']) === 0) {
                return back()->withErrors(['options' => 'Campos do tipo "Select" precisam ter pelo menos uma opção.']);
            }
        }

        $customField = CustomField::create([
            'instance_id' => $instance->id,
            'name' => $validated['name'],
            'field_type' => $validated['field_type'],
            'options' => $validated['options'] ?? null,
            'is_required' => $validated['is_required'] ?? false,
            'order_index' => $validated['order_index'] ?? 0,
        ]);

        return redirect()
            ->route('custom-fields.index')
            ->with('success', 'Campo personalizado criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(CustomField $customField)
    {
        $this->authorize('view', $customField);

        return Inertia::render('CustomFields/Show', [
            'customField' => $customField,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CustomField $customField)
    {
        $this->authorize('update', $customField);

        return Inertia::render('CustomFields/Edit', [
            'customField' => $customField,
            'fieldTypes' => $this->getFieldTypes(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CustomField $customField)
    {
        $this->authorize('update', $customField);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'field_type' => ['required', 'in:text,number,date,select,checkbox,textarea'],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
            'is_required' => ['boolean'],
            'order_index' => ['integer', 'min:0'],
        ]);

        // Validate options for select type
        if ($validated['field_type'] === 'select') {
            if (!isset($validated['options']) || count($validated['options']) === 0) {
                return back()->withErrors(['options' => 'Campos do tipo "Select" precisam ter pelo menos uma opção.']);
            }
        }

        $customField->update($validated);

        return redirect()
            ->route('custom-fields.index')
            ->with('success', 'Campo personalizado atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CustomField $customField)
    {
        $this->authorize('delete', $customField);

        $customField->delete();

        return redirect()
            ->route('custom-fields.index')
            ->with('success', 'Campo personalizado removido com sucesso!');
    }

    /**
     * Update order of custom fields
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'fields' => ['required', 'array'],
            'fields.*.id' => ['required', 'exists:custom_fields,id'],
            'fields.*.order_index' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['fields'] as $field) {
            CustomField::where('id', $field['id'])
                ->update(['order_index' => $field['order_index']]);
        }

        return back()->with('success', 'Ordem atualizada com sucesso!');
    }

    /**
     * Get available field types with labels
     */
    private function getFieldTypes(): array
    {
        return [
            ['value' => 'text', 'label' => 'Texto'],
            ['value' => 'textarea', 'label' => 'Texto Longo'],
            ['value' => 'number', 'label' => 'Número'],
            ['value' => 'date', 'label' => 'Data'],
            ['value' => 'select', 'label' => 'Seleção (Dropdown)'],
            ['value' => 'checkbox', 'label' => 'Checkbox'],
        ];
    }
}
