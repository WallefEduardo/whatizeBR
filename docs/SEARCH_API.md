# API de Busca Global - Documentação

## Visão Geral

A API de Busca Global fornece endpoints poderosos para buscar mensagens, contatos e conversas com suporte a:
- **Full-text search** usando PostgreSQL ts_vector
- **Filtros combinados** (AND/OR)
- **Highlight de resultados**
- **Paginação**
- **Ordenação dinâmica**

---

## Endpoints

### 1. Busca Global

Busca em todos os recursos (mensagens, contatos, conversas) simultaneamente.

**Endpoint:** `GET /search/global`

**Parâmetros:**

```json
{
  "query": "string (obrigatório, min: 2, max: 255)",
  "instance_id": "uuid (opcional)",
  "types": ["messages", "contacts", "conversations"] (opcional),
  "limit": "integer (opcional, min: 1, max: 100, default: 20)"
}
```

**Exemplo de Request:**

```bash
GET /search/global?query=pagamento&instance_id=123e4567-e89b-12d3-a456-426614174000&types[]=messages&types[]=contacts&limit=10
```

**Exemplo de Response:**

```json
{
  "query": "pagamento",
  "results": {
    "messages": [
      {
        "id": "uuid",
        "content": "Recebi seu pagamento...",
        "content_highlighted": "Recebi seu <b>pagamento</b>...",
        "conversation": {
          "id": "uuid",
          "contact": {
            "name": "João Silva",
            "phone": "5511999999999"
          }
        },
        "created_at": "2025-12-15T18:30:00Z"
      }
    ],
    "contacts": [
      {
        "id": "uuid",
        "name": "João Silva",
        "phone": "5511999999999",
        "email": "joao@example.com"
      }
    ],
    "conversations": [
      {
        "id": "uuid",
        "contact": {
          "name": "João Silva",
          "phone": "5511999999999"
        },
        "status": "open",
        "last_message_at": "2025-12-15T18:30:00Z"
      }
    ]
  },
  "total": 15
}
```

---

### 2. Busca em Mensagens

Busca específica em mensagens com filtros avançados.

**Endpoint:** `GET /search/messages`

**Parâmetros:**

```json
{
  "query": "string (obrigatório, min: 2, max: 255)",
  "instance_id": "uuid (opcional)",
  "conversation_id": "uuid (opcional)",
  "filters": [
    {
      "field": "string (obrigatório)",
      "value": "any (obrigatório)",
      "condition": "string (opcional: =, !=, >, >=, <, <=, like, in, between, null, not_null)"
    }
  ],
  "filter_operator": "AND ou OR (opcional, default: AND)",
  "sort_by": "string (opcional: created_at, sent_at, delivered_at, read_at, status)",
  "sort_direction": "asc ou desc (opcional, default: desc)",
  "page": "integer (opcional, min: 1, default: 1)",
  "per_page": "integer (opcional, min: 1, max: 100, default: 20)",
  "highlight": "boolean (opcional, default: true)"
}
```

**Exemplo de Request com Filtros:**

```bash
GET /search/messages?query=pagamento&filters[0][field]=status&filters[0][value]=sent&filters[0][condition]==&filters[1][field]=created_at&filters[1][value][]=2025-12-01&filters[1][value][]=2025-12-31&filters[1][condition]=between&filter_operator=AND&sort_by=created_at&sort_direction=desc&page=1&per_page=20&highlight=true
```

**Exemplo de Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Recebi seu pagamento de R$ 100,00",
      "content_highlighted": "Recebi seu <b>pagamento</b> de R$ 100,00",
      "caption": null,
      "direction": "inbound",
      "type": "text",
      "status": "sent",
      "created_at": "2025-12-15T18:30:00Z",
      "conversation": {
        "id": "uuid",
        "contact": {
          "name": "João Silva",
          "phone": "5511999999999"
        }
      }
    }
  ],
  "total": 45,
  "per_page": 20,
  "current_page": 1,
  "last_page": 3,
  "from": 1,
  "to": 20
}
```

---

### 3. Busca em Contatos

Busca específica em contatos com filtros.

**Endpoint:** `GET /search/contacts`

**Parâmetros:**

```json
{
  "query": "string (obrigatório, min: 2, max: 255)",
  "instance_id": "uuid (opcional)",
  "filters": [
    {
      "field": "string (obrigatório)",
      "value": "any (obrigatório)",
      "condition": "string (opcional)"
    }
  ],
  "filter_operator": "AND ou OR (opcional, default: AND)",
  "tag_ids": ["uuid", "uuid"] (opcional),
  "sort_by": "string (opcional: name, phone, email, created_at, last_interaction_at)",
  "sort_direction": "asc ou desc (opcional, default: asc)",
  "page": "integer (opcional)",
  "per_page": "integer (opcional)"
}
```

**Exemplo de Request:**

```bash
GET /search/contacts?query=João&tag_ids[]=uuid1&tag_ids[]=uuid2&sort_by=name&sort_direction=asc
```

**Exemplo de Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "phone": "5511999999999",
      "email": "joao@example.com",
      "tags": [
        {
          "id": "uuid",
          "name": "VIP",
          "color": "#22c55e"
        }
      ],
      "is_blocked": false,
      "last_interaction_at": "2025-12-15T18:00:00Z"
    }
  ],
  "total": 10,
  "per_page": 20,
  "current_page": 1,
  "last_page": 1,
  "from": 1,
  "to": 10
}
```

---

### 4. Busca em Conversas

Busca específica em conversas com múltiplos filtros.

**Endpoint:** `GET /search/conversations`

**Parâmetros:**

```json
{
  "query": "string (opcional, min: 2, max: 255)",
  "instance_id": "uuid (opcional)",
  "filters": [
    {
      "field": "string (obrigatório)",
      "value": "any (obrigatório)",
      "condition": "string (opcional)"
    }
  ],
  "filter_operator": "AND ou OR (opcional, default: AND)",
  "status": "open, pending ou closed (opcional)",
  "assigned_to": "uuid (opcional)",
  "department_id": "uuid (opcional)",
  "tag_ids": ["uuid", "uuid"] (opcional),
  "sort_by": "string (opcional: created_at, last_message_at, status, unread_count)",
  "sort_direction": "asc ou desc (opcional, default: desc)",
  "page": "integer (opcional)",
  "per_page": "integer (opcional)"
}
```

**Exemplo de Request:**

```bash
GET /search/conversations?status=open&assigned_to=uuid&sort_by=last_message_at&sort_direction=desc
```

**Exemplo de Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "contact": {
        "id": "uuid",
        "name": "João Silva",
        "phone": "5511999999999"
      },
      "status": "open",
      "is_group": false,
      "unread_count": 3,
      "assigned_to": {
        "id": "uuid",
        "name": "Maria Atendente"
      },
      "department": {
        "id": "uuid",
        "name": "Suporte"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "Urgente",
          "color": "#ef4444"
        }
      ],
      "last_message_at": "2025-12-15T18:30:00Z"
    }
  ],
  "total": 25,
  "per_page": 20,
  "current_page": 1,
  "last_page": 2,
  "from": 1,
  "to": 20
}
```

---

## Operadores de Filtro

### Condições Disponíveis

| Condição | Descrição | Exemplo |
|----------|-----------|---------|
| `=` | Igual | `{"field": "status", "value": "sent", "condition": "="}` |
| `!=` | Diferente | `{"field": "status", "value": "failed", "condition": "!="}` |
| `>` | Maior que | `{"field": "created_at", "value": "2025-12-01", "condition": ">"}` |
| `>=` | Maior ou igual | `{"field": "unread_count", "value": 5, "condition": ">="}` |
| `<` | Menor que | `{"field": "created_at", "value": "2025-12-31", "condition": "<"}` |
| `<=` | Menor ou igual | `{"field": "unread_count", "value": 10, "condition": "<="}` |
| `like` | Contém (ILIKE) | `{"field": "name", "value": "João", "condition": "like"}` |
| `not_like` | Não contém | `{"field": "name", "value": "Spam", "condition": "not_like"}` |
| `in` | Está em array | `{"field": "status", "value": ["sent", "delivered"], "condition": "in"}` |
| `not_in` | Não está em array | `{"field": "status", "value": ["failed"], "condition": "not_in"}` |
| `null` | É nulo | `{"field": "assigned_to", "value": null, "condition": "null"}` |
| `not_null` | Não é nulo | `{"field": "assigned_to", "value": null, "condition": "not_null"}` |
| `between` | Entre valores | `{"field": "created_at", "value": ["2025-12-01", "2025-12-31"], "condition": "between"}` |

### Operadores Lógicos

- **AND**: Todas as condições devem ser verdadeiras
- **OR**: Pelo menos uma condição deve ser verdadeira

---

## Performance

### Índices Full-Text

O sistema utiliza índices GIN (Generalized Inverted Index) do PostgreSQL para busca full-text com alta performance:

```sql
-- Índice em messages.content
CREATE INDEX idx_messages_content_fulltext
ON messages USING gin(to_tsvector('portuguese', content));

-- Índice em contacts (name, phone, email, notes)
CREATE INDEX idx_contacts_search_fulltext
ON contacts USING gin(to_tsvector('portuguese',
  name || ' ' || phone || ' ' || email || ' ' || notes
));
```

### Índices Compostos

Índices compostos otimizam filtros combinados:

```sql
CREATE INDEX idx_messages_instance_conversation
ON messages(instance_id, conversation_id, created_at DESC);

CREATE INDEX idx_conversations_instance_status
ON conversations(instance_id, status, last_message_at DESC);
```

---

## Highlight de Resultados

O highlight usa a função `ts_headline` do PostgreSQL para destacar termos encontrados:

```sql
ts_headline(
  'portuguese',           -- Idioma
  content,                -- Coluna
  to_tsquery('portuguese', 'pagamento'),  -- Query
  'MaxWords=50, MinWords=25, MaxFragments=3'  -- Opções
)
```

**Resultado:**
```
"Recebi seu <b>pagamento</b> de R$ 100,00 hoje às 14h"
```

---

## Exemplos de Uso

### 1. Buscar mensagens com "pedido" nos últimos 7 dias

```bash
GET /search/messages?query=pedido&filters[0][field]=created_at&filters[0][value][]=2025-12-08&filters[0][value][]=2025-12-15&filters[0][condition]=between
```

### 2. Buscar contatos bloqueados com tag "Spam"

```bash
GET /search/contacts?query=*&filters[0][field]=is_blocked&filters[0][value]=true&filters[0][condition]==&tag_ids[]=uuid-da-tag-spam
```

### 3. Buscar conversas abertas não atribuídas

```bash
GET /search/conversations?status=open&filters[0][field]=assigned_to&filters[0][condition]=null
```

### 4. Buscar mensagens enviadas OU entregues

```bash
GET /search/messages?query=*&filters[0][field]=status&filters[0][value][]=sent&filters[0][value][]=delivered&filters[0][condition]=in
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno do servidor |

---

## Trait Searchable

Todos os models que suportam busca herdam o trait `Searchable`:

```php
use App\Traits\Searchable;

class Message extends Model
{
    use Searchable;

    protected array $searchable = ['content', 'caption'];
    protected array $sortable = ['created_at', 'sent_at', 'status'];
}
```

### Métodos Disponíveis

- `search($query, $columns)` - Busca ILIKE simples
- `fullTextSearch($query, $columns)` - Busca full-text com ts_vector
- `withHighlight($search, $columns)` - Adiciona highlight aos resultados
- `applyFilters($filters, $operator)` - Aplica filtros combinados
- `sortBy($field, $direction)` - Ordenação dinâmica

---

## Notas Importantes

1. **Idioma**: As buscas usam configuração de idioma português para melhor análise de texto
2. **Performance**: Para grandes volumes, use paginação (max 100 items por página)
3. **Highlight**: Pode ser desabilitado para melhor performance (`highlight=false`)
4. **Cache**: Considere implementar cache para queries frequentes
5. **Limites**: A busca global tem limite de 20 itens por tipo por padrão
