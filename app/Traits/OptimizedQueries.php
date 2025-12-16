<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait para queries otimizadas
 *
 * Adiciona métodos helper para eager loading e otimizações comuns
 */
trait OptimizedQueries
{
    /**
     * Scope para carregar conversas com relacionamentos otimizados
     */
    public function scopeWithOptimizedRelations(Builder $query): Builder
    {
        return $query->with([
            'contact:id,name,phone,avatar',
            'lastMessage:id,conversation_id,type,content,created_at',
            'assignedUser:id,name,avatar',
            'tags:id,name,color',
        ]);
    }

    /**
     * Scope para carregar apenas campos necessários
     */
    public function scopeSelectEssential(Builder $query): Builder
    {
        $table = $this->getTable();

        return $query->select([
            "{$table}.id",
            "{$table}.created_at",
            "{$table}.updated_at",
        ]);
    }

    /**
     * Scope para paginação otimizada com cursor
     *
     * Mais eficiente que offset-based pagination para grandes datasets
     */
    public function scopeCursorPaginate(Builder $query, int $perPage = 20)
    {
        return $query->cursorPaginate($perPage);
    }

    /**
     * Scope para busca full-text otimizada
     */
    public function scopeFullTextSearch(Builder $query, string $term, array $columns = []): Builder
    {
        if (empty($columns)) {
            $columns = ['name', 'description'];
        }

        $query->whereRaw(
            "MATCH(" . implode(',', $columns) . ") AGAINST(? IN BOOLEAN MODE)",
            [$term . '*']
        );

        return $query;
    }

    /**
     * Scope para queries com cache
     */
    public function scopeRemember(Builder $query, int $minutes = 5, string $key = null): Builder
    {
        $cacheKey = $key ?? md5($query->toSql() . serialize($query->getBindings()));

        return $query->remember(now()->addMinutes($minutes), $cacheKey);
    }
}
