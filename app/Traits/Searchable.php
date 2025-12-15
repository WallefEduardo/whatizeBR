<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Busca full-text em múltiplas colunas
     */
    public function scopeSearch(Builder $query, ?string $search, array $columns = []): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $searchColumns = !empty($columns) ? $columns : $this->searchable ?? [];

        if (empty($searchColumns)) {
            return $query;
        }

        return $query->where(function ($q) use ($search, $searchColumns) {
            foreach ($searchColumns as $column) {
                $q->orWhere($column, 'ILIKE', "%{$search}%");
            }
        });
    }

    /**
     * Busca full-text usando PostgreSQL ts_vector (mais performático)
     */
    public function scopeFullTextSearch(Builder $query, ?string $search, array $columns = []): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $searchColumns = !empty($columns) ? $columns : $this->searchable ?? [];

        if (empty($searchColumns)) {
            return $query;
        }

        // Concatenar colunas para busca
        $concatenated = implode(" || ' ' || ", array_map(function ($col) {
            return "COALESCE({$col}, '')";
        }, $searchColumns));

        // Usar to_tsvector e to_tsquery para busca full-text
        $tsQuery = str_replace(' ', ' & ', $search);

        return $query->whereRaw(
            "to_tsvector('portuguese', {$concatenated}) @@ to_tsquery('portuguese', ?)",
            [$tsQuery]
        );
    }

    /**
     * Highlight de texto encontrado
     */
    public function scopeWithHighlight(Builder $query, string $search, array $columns = []): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $searchColumns = !empty($columns) ? $columns : $this->searchable ?? [];

        foreach ($searchColumns as $column) {
            $alias = "{$column}_highlighted";
            $query->selectRaw(
                "ts_headline('portuguese', {$column}, to_tsquery('portuguese', ?), 'MaxWords=50, MinWords=25, MaxFragments=3') as {$alias}",
                [str_replace(' ', ' & ', $search)]
            );
        }

        return $query;
    }

    /**
     * Aplicar filtros combinados (AND/OR)
     */
    public function scopeApplyFilters(Builder $query, array $filters, string $operator = 'AND'): Builder
    {
        if (empty($filters)) {
            return $query;
        }

        $operator = strtoupper($operator);

        return $query->where(function ($q) use ($filters, $operator) {
            foreach ($filters as $filter) {
                if (!isset($filter['field']) || !isset($filter['value'])) {
                    continue;
                }

                $field = $filter['field'];
                $value = $filter['value'];
                $condition = $filter['condition'] ?? '=';

                $method = $operator === 'OR' ? 'orWhere' : 'where';

                match ($condition) {
                    '=' => $q->{$method}($field, '=', $value),
                    '!=' => $q->{$method}($field, '!=', $value),
                    '>' => $q->{$method}($field, '>', $value),
                    '>=' => $q->{$method}($field, '>=', $value),
                    '<' => $q->{$method}($field, '<', $value),
                    '<=' => $q->{$method}($field, '<=', $value),
                    'like' => $q->{$method}($field, 'ILIKE', "%{$value}%"),
                    'not_like' => $q->{$method}($field, 'NOT ILIKE', "%{$value}%"),
                    'in' => $q->{$method . 'In'}($field, (array) $value),
                    'not_in' => $q->{$method . 'NotIn'}($field, (array) $value),
                    'null' => $q->{$method . 'Null'}($field),
                    'not_null' => $q->{$method . 'NotNull'}($field),
                    'between' => is_array($value) && count($value) === 2
                        ? $q->{$method . 'Between'}($field, $value)
                        : null,
                    default => $q->{$method}($field, '=', $value),
                };
            }
        });
    }

    /**
     * Ordenação dinâmica
     */
    public function scopeSortBy(Builder $query, ?string $field, string $direction = 'asc'): Builder
    {
        if (empty($field)) {
            return $query;
        }

        $sortable = $this->sortable ?? [];

        if (!in_array($field, $sortable)) {
            return $query;
        }

        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($field, $direction);
    }
}
