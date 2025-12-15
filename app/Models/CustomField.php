<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomField extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'instance_id',
        'name',
        'field_type',
        'options',
        'is_required',
        'order_index',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'order_index' => 'integer',
    ];

    /**
     * Relationship: CustomField belongs to WhatsAppInstance
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Validate a value against this custom field
     */
    public function validateValue($value): array
    {
        $errors = [];

        // Required validation
        if ($this->is_required && ($value === null || $value === '')) {
            $errors[] = "O campo {$this->name} é obrigatório.";
        }

        // Type-specific validation
        if ($value !== null && $value !== '') {
            switch ($this->field_type) {
                case 'number':
                    if (!is_numeric($value)) {
                        $errors[] = "O campo {$this->name} deve ser um número.";
                    }
                    break;

                case 'date':
                    $date = \DateTime::createFromFormat('Y-m-d', $value);
                    if (!$date || $date->format('Y-m-d') !== $value) {
                        $errors[] = "O campo {$this->name} deve ser uma data válida (YYYY-MM-DD).";
                    }
                    break;

                case 'select':
                    if ($this->options && !in_array($value, $this->options)) {
                        $errors[] = "O valor selecionado para {$this->name} é inválido.";
                    }
                    break;

                case 'checkbox':
                    if (!in_array($value, ['0', '1', 0, 1, true, false], true)) {
                        $errors[] = "O campo {$this->name} deve ser verdadeiro ou falso.";
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Get validation rules for this field
     */
    public function getValidationRules(): array
    {
        $rules = [];

        if ($this->is_required) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        switch ($this->field_type) {
            case 'text':
            case 'textarea':
                $rules[] = 'string';
                $rules[] = 'max:1000';
                break;

            case 'number':
                $rules[] = 'numeric';
                break;

            case 'date':
                $rules[] = 'date_format:Y-m-d';
                break;

            case 'select':
                if ($this->options) {
                    $rules[] = 'in:' . implode(',', $this->options);
                }
                break;

            case 'checkbox':
                $rules[] = 'boolean';
                break;
        }

        return $rules;
    }

    /**
     * Scope: Order by order_index
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index');
    }

    /**
     * Scope: Filter by instance
     */
    public function scopeForInstance($query, $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }
}
