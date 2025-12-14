# 🚀 ROADMAP - API WhatsApp Custom em Go

## 📋 Visão Geral

API REST personalizada em **Golang** usando a biblioteca **private-meow** para integração com WhatsApp, com arquitetura baseada em **filas (RabbitMQ)** para garantir 100% de entrega de mensagens.

---

## 🎯 Objetivos

✅ **Controle total** sobre a implementação
✅ **Comunicação via filas** (RabbitMQ) - não HTTP
✅ **100% de entrega** garantida (retry automático)
✅ **Escalável** com Kubernetes
✅ **Customizável** para necessidades específicas
✅ **Performance otimizada** com Go

---

## 🏗️ Arquitetura

### Arquitetura de 3 Serviços Separados

**Baseado na implementação real de produção**, nossa API é dividida em **3 serviços Go independentes**:

1. **Serviço de Processamento Receptivo** - Processa mensagens recebidas do WhatsApp
2. **Serviço de Gerenciamento de Conexões** - Gerencia QR Code, status de conexão, autenticação
3. **Serviço de Gerenciamento de Réplicas** - Gerencia múltiplas instâncias e balanceamento

### Fluxo de Comunicação

```
┌─────────────────────────────────────────────────────────────────┐
│                         LARAVEL (PHP)                           │
│  - Controllers                                                  │
│  - Business Logic                                               │
│  - Database (PostgreSQL)                                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Publica via Exchange + Routing Key
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RABBITMQ (Message Broker)                  │
│                                                                 │
│  Exchange: whatsapp.direct (tipo: direct)                      │
│                                                                 │
│  Routing Keys:                                                  │
│  ├── send.text                                                 │
│  ├── send.media                                                │
│  ├── send.button                                               │
│  ├── send.list                                                 │
│  ├── webhook.incoming                                          │
│  └── webhook.status                                            │
│                                                                 │
│  Queues (1 por réplica/mil clientes):                          │
│  ├── whatsapp.replica.1                                        │
│  ├── whatsapp.replica.2                                        │
│  ├── whatsapp.replica.N                                        │
│  └── whatsapp.webhook (de volta pro Laravel)                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Consome mensagem
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│              API WHATSAPP GO (3 Serviços)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ 1. Serviço de Processamento Receptivo               │      │
│  │    - Escuta mensagens recebidas do WhatsApp         │      │
│  │    - Publica no RabbitMQ (webhook queue)            │      │
│  │    - Processamento interno com filas Go             │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ 2. Serviço de Gerenciamento de Conexões             │      │
│  │    - QR Code generation                              │      │
│  │    - Status de conexão (WebSocket)                   │      │
│  │    - Autenticação de sessões                         │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ 3. Serviço de Gerenciamento de Réplicas             │      │
│  │    - Balanceamento de carga                          │      │
│  │    - Health check de réplicas                        │      │
│  │    - Auto-scaling (K8s HPA)                          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  Componentes Compartilhados:                                   │
│  ├── Session Manager (múltiplas instâncias)                    │
│  ├── Media Handler (upload/download S3)                        │
│  ├── Retry Logic (exponential backoff)                         │
│  └── Webhook Publisher (publica de volta no RabbitMQ)          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Usa biblioteca
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PRIVATE-MEOW (Biblioteca Go)                   │
│  - Conexão WebSocket com WhatsApp                              │
│  - Protocolo Multi-Device                                      │
│  - Criptografia E2EE                                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ WebSocket
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                        WHATSAPP SERVERS                         │
└─────────────────────────────────────────────────────────────────┘
```

### Estratégia de Filas (Baseado em Produção Real)

**Exchange + Routing Keys:**
```
Exchange Type: direct
Exchange Name: whatsapp.direct

Bindings:
- Queue: whatsapp.replica.1 → Routing Key: send.*
- Queue: whatsapp.replica.2 → Routing Key: send.*
- Queue: whatsapp.webhook → Routing Key: webhook.*
```

**1 Fila por Réplica (a cada ~1000 clientes):**
- Evita sobrecarga em uma única fila
- Permite escalar horizontalmente
- Facilita manutenção e debugging

**Processamento Interno em Go:**
- Cada serviço Go usa **filas internas** (channels) para organizar tipos de mensagem
- Não cria fila separada no RabbitMQ para cada tipo (text, media, etc)
- Mais eficiente e performático

---

## 📁 Estrutura do Projeto Go (3 Serviços Separados)

```
whatsapp-api-go/
├── cmd/
│   ├── receptive-service/         # Serviço 1: Processamento Receptivo
│   │   └── main.go
│   ├── connection-service/        # Serviço 2: Gerenciamento de Conexões
│   │   └── main.go
│   └── replica-service/           # Serviço 3: Gerenciamento de Réplicas
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go              # Configurações (env) compartilhadas
│   │
│   ├── domain/
│   │   ├── entity/
│   │   │   ├── message.go         # Entidade Message
│   │   │   ├── session.go         # Entidade Session
│   │   │   ├── webhook.go         # Entidade Webhook
│   │   │   └── replica.go         # Entidade Replica
│   │   └── repository/
│   │       ├── session_repository.go
│   │       └── replica_repository.go
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── postgres.go        # PostgreSQL client (compartilhado)
│   │   │
│   │   ├── queue/
│   │   │   ├── rabbitmq.go        # RabbitMQ client
│   │   │   ├── exchange.go        # Exchange setup (whatsapp.direct)
│   │   │   ├── consumer.go        # Message consumer
│   │   │   └── publisher.go       # Message publisher
│   │   │
│   │   ├── storage/
│   │   │   └── s3.go              # MinIO/S3 client (compartilhado)
│   │   │
│   │   └── whatsapp/
│   │       ├── client.go          # private-meow wrapper
│   │       ├── session_manager.go # Gerenciador de sessões
│   │       └── event_handler.go   # Handler de eventos WhatsApp
│   │
│   ├── application/
│   │   ├── receptive/             # Lógica do Serviço Receptivo
│   │   │   ├── event_processor.go # Processa eventos recebidos
│   │   │   └── webhook_sender.go  # Envia webhooks pro Laravel
│   │   │
│   │   ├── connection/            # Lógica do Serviço de Conexão
│   │   │   ├── qr_generator.go    # Gera QR code
│   │   │   ├── session_auth.go    # Autenticação de sessões
│   │   │   └── status_manager.go  # Status de conexão
│   │   │
│   │   ├── replica/               # Lógica do Serviço de Réplica
│   │   │   ├── load_balancer.go   # Balanceamento de carga
│   │   │   ├── health_checker.go  # Health check de réplicas
│   │   │   └── scaler.go          # Auto-scaling logic
│   │   │
│   │   └── shared/                # Use cases compartilhados
│   │       ├── send_text_message.go
│   │       ├── send_media_message.go
│   │       ├── send_button_message.go
│   │       └── send_list_message.go
│   │
│   └── interface/
│       ├── http/
│       │   ├── server.go          # HTTP server (admin/health)
│       │   ├── handler/
│       │   │   ├── health.go      # Health check
│       │   │   ├── admin.go       # Admin endpoints
│       │   │   └── qr.go          # QR code endpoints
│       │   └── middleware/
│       │       └── auth.go        # Auth middleware
│       │
│       ├── websocket/
│       │   └── connection.go      # WebSocket para status real-time
│       │
│       └── cli/
│           └── commands.go        # CLI commands
│
├── pkg/
│   ├── logger/
│   │   └── logger.go              # Logger customizado
│   ├── validator/
│   │   └── validator.go           # Validação de payloads
│   ├── crypto/
│   │   └── hmac.go                # HMAC para webhooks
│   └── channels/
│       └── worker_pool.go         # Worker pool com Go channels
│
├── deployments/
│   ├── docker/
│   │   ├── Dockerfile.receptive   # Dockerfile do Serviço Receptivo
│   │   ├── Dockerfile.connection  # Dockerfile do Serviço de Conexão
│   │   └── Dockerfile.replica     # Dockerfile do Serviço de Réplica
│   │
│   └── kubernetes/
│       ├── receptive-deployment.yaml
│       ├── receptive-service.yaml
│       ├── connection-deployment.yaml
│       ├── connection-service.yaml
│       ├── replica-deployment.yaml
│       ├── replica-service.yaml
│       └── rabbitmq-config.yaml   # ConfigMap com Exchange/RK
│
├── scripts/
│   ├── migrate.sh
│   └── build-all.sh               # Build dos 3 serviços
│
├── .env.receptive
├── .env.connection
├── .env.replica
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

---

## 🗄️ Banco de Dados (PostgreSQL)

### Tabela: whatsapp_sessions

```sql
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_token VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    status VARCHAR(50) DEFAULT 'disconnected', -- disconnected, connecting, connected, authenticated
    qr_code TEXT,
    session_data JSONB, -- Dados de sessão do whatsmeow (criptografados)
    device_identity BYTEA, -- Device identity (protobuf)
    jid VARCHAR(255), -- Jabber ID
    lid VARCHAR(255), -- Logical ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    connected_at TIMESTAMP,
    last_seen_at TIMESTAMP
);

CREATE INDEX idx_sessions_token ON whatsapp_sessions(instance_token);
CREATE INDEX idx_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX idx_sessions_status ON whatsapp_sessions(status);
```

### Tabela: whatsapp_message_queue (fallback/tracking)

```sql
CREATE TABLE whatsapp_message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_token VARCHAR(255) NOT NULL,
    queue_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, sent, failed
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX idx_message_queue_status ON whatsapp_message_queue(status);
CREATE INDEX idx_message_queue_instance ON whatsapp_message_queue(instance_token);
```

---

## 🔧 Configuração (.env) - 3 Serviços

### .env.receptive (Serviço de Processamento Receptivo)

```bash
# Service Info
SERVICE_NAME=receptive-service
APP_ENV=production
APP_PORT=8081
LOG_LEVEL=info

# Database (Compartilhado)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=whatsapp_api
DB_USER=postgres
DB_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=/

# Exchange e Routing Keys
RABBITMQ_EXCHANGE=whatsapp.direct
RABBITMQ_EXCHANGE_TYPE=direct
ROUTING_KEY_WEBHOOK_INCOMING=webhook.incoming
ROUTING_KEY_WEBHOOK_STATUS=webhook.status
QUEUE_WEBHOOK=whatsapp.webhook

# WhatsApp
WHATSAPP_SESSION_TIMEOUT=300

# Security
WEBHOOK_HMAC_SECRET=

# Worker Pool (Go channels internos)
WORKER_POOL_SIZE=100  # Número de workers internos
MESSAGE_BUFFER_SIZE=1000
```

### .env.connection (Serviço de Gerenciamento de Conexões)

```bash
# Service Info
SERVICE_NAME=connection-service
APP_ENV=production
APP_PORT=8082
LOG_LEVEL=info

# Database (Compartilhado)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=whatsapp_api
DB_USER=postgres
DB_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=/

# Exchange (não consome, apenas gerencia status)
RABBITMQ_EXCHANGE=whatsapp.direct

# WhatsApp
WHATSAPP_SESSION_TIMEOUT=300
WHATSAPP_RECONNECT_DELAY=60

# QR Code
QR_CODE_TIMEOUT=60  # segundos
QR_CODE_REFRESH_INTERVAL=10

# Security
ADMIN_TOKEN=

# WebSocket (para status em tempo real)
WS_PORT=8083
WS_ALLOWED_ORIGINS=http://localhost:3000
```

### .env.replica (Serviço de Gerenciamento de Réplicas)

```bash
# Service Info
SERVICE_NAME=replica-service
APP_ENV=production
APP_PORT=8084
LOG_LEVEL=info

# Database (Compartilhado)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=whatsapp_api
DB_USER=postgres
DB_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=/

# Exchange e Routing Keys
RABBITMQ_EXCHANGE=whatsapp.direct
RABBITMQ_EXCHANGE_TYPE=direct
ROUTING_KEY_SEND=send.*  # Wildcard para todos os envios

# Replica Management
REPLICA_MAX_CLIENTS=1000  # Mil clientes por réplica
REPLICA_HEALTH_CHECK_INTERVAL=30  # segundos
REPLICA_AUTO_SCALE=true

# MinIO/S3
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=whatsapp-media
S3_REGION=us-east-1
S3_USE_SSL=false

# Security
ADMIN_TOKEN=

# Rate Limiting
RATE_LIMIT_PER_CONTACT=10  # mensagens por minuto
RATE_LIMIT_GLOBAL=1000  # mensagens por minuto

# Worker Pool (Go channels internos)
WORKER_POOL_SIZE=200  # Maior que receptive (envia msgs)
MESSAGE_BUFFER_SIZE=2000
```

### Configuração Compartilhada (todos os serviços)

**Variáveis comuns nos 3 .env:**
- Database (PostgreSQL)
- RabbitMQ connection
- Exchange name
- Security tokens

---

## 🔀 Configuração RabbitMQ (Exchange + Routing Keys)

### Setup do Exchange

```go
// internal/infrastructure/queue/exchange.go
package queue

import (
    amqp "github.com/rabbitmq/amqp091-go"
)

type ExchangeConfig struct {
    Name string
    Type string // "direct", "fanout", "topic", "headers"
}

func SetupExchange(ch *amqp.Channel, config ExchangeConfig) error {
    return ch.ExchangeDeclare(
        config.Name,  // name
        config.Type,  // type
        true,         // durable
        false,        // auto-deleted
        false,        // internal
        false,        // no-wait
        nil,          // arguments
    )
}

func SetupQueuesAndBindings(ch *amqp.Channel) error {
    exchange := "whatsapp.direct"

    // 1. Criar filas de réplica (1 por ~1000 clientes)
    queues := []string{
        "whatsapp.replica.1",
        "whatsapp.replica.2",
        "whatsapp.replica.3",
        // Adicionar mais conforme necessário
    }

    for _, queueName := range queues {
        // Declarar fila
        _, err := ch.QueueDeclare(
            queueName, // name
            true,      // durable
            false,     // auto-delete
            false,     // exclusive
            false,     // no-wait
            nil,       // args
        )
        if err != nil {
            return err
        }

        // Bind com routing key "send.*" (wildcard)
        routingKeys := []string{
            "send.text",
            "send.media",
            "send.button",
            "send.list",
        }

        for _, rk := range routingKeys {
            err = ch.QueueBind(
                queueName, // queue name
                rk,        // routing key
                exchange,  // exchange
                false,     // no-wait
                nil,       // args
            )
            if err != nil {
                return err
            }
        }
    }

    // 2. Criar fila de webhook (de volta pro Laravel)
    webhookQueue := "whatsapp.webhook"
    _, err := ch.QueueDeclare(
        webhookQueue,
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        return err
    }

    // Bind webhook queue com routing keys
    webhookKeys := []string{
        "webhook.incoming",
        "webhook.status",
    }

    for _, rk := range webhookKeys {
        err = ch.QueueBind(
            webhookQueue,
            rk,
            exchange,
            false,
            nil,
        )
        if err != nil {
            return err
        }
    }

    return nil
}
```

### Publicação com Routing Key (Laravel → Go)

```go
// internal/infrastructure/queue/publisher.go
func (p *Publisher) PublishWithRoutingKey(routingKey string, payload interface{}) error {
    body, err := json.Marshal(payload)
    if err != nil {
        return err
    }

    return p.channel.Publish(
        "whatsapp.direct", // exchange
        routingKey,        // routing key
        false,             // mandatory
        false,             // immediate
        amqp.Publishing{
            ContentType:  "application/json",
            Body:         body,
            DeliveryMode: amqp.Persistent,
            Timestamp:    time.Now(),
        },
    )
}

// Exemplos de uso:
// publisher.PublishWithRoutingKey("send.text", textMessage)
// publisher.PublishWithRoutingKey("send.media", mediaMessage)
// publisher.PublishWithRoutingKey("webhook.incoming", incomingMessage)
```

### Consumer com Routing Key (Go replica consome)

```go
// Cada réplica consome de sua própria fila
func (c *Consumer) ConsumeReplica(replicaNumber int, handler func([]byte) error) error {
    queueName := fmt.Sprintf("whatsapp.replica.%d", replicaNumber)

    msgs, err := c.channel.Consume(
        queueName,
        "",    // consumer tag
        false, // auto-ack
        false, // exclusive
        false, // no-local
        false, // no-wait
        nil,   // args
    )
    if err != nil {
        return err
    }

    // Worker pool interno (Go channels)
    workerPool := make(chan struct{}, 200) // 200 workers concorrentes

    go func() {
        for msg := range msgs {
            workerPool <- struct{}{} // Acquire worker

            go func(m amqp.Delivery) {
                defer func() { <-workerPool }() // Release worker

                if err := handler(m.Body); err != nil {
                    log.Printf("Error: %v", err)
                    m.Nack(false, true) // Retry
                } else {
                    m.Ack(false)
                }
            }(msg)
        }
    }()

    return nil
}
```

---

## 📦 Estrutura de Mensagens (RabbitMQ)

### 1. Enviar Mensagem de Texto

**Routing Key:** `send.text`
**Exchange:** `whatsapp.direct`
**Queues que recebem:** Todas as filas de réplica (`whatsapp.replica.*`)

**Payload:**
```json
{
  "instance_token": "abc123",
  "recipient": "5591999999999",
  "message": "Olá, tudo bem?",
  "quoted_message_id": null,
  "metadata": {
    "conversation_id": "uuid",
    "user_id": "uuid"
  }
}
```

**Response (via webhook queue):**
```json
{
  "type": "message_sent",
  "instance_token": "abc123",
  "message_id": "3EB0C641B1B8C9F123",
  "status": "sent",
  "timestamp": 1703001600,
  "metadata": {
    "conversation_id": "uuid",
    "user_id": "uuid"
  }
}
```

---

### 2. Enviar Mídia (Imagem/Vídeo/Documento)

**Routing Key:** `send.media`
**Exchange:** `whatsapp.direct`
**Queues que recebem:** Todas as filas de réplica (`whatsapp.replica.*`)

**Payload:**
```json
{
  "instance_token": "abc123",
  "recipient": "5591999999999",
  "media_type": "image", // image, video, audio, document
  "media_url": "https://example.com/image.jpg", // ou base64
  "caption": "Legenda da imagem",
  "filename": "image.jpg", // para documentos
  "metadata": {}
}
```

---

### 3. Enviar Botões Interativos

**Routing Key:** `send.button`
**Exchange:** `whatsapp.direct`
**Queues que recebem:** Todas as filas de réplica (`whatsapp.replica.*`)

**Payload:**
```json
{
  "instance_token": "abc123",
  "recipient": "5591999999999",
  "header": {
    "type": "text",
    "text": "Escolha uma opção"
  },
  "body": {
    "text": "Como podemos ajudar?"
  },
  "footer": {
    "text": "Powered by WhatizeBr"
  },
  "buttons": [
    {
      "id": "btn_1",
      "title": "Suporte"
    },
    {
      "id": "btn_2",
      "title": "Vendas"
    }
  ],
  "metadata": {}
}
```

---

### 4. Enviar Lista

**Routing Key:** `send.list`
**Exchange:** `whatsapp.direct`
**Queues que recebem:** Todas as filas de réplica (`whatsapp.replica.*`)

**Payload:**
```json
{
  "instance_token": "abc123",
  "recipient": "5591999999999",
  "body": "Escolha uma opção do menu",
  "button_text": "Ver opções",
  "sections": [
    {
      "title": "Produtos",
      "rows": [
        {
          "id": "prod_1",
          "title": "Produto A",
          "description": "Descrição do produto A"
        },
        {
          "id": "prod_2",
          "title": "Produto B",
          "description": "Descrição do produto B"
        }
      ]
    }
  ],
  "metadata": {}
}
```

---

### 5. Webhook - Mensagem Recebida

**Routing Key:** `webhook.incoming`
**Exchange:** `whatsapp.direct`
**Queue que recebe:** `whatsapp.webhook` (consumida pelo Laravel)

**Payload:**
```json
{
  "type": "message",
  "instance_token": "abc123",
  "message_id": "3EB0C641B1B8C9F123",
  "from": "5591999999999",
  "from_name": "João Silva",
  "chat": "5591999999999",
  "is_group": false,
  "message_type": "text", // text, image, video, audio, document, button_reply, list_reply
  "timestamp": 1703001600,
  "text": "Olá, preciso de ajuda",
  "media_url": null,
  "quoted_message_id": null,
  "button_reply": null, // { id: "btn_1", title: "Suporte" }
  "list_reply": null    // { id: "prod_1", title: "Produto A" }
}
```

---

### 6. Webhook - Status da Mensagem

**Routing Key:** `webhook.status`
**Exchange:** `whatsapp.direct`
**Queue que recebe:** `whatsapp.webhook` (consumida pelo Laravel)

**Payload:**
```json
{
  "type": "message_status",
  "instance_token": "abc123",
  "message_id": "3EB0C641B1B8C9F123",
  "status": "read", // sent, delivered, read
  "timestamp": 1703001610,
  "recipient": "5591999999999"
}
```

---

## 🔨 Implementação - Principais Componentes

### 1. RabbitMQ Consumer (internal/infrastructure/queue/consumer.go)

```go
package queue

import (
    "context"
    "encoding/json"
    "log"

    amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer struct {
    conn    *amqp.Connection
    channel *amqp.Channel
}

func NewConsumer(url string) (*Consumer, error) {
    conn, err := amqp.Dial(url)
    if err != nil {
        return nil, err
    }

    channel, err := conn.Channel()
    if err != nil {
        return nil, err
    }

    return &Consumer{
        conn:    conn,
        channel: channel,
    }, nil
}

func (c *Consumer) Consume(queueName string, handler func([]byte) error) error {
    msgs, err := c.channel.Consume(
        queueName,
        "",    // consumer tag
        false, // auto-ack (false para controle manual)
        false, // exclusive
        false, // no-local
        false, // no-wait
        nil,   // args
    )
    if err != nil {
        return err
    }

    go func() {
        for msg := range msgs {
            log.Printf("Received message from %s: %s", queueName, string(msg.Body))

            // Processar mensagem
            if err := handler(msg.Body); err != nil {
                log.Printf("Error processing message: %v", err)

                // NACK com requeue (retry)
                msg.Nack(false, true)
            } else {
                // ACK (sucesso)
                msg.Ack(false)
            }
        }
    }()

    return nil
}

func (c *Consumer) Close() {
    c.channel.Close()
    c.conn.Close()
}
```

---

### 2. WhatsApp Client Wrapper (internal/infrastructure/whatsapp/client.go)

```go
package whatsapp

import (
    "context"
    "fmt"

    "github.com/renatokeys/private-meow"
    waProto "github.com/renatokeys/private-meow/binary/proto"
)

type Client struct {
    meowClient *whatsmeow.Client
    eventChan  chan whatsmeow.Event
}

func NewClient(deviceStore *store.Device) (*Client, error) {
    meowClient := whatsmeow.NewClient(deviceStore, nil)

    eventChan := make(chan whatsmeow.Event, 100)

    return &Client{
        meowClient: meowClient,
        eventChan:  eventChan,
    }, nil
}

func (c *Client) Connect(ctx context.Context) error {
    return c.meowClient.Connect()
}

func (c *Client) SendTextMessage(ctx context.Context, recipient string, message string) (string, error) {
    jid, err := types.ParseJID(recipient + "@s.whatsapp.net")
    if err != nil {
        return "", err
    }

    msg := &waProto.Message{
        Conversation: &message,
    }

    resp, err := c.meowClient.SendMessage(ctx, jid, msg)
    if err != nil {
        return "", err
    }

    return resp.ID, nil
}

func (c *Client) SendImageMessage(ctx context.Context, recipient string, imageData []byte, caption string) (string, error) {
    jid, err := types.ParseJID(recipient + "@s.whatsapp.net")
    if err != nil {
        return "", err
    }

    // Upload da imagem
    uploaded, err := c.meowClient.Upload(ctx, imageData, whatsmeow.MediaImage)
    if err != nil {
        return "", err
    }

    msg := &waProto.Message{
        ImageMessage: &waProto.ImageMessage{
            Caption:       &caption,
            Url:           &uploaded.URL,
            DirectPath:    &uploaded.DirectPath,
            MediaKey:      uploaded.MediaKey,
            Mimetype:      proto.String("image/jpeg"),
            FileEncSha256: uploaded.FileEncSHA256,
            FileSha256:    uploaded.FileSHA256,
            FileLength:    proto.Uint64(uint64(len(imageData))),
        },
    }

    resp, err := c.meowClient.SendMessage(ctx, jid, msg)
    if err != nil {
        return "", err
    }

    return resp.ID, nil
}

// Mais métodos: SendVideo, SendDocument, SendButton, SendList, etc...

func (c *Client) Disconnect() error {
    c.meowClient.Disconnect()
    return nil
}
```

---

### 3. Session Manager (internal/infrastructure/whatsapp/session_manager.go)

```go
package whatsapp

import (
    "context"
    "sync"

    "github.com/renatokeys/private-meow/store"
)

type SessionManager struct {
    sessions map[string]*Client // instance_token -> Client
    mu       sync.RWMutex
    db       *sql.DB
}

func NewSessionManager(db *sql.DB) *SessionManager {
    return &SessionManager{
        sessions: make(map[string]*Client),
        db:       db,
    }
}

func (sm *SessionManager) GetOrCreateSession(instanceToken string) (*Client, error) {
    sm.mu.RLock()
    client, exists := sm.sessions[instanceToken]
    sm.mu.RUnlock()

    if exists {
        return client, nil
    }

    // Carregar sessão do banco
    session, err := sm.loadSessionFromDB(instanceToken)
    if err != nil {
        return nil, err
    }

    // Criar device store
    deviceStore := store.NewDevice(session.DeviceIdentity, session.JID, session.LID)

    // Criar client
    client, err = NewClient(deviceStore)
    if err != nil {
        return nil, err
    }

    // Conectar
    if err := client.Connect(context.Background()); err != nil {
        return nil, err
    }

    // Armazenar em memória
    sm.mu.Lock()
    sm.sessions[instanceToken] = client
    sm.mu.Unlock()

    return client, nil
}

func (sm *SessionManager) CloseSession(instanceToken string) error {
    sm.mu.Lock()
    defer sm.mu.Unlock()

    client, exists := sm.sessions[instanceToken]
    if !exists {
        return nil
    }

    if err := client.Disconnect(); err != nil {
        return err
    }

    delete(sm.sessions, instanceToken)
    return nil
}

func (sm *SessionManager) loadSessionFromDB(instanceToken string) (*Session, error) {
    // Query no PostgreSQL para carregar session_data
    // ...
    return nil, nil
}
```

---

### 4. Queue Handler (internal/application/handler/queue_handler.go)

```go
package handler

import (
    "context"
    "encoding/json"
    "log"
)

type QueueHandler struct {
    sessionManager *whatsapp.SessionManager
    publisher      *queue.Publisher
}

func NewQueueHandler(sm *whatsapp.SessionManager, pub *queue.Publisher) *QueueHandler {
    return &QueueHandler{
        sessionManager: sm,
        publisher:      pub,
    }
}

func (h *QueueHandler) HandleSendTextMessage(payload []byte) error {
    var msg struct {
        InstanceToken string                 `json:"instance_token"`
        Recipient     string                 `json:"recipient"`
        Message       string                 `json:"message"`
        Metadata      map[string]interface{} `json:"metadata"`
    }

    if err := json.Unmarshal(payload, &msg); err != nil {
        return err
    }

    // Obter sessão
    client, err := h.sessionManager.GetOrCreateSession(msg.InstanceToken)
    if err != nil {
        return err
    }

    // Enviar mensagem
    messageID, err := client.SendTextMessage(context.Background(), msg.Recipient, msg.Message)
    if err != nil {
        return err
    }

    // Publicar evento de sucesso de volta no RabbitMQ
    response := map[string]interface{}{
        "type":           "message_sent",
        "instance_token": msg.InstanceToken,
        "message_id":     messageID,
        "status":         "sent",
        "metadata":       msg.Metadata,
    }

    return h.publisher.PublishWithRoutingKey("webhook.status", response)
}

// Mais handlers: HandleSendMedia, HandleSendButton, HandleSendList...
```

---

## 📝 ROADMAP DE DESENVOLVIMENTO DA API GO (3 Serviços)

### FASE 1: Setup Inicial (Semana 1)

#### 1.1 Configuração Base
- [ ] Criar estrutura do projeto Go com 3 cmd/ separados
- [ ] Configurar go.mod com dependências:
  - [ ] github.com/renatokeys/private-meow
  - [ ] github.com/rabbitmq/amqp091-go
  - [ ] github.com/lib/pq (PostgreSQL)
  - [ ] github.com/aws/aws-sdk-go-v2 (S3)
  - [ ] github.com/joho/godotenv
  - [ ] go.uber.org/zap (logger)
  - [ ] github.com/gorilla/websocket (para WebSocket)
- [ ] Criar .env.receptive, .env.connection, .env.replica
- [ ] Configurar logger (Zap) compartilhado

#### 1.2 Infraestrutura Base (Compartilhada)
- [ ] Implementar config loader (internal/config)
- [ ] Criar PostgreSQL client (internal/infrastructure/database)
- [ ] Criar RabbitMQ client com suporte a Exchange (internal/infrastructure/queue)
- [ ] Implementar Exchange setup (whatsapp.direct)
- [ ] Criar S3/MinIO client (internal/infrastructure/storage)
- [ ] Setup de migrations (tabelas whatsapp_sessions, whatsapp_message_queue, whatsapp_replicas)

---

### FASE 2: WhatsApp Integration (Semana 2-3)

#### 2.1 Private-Meow Wrapper
- [ ] Criar WhatsApp Client wrapper (internal/infrastructure/whatsapp/client.go)
- [ ] Implementar métodos:
  - [ ] Connect()
  - [ ] SendTextMessage()
  - [ ] SendImageMessage()
  - [ ] SendVideoMessage()
  - [ ] SendDocumentMessage()
  - [ ] SendButtonMessage()
  - [ ] SendListMessage()
  - [ ] MarkAsRead()
  - [ ] SendPresence() (typing indicator)

#### 2.2 Session Management
- [ ] Criar Session Manager (internal/infrastructure/whatsapp/session_manager.go)
- [ ] Implementar:
  - [ ] CreateSession() - cria nova sessão
  - [ ] GetOrCreateSession() - obtém ou cria
  - [ ] LoadSessionFromDB() - carrega do banco
  - [ ] SaveSessionToDB() - salva no banco
  - [ ] CloseSession() - fecha conexão
  - [ ] GetQRCode() - gera QR code para autenticação

#### 2.3 Event Handler (Webhooks)
- [ ] Criar Event Handler (internal/infrastructure/whatsapp/event_handler.go)
- [ ] Implementar listeners para eventos:
  - [ ] Message Received
  - [ ] Message Sent
  - [ ] Message Read
  - [ ] Typing Indicator
  - [ ] Presence Update
  - [ ] Connection Status
- [ ] Publicar eventos no RabbitMQ (fila webhook)

---

### FASE 3: RabbitMQ Integration com Exchange (Semana 4)

#### 3.1 Exchange & Routing Keys
- [ ] Implementar setup de Exchange (whatsapp.direct) (internal/infrastructure/queue/exchange.go)
- [ ] Criar bindings automáticos para routing keys
- [ ] Configurar filas de réplica dinâmicas (whatsapp.replica.1, .2, .3, etc)
- [ ] Configurar fila de webhook (whatsapp.webhook)

#### 3.2 Consumer Implementation
- [ ] Implementar Consumer com suporte a routing keys (internal/infrastructure/queue/consumer.go)
- [ ] Método ConsumeReplica(replicaNumber) para cada réplica
- [ ] Configurar dead letter queue (DLQ)
- [ ] Implementar retry logic com exponential backoff
- [ ] Configurar prefetch count para controle de concorrência

#### 3.3 Publisher Implementation
- [ ] Implementar Publisher com routing keys (internal/infrastructure/queue/publisher.go)
- [ ] Método PublishWithRoutingKey(routingKey, payload)
- [ ] Confirmar entrega de mensagens (publisher confirms)
- [ ] Implementar fallback para banco em caso de falha

#### 3.4 Worker Pool Interno (Go Channels)
- [ ] Criar worker pool genérico (pkg/channels/worker_pool.go)
- [ ] Implementar canais internos para tipos de mensagem
- [ ] Evitar criação de filas RabbitMQ para cada tipo
- [ ] Controle de concorrência com semaphore pattern

---

### FASE 4: Storage & Media (Semana 5)

#### 4.1 S3/MinIO Integration
- [ ] Implementar upload de mídias para S3
- [ ] Implementar download de mídias do S3
- [ ] Gerar URLs assinadas (presigned URLs)
- [ ] Implementar cache de mídias

#### 4.2 Media Processing
- [ ] Validação de tipos de arquivo
- [ ] Compressão de imagens (opcional)
- [ ] Geração de thumbnails
- [ ] Limite de tamanho de arquivo

---

### FASE 5: Serviço 1 - Processamento Receptivo (Semana 6)

#### 5.1 Event Processor
- [ ] Criar event processor (internal/application/receptive/event_processor.go)
- [ ] Processar eventos recebidos do WhatsApp via private-meow
- [ ] Organizar mensagens em canais Go internos por tipo
- [ ] Worker pool para processar eventos em paralelo

#### 5.2 Webhook Sender
- [ ] Criar webhook sender (internal/application/receptive/webhook_sender.go)
- [ ] Publicar mensagens recebidas no RabbitMQ com routing key "webhook.incoming"
- [ ] Publicar status de mensagens com routing key "webhook.status"
- [ ] HMAC signature para segurança

#### 5.3 Main Entry Point
- [ ] Criar cmd/receptive-service/main.go
- [ ] Inicializar conexão RabbitMQ
- [ ] Inicializar Session Manager
- [ ] Escutar eventos do WhatsApp
- [ ] Health check endpoint

---

### FASE 6: Serviço 2 - Gerenciamento de Conexões (Semana 7)

#### 6.1 QR Code Generator
- [ ] Criar QR generator (internal/application/connection/qr_generator.go)
- [ ] Gerar QR code para novas conexões
- [ ] Refresh automático de QR code a cada 10s
- [ ] Timeout de 60s

#### 6.2 Session Authentication
- [ ] Criar session auth (internal/application/connection/session_auth.go)
- [ ] Gerenciar autenticação de sessões WhatsApp
- [ ] Salvar session_data no PostgreSQL
- [ ] Reconexão automática em caso de queda

#### 6.3 Status Manager com WebSocket
- [ ] Criar status manager (internal/application/connection/status_manager.go)
- [ ] WebSocket server para status real-time
- [ ] Publicar eventos de conexão/desconexão
- [ ] Dashboard de status de todas as sessões

#### 6.4 HTTP Endpoints
- [ ] POST /admin/sessions - criar sessão
- [ ] GET /admin/sessions/:token - obter status da sessão
- [ ] POST /admin/sessions/:token/connect - conectar (gerar QR)
- [ ] DELETE /admin/sessions/:token - deletar sessão
- [ ] GET /admin/sessions/:token/qr - obter QR code
- [ ] WebSocket /ws/status - status real-time

#### 6.5 Main Entry Point
- [ ] Criar cmd/connection-service/main.go
- [ ] Inicializar HTTP server
- [ ] Inicializar WebSocket server
- [ ] Inicializar Session Manager

---

### FASE 7: Serviço 3 - Gerenciamento de Réplicas (Semana 8-9)

#### 7.1 Load Balancer
- [ ] Criar load balancer (internal/application/replica/load_balancer.go)
- [ ] Distribuir clientes entre réplicas (max 1000 por réplica)
- [ ] Algoritmo de distribuição (round-robin ou least-connections)
- [ ] Tabela whatsapp_replicas no PostgreSQL

#### 7.2 Health Checker
- [ ] Criar health checker (internal/application/replica/health_checker.go)
- [ ] Verificar saúde de cada réplica (a cada 30s)
- [ ] Detectar réplicas offline
- [ ] Redistribuir clientes de réplicas offline

#### 7.3 Auto-Scaler
- [ ] Criar scaler (internal/application/replica/scaler.go)
- [ ] Criar nova fila RabbitMQ quando réplica é adicionada
- [ ] Bind nova fila com routing keys "send.*"
- [ ] Integração com Kubernetes HPA
- [ ] Métricas para decisão de scale (CPU, memória, fila)

#### 7.4 Queue Handlers (Processar Envios)
- [ ] Handler para send.text (internal/application/shared/send_text_message.go)
- [ ] Handler para send.media (internal/application/shared/send_media_message.go)
- [ ] Handler para send.button (internal/application/shared/send_button_message.go)
- [ ] Handler para send.list (internal/application/shared/send_list_message.go)
- [ ] Validação de payloads
- [ ] Rate limiting por contato e global

#### 7.5 Main Entry Point
- [ ] Criar cmd/replica-service/main.go
- [ ] Determinar número da réplica (env ou auto-detect)
- [ ] Consumir de whatsapp.replica.{N}
- [ ] Inicializar worker pool interno (200 workers)
- [ ] Health check endpoint

---

### FASE 8: Retry Logic & Reliability (Semana 10)

#### 8.1 Retry Mechanism
- [ ] Implementar retry com exponential backoff (todos os serviços)
- [ ] Configurar max retries por tipo de erro
- [ ] Dead letter queue para mensagens que falharam
- [ ] Logging detalhado de erros com correlation ID

#### 8.2 Circuit Breaker
- [ ] Implementar circuit breaker para WhatsApp
- [ ] Implementar circuit breaker para RabbitMQ
- [ ] Implementar circuit breaker para S3
- [ ] Métricas de circuit breaker state

#### 8.3 Fallback Strategy
- [ ] Salvar mensagens no banco quando RabbitMQ falhar
- [ ] Job para reprocessar mensagens do banco
- [ ] Alertas quando fallback é ativado
- [ ] Dashboard de mensagens em fallback

---

### FASE 9: Security (Semana 11)

#### 9.1 Encryption
- [ ] Criptografar session_data no banco (AES-256)
- [ ] Criptografar credenciais sensíveis
- [ ] HMAC para validação de webhooks
- [ ] TLS/SSL para comunicação RabbitMQ

#### 9.2 Authentication
- [ ] Token-based auth para endpoints admin (Connection Service)
- [ ] Validação de origin para webhooks
- [ ] Rate limiting de requests HTTP
- [ ] IP whitelist para admin endpoints

---

### FASE 10: Observability (Semana 12)

#### 10.1 Logging
- [ ] Structured logging com Zap (todos os serviços)
- [ ] Log levels configuráveis por serviço
- [ ] Correlation IDs para tracking entre serviços
- [ ] Centralização de logs (ELK/Loki)

#### 10.2 Metrics (Prometheus)
- [ ] Contador de mensagens enviadas (por serviço de réplica)
- [ ] Contador de mensagens recebidas (serviço receptivo)
- [ ] Latência de processamento (todos)
- [ ] Taxa de erro por serviço
- [ ] Conexões ativas (serviço de conexão)
- [ ] Número de réplicas ativas
- [ ] Tamanho das filas RabbitMQ

#### 10.3 Tracing (Opcional)
- [ ] OpenTelemetry integration
- [ ] Distributed tracing entre os 3 serviços
- [ ] Trace IDs propagados via RabbitMQ headers

---

### FASE 11: Testing (Semana 13)

#### 11.1 Unit Tests
- [ ] Testes para WhatsApp Client
- [ ] Testes para Session Manager
- [ ] Testes para Queue Handlers (todos os tipos)
- [ ] Testes para Retry Logic
- [ ] Testes para Load Balancer
- [ ] Testes para Health Checker

#### 11.2 Integration Tests
- [ ] Testes de integração com RabbitMQ Exchange
- [ ] Testes de integração com PostgreSQL
- [ ] Testes de integração com S3
- [ ] Testes de comunicação entre os 3 serviços

#### 11.3 E2E Tests
- [ ] Teste completo: Laravel → Réplica → WhatsApp
- [ ] Teste completo: WhatsApp → Receptivo → Laravel
- [ ] Teste de reconexão automática
- [ ] Teste de auto-scaling de réplicas
- [ ] Teste de failover entre réplicas

---

### FASE 12: Docker & Deployment (Semana 14)

#### 12.1 Docker
- [ ] Criar Dockerfile.receptive (multi-stage build)
- [ ] Criar Dockerfile.connection (multi-stage build)
- [ ] Criar Dockerfile.replica (multi-stage build)
- [ ] Configurar docker-compose para desenvolvimento (3 serviços)
- [ ] Documentar variáveis de ambiente de cada serviço

#### 12.2 Kubernetes
- [ ] Criar manifests K8s para Serviço Receptivo
- [ ] Criar manifests K8s para Serviço de Conexão
- [ ] Criar manifests K8s para Serviço de Réplica
- [ ] Configurar HPA para auto-scaling de réplicas
- [ ] Configurar health checks (liveness/readiness) para os 3 serviços
- [ ] ConfigMap para configuração RabbitMQ Exchange
- [ ] Secrets para credenciais
- [ ] Service Mesh (Istio) - Opcional

---

### FASE 13: Documentation (Semana 15)

#### 13.1 Code Documentation
- [ ] Documentar todas as funções públicas (GoDoc)
- [ ] Criar diagramas de arquitetura dos 3 serviços
- [ ] Documentar fluxos de dados entre serviços
- [ ] Documentar estratégia de réplicas

#### 13.2 API Documentation
- [ ] Documentar estrutura de payloads RabbitMQ
- [ ] Documentar routing keys e exchanges
- [ ] Documentar endpoints HTTP (Connection Service)
- [ ] Documentar WebSocket API (status real-time)
- [ ] Exemplos de uso completos

#### 13.3 Operational Documentation
- [ ] Guia de deploy em Kubernetes
- [ ] Guia de troubleshooting
- [ ] Guia de scaling manual e automático
- [ ] Runbook para incidentes comuns

---

## 🔧 Dockerfiles (3 Serviços)

### Dockerfile.receptive (Serviço de Processamento Receptivo)

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build receptive service
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o receptive-service ./cmd/receptive-service

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/receptive-service .

EXPOSE 8081

CMD ["./receptive-service"]
```

### Dockerfile.connection (Serviço de Gerenciamento de Conexões)

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build connection service
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o connection-service ./cmd/connection-service

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/connection-service .

EXPOSE 8082 8083

CMD ["./connection-service"]
```

### Dockerfile.replica (Serviço de Gerenciamento de Réplicas)

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build replica service
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o replica-service ./cmd/replica-service

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/replica-service .

EXPOSE 8084

CMD ["./replica-service"]
```

### docker-compose.yml (Desenvolvimento)

```yaml
version: '3.8'

services:
  # Serviço 1: Processamento Receptivo
  receptive-service:
    build:
      context: .
      dockerfile: Dockerfile.receptive
    env_file:
      - .env.receptive
    depends_on:
      - postgres
      - rabbitmq
    networks:
      - whatsapp-network

  # Serviço 2: Gerenciamento de Conexões
  connection-service:
    build:
      context: .
      dockerfile: Dockerfile.connection
    env_file:
      - .env.connection
    ports:
      - "8082:8082"  # HTTP
      - "8083:8083"  # WebSocket
    depends_on:
      - postgres
      - rabbitmq
    networks:
      - whatsapp-network

  # Serviço 3: Gerenciamento de Réplicas (3 réplicas)
  replica-service-1:
    build:
      context: .
      dockerfile: Dockerfile.replica
    env_file:
      - .env.replica
    environment:
      - REPLICA_NUMBER=1
    depends_on:
      - postgres
      - rabbitmq
      - minio
    networks:
      - whatsapp-network

  replica-service-2:
    build:
      context: .
      dockerfile: Dockerfile.replica
    env_file:
      - .env.replica
    environment:
      - REPLICA_NUMBER=2
    depends_on:
      - postgres
      - rabbitmq
      - minio
    networks:
      - whatsapp-network

  replica-service-3:
    build:
      context: .
      dockerfile: Dockerfile.replica
    env_file:
      - .env.replica
    environment:
      - REPLICA_NUMBER=3
    depends_on:
      - postgres
      - rabbitmq
      - minio
    networks:
      - whatsapp-network

  # Infraestrutura
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: whatsapp_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - whatsapp-network

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - whatsapp-network

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - whatsapp-network

volumes:
  postgres-data:
  rabbitmq-data:
  minio-data:

networks:
  whatsapp-network:
    driver: bridge
```

---

## 🚀 Como Executar

### Desenvolvimento Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/whatsapp-api-go.git
cd whatsapp-api-go

# 2. Instalar dependências
go mod download

# 3. Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# 4. Subir infraestrutura (PostgreSQL, RabbitMQ, MinIO)
docker-compose up -d postgres rabbitmq minio

# 5. Rodar migrations
make migrate

# 6. Executar servidor
go run cmd/server/main.go
```

### Produção (Docker)

```bash
# Build
docker build -t whatsapp-api-go:latest .

# Run
docker run -d \
  --name whatsapp-api \
  --env-file .env \
  -p 8080:8080 \
  whatsapp-api-go:latest
```

---

## 📊 Vantagens da Arquitetura de 3 Serviços

### Comparado com API Monolítica

✅ **Separação de responsabilidades** - cada serviço tem função específica
✅ **Escalabilidade independente** - escalar réplicas sem afetar conexões
✅ **Manutenção facilitada** - atualizar um serviço sem derrubar outros
✅ **Resiliência** - falha em um serviço não afeta os demais
✅ **Deploy independente** - CI/CD por serviço
✅ **Performance otimizada** - cada serviço otimizado para sua função

### Comparado com WuzAPI

✅ **Controle total** sobre a lógica de negócio
✅ **Sem dependência de projetos terceiros**
✅ **Código otimizado** para nosso caso de uso
✅ **Fácil adicionar features** customizadas
✅ **Suporte completo** - não depende de comunidade externa

### Arquitetura Geral

✅ **Exchange + Routing Keys** - roteamento inteligente de mensagens
✅ **1 fila por réplica** - evita sobrecarga (~1000 clientes/réplica)
✅ **Worker pools internos** - Go channels para processamento eficiente
✅ **Filas garantem entrega** - 100% de entrega mesmo se Laravel cair
✅ **Retry automático** com exponential backoff
✅ **Auto-scaling** com Kubernetes HPA
✅ **Observabilidade completa** - logs, métricas, tracing
✅ **WebSocket real-time** - status de conexões em tempo real

---

## 🎯 Próximos Passos

### Fase de Setup

1. **Criar estrutura do projeto** com 3 cmd/ separados
2. **Configurar go.mod** com todas as dependências
3. **Criar .env para cada serviço** (.env.receptive, .env.connection, .env.replica)
4. **Setup RabbitMQ Exchange** (whatsapp.direct)
5. **Setup PostgreSQL** com migrations

### Ordem de Implementação Recomendada

1. **Infraestrutura compartilhada** (FASE 1)
   - Config loader
   - Database client
   - RabbitMQ client com Exchange
   - Logger

2. **WhatsApp Integration** (FASE 2)
   - private-meow wrapper
   - Session Manager
   - Event Handler

3. **RabbitMQ com Exchange** (FASE 3)
   - Setup de Exchange e filas
   - Publisher com routing keys
   - Consumer por réplica
   - Worker pools internos

4. **Serviço de Gerenciamento de Conexões** (FASE 6)
   - QR Code generator
   - HTTP endpoints admin
   - WebSocket para status

5. **Serviço de Processamento Receptivo** (FASE 5)
   - Event processor
   - Webhook sender

6. **Serviço de Gerenciamento de Réplicas** (FASE 7)
   - Load balancer
   - Health checker
   - Queue handlers (send.*)
   - Auto-scaler

7. **Reliability & Security** (FASE 8-9)
8. **Observability** (FASE 10)
9. **Testing** (FASE 11)
10. **Deploy** (FASE 12)

---

## 📚 Recursos Úteis

- **private-meow**: https://github.com/renatokeys/private-meow
- **RabbitMQ Go Client**: https://github.com/rabbitmq/amqp091-go
- **RabbitMQ Exchange Tutorial**: https://www.rabbitmq.com/tutorials/tutorial-four-go.html
- **Go Channels & Workers**: https://gobyexample.com/worker-pools
- **Kubernetes HPA**: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/

---

**Desenvolvido com arquitetura de microserviços robusta, escalável e 100% de entrega garantida via RabbitMQ Exchange + Routing Keys.**
