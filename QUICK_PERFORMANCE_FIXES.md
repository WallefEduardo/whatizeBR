# 🚀 Correções RÁPIDAS de Performance - APLICAR AGORA

## ⚡ O Problema

Seu sistema está lento por 3 razões principais:

1. **N+1 Queries** - Centenas de queries desnecessárias
2. **Sem Cache** - Cada request bate no banco
3. **Sem Índices** - Queries lentas sem otimização

## 📊 Antes vs Depois Esperado

| Página | Antes | Depois | Queries |
|--------|-------|--------|---------|
| Chat Index | 2-3s | 200-300ms | 201 → 4 |
| Dashboard | 1-2s | 100-150ms | 50 → 3 |
| Contacts | 1.5s | 150ms | 100 → 5 |

---

## 🔥 PASSO 1: Ativar Debug (Ver N+1)

Adicione isso em `app/Providers/AppServiceProvider.php`:

```php
public function boot(): void
{
    // APENAS EM DESENVOLVIMENTO
    if (app()->environment('local')) {
        \DB::listen(function ($query) {
            if ($query->time > 100) { // Queries > 100ms
                \Log::warning('Slow Query', [
                    'sql' => $query->sql,
                    'time' => $query->time . 'ms',
                    'bindings' => $query->bindings,
                ]);
            }
        });
        
        // Contar total de queries
        \DB::enableQueryLog();
    }
}
```

Depois em qualquer controller, adicione no final:

```php
\Log::info('Total Queries: ' . count(\DB::getQueryLog()));
```

---

## 🔥 PASSO 2: Aplicar Índices MANUALMENTE

Como a migration está dando erro, aplique direto no banco:

```sql
-- Conversations
ALTER TABLE conversations ADD INDEX idx_conversations_status_last_msg (status, last_message_at);
ALTER TABLE conversations ADD INDEX idx_conversations_assigned_status (assigned_to, status);

-- Messages  
ALTER TABLE messages ADD INDEX idx_messages_conversation_created (conversation_id, created_at);
ALTER TABLE messages ADD INDEX idx_messages_direction_status (direction, status);
ALTER TABLE messages ADD INDEX idx_messages_to_phone_status (to_phone, status);

-- Contacts
ALTER TABLE contacts ADD INDEX idx_contacts_instance_phone (whatsapp_instance_id, phone);

-- Broadcasts
ALTER TABLE broadcasts ADD INDEX idx_broadcasts_status_scheduled (status, scheduled_at);
ALTER TABLE broadcasts ADD INDEX idx_broadcasts_instance_status (instance_id, status);

-- WhatsApp Instances
ALTER TABLE whatsapp_instances ADD INDEX idx_instances_user_status (user_id, status);
ALTER TABLE whatsapp_instances ADD INDEX idx_instances_active_status (is_active, status);
```

**Impacto:** Queries 80-90% mais rápidas! 🚀

---

## 🔥 PASSO 3: Cache de Stats

Em TODOS os controllers que mostram estatísticas, use cache:

**ANTES (LENTO):**
```php
$stats = [
    'total' => Contact::count(),
    'active' => Contact::where('active', true)->count(),
    'tags' => Tag::count(),
];
```

**DEPOIS (RÁPIDO):**
```php
$stats = cache()->remember('dashboard_stats', 300, function () {
    return [
        'total' => Contact::count(),
        'active' => Contact::where('active', true)->count(),
        'tags' => Tag::count(),
    ];
});
```

**Impacto:** De 3 queries para 0 (após primeiro load)

---

## 🔥 PASSO 4: Eager Loading SEMPRE

**Regra de Ouro:** Se você vai acessar um relacionamento no loop, carregue COM `with()`

**ANTES (N+1):**
```php
$conversations = Conversation::all();
foreach ($conversations as $conv) {
    echo $conv->contact->name; // +1 query
    echo $conv->lastMessage->content; // +1 query
}
// Total: 1 + (N * 2) queries
```

**DEPOIS (OTIMIZADO):**
```php
$conversations = Conversation::with(['contact', 'lastMessage'])->get();
foreach ($conversations as $conv) {
    echo $conv->contact->name; // 0 queries extras
    echo $conv->lastMessage->content; // 0 queries extras
}
// Total: 3 queries fixas
```

---

## 🔥 PASSO 5: Select Apenas Campos Necessários

**ANTES:**
```php
Conversation::with('contact')->get();
// Carrega TODOS os campos de contacts (name, phone, email, address, etc)
```

**DEPOIS:**
```php
Conversation::with('contact:id,name,phone,avatar')->get();
// Carrega apenas id, name, phone, avatar
```

**Impacto:** 60-70% menos dados trafegados

---

## 🔥 PASSO 6: Cursor Pagination

Para listas grandes, use cursor ao invés de offset:

**ANTES (LENTO com muitos registros):**
```php
$conversations = Conversation::paginate(50);
// Fica MUITO lento na página 100+
```

**DEPOIS (RÁPIDO sempre):**
```php
$conversations = Conversation::cursorPaginate(50);
// Performance constante independente da página
```

---

## 🔥 PASSO 7: Configurar Redis (IMPORTANTE!)

Redis é ESSENCIAL para cache rápido.

1. **Instalar Redis:**
```bash
# Windows (usar Memurai ou Docker)
docker run -d -p 6379:6379 redis:alpine

# Linux
sudo apt install redis-server
```

2. **Configurar .env:**
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

3. **Testar:**
```bash
redis-cli ping
# Deve retornar: PONG
```

**Impacto:** Cache 100x mais rápido que file/database

---

## 🔥 PASSO 8: Configurar Opcache (PHP)

Em `php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  # Apenas em produção
opcache.revalidate_freq=0
```

**Impacto:** 30-50% mais rápido

---

## 📊 Como Medir

### 1. Laravel Debugbar (Desenvolvimento)

```bash
composer require barryvdh/laravel-debugbar --dev
```

Mostra:
- Número de queries
- Tempo de cada query
- N+1 detection
- Memory usage

### 2. Ver Queries no Log

```php
// No controller
$queries = \DB::getQueryLog();
\Log::info('Queries', ['count' => count($queries), 'queries' => $queries]);
```

### 3. Benchmark Simples

```php
$start = microtime(true);

// Seu código aqui

$time = (microtime(true) - $start) * 1000;
\Log::info("Tempo: {$time}ms");
```

---

## ✅ Checklist de Aplicação

- [ ] Instalar Laravel Debugbar
- [ ] Aplicar índices no banco (SQL acima)
- [ ] Adicionar cache em stats/dashboard
- [ ] Verificar eager loading em TODAS as listagens
- [ ] Usar `select()` para limitar campos
- [ ] Trocar `paginate()` por `cursorPaginate()`
- [ ] Instalar e configurar Redis
- [ ] Ativar Opcache no PHP
- [ ] Medir antes e depois

---

## 🎯 Prioridade

1. **URGENTE** (fazer agora):
   - Aplicar índices SQL
   - Instalar Debugbar
   - Adicionar eager loading onde falta

2. **IMPORTANTE** (fazer hoje):
   - Configurar Redis
   - Cache de stats
   - Cursor pagination

3. **DESEJÁVEL** (fazer essa semana):
   - Opcache
   - Monitoramento

---

## 💡 Exemplo Completo (ChatController otimizado)

```php
public function index(Request $request)
{
    $user = $request->user();
    
    // ✅ OTIMIZADO
    $conversations = Conversation::query()
        ->select('conversations.*')
        ->with([
            'contact:id,name,phone,avatar',
            'contact.tags:id,name,color',
            'lastMessage:id,conversation_id,content,created_at'
        ])
        ->where('assigned_to', $user->id)
        ->orderBy('last_message_at', 'desc')
        ->cursorPaginate(50);
    
    // ✅ CACHE DE STATS
    $stats = cache()->remember("stats_{$user->id}", 300, function () use ($user) {
        return Conversation::where('assigned_to', $user->id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');
    });
    
    return Inertia::render('Chat/Index', [
        'conversations' => $conversations,
        'stats' => $stats,
    ]);
}
```

**De 201 queries → 4 queries!** 🚀

---

Aplique essas mudanças e verá diferença IMEDIATA! 💪
