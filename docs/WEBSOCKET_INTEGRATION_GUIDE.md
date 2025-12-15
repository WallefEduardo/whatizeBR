# 🔌 Guia de Integração WebSocket - Chat em Tempo Real

## ✅ Backend Pronto

Todos os Events estão configurados e fazem broadcast automático:

- `MessageReceived` - Quando mensagem nova chega
- `MessageSent` - Quando mensagem é enviada
- `MessageRead` - Quando mensagem é lida
- `TypingIndicator` - Quando contato está digitando

## 🎯 Como Integrar no Frontend

### 1️⃣ Importar o Hook useWebSocket

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';
```

### 2️⃣ Usar no Componente Chat

```tsx
// resources/js/Pages/Chat/Index.tsx
export default function ChatIndex({ selectedConversation, messages = [] }: Props) {
    const [localMessages, setLocalMessages] = useState(messages);
    const [typingContact, setTypingContact] = useState<string | null>(null);

    // 🔥 WebSocket Hook
    const { sendTypingIndicator } = useWebSocket({
        conversationId: selectedConversation?.id || '',

        // Nova mensagem recebida
        onMessageReceived: (message) => {
            setLocalMessages(prev => [...prev, message]);

            // Tocar som de notificação
            const audio = new Audio('/sounds/notification.mp3');
            audio.play();
        },

        // Mensagem enviada (confirmação)
        onMessageSent: (message) => {
            setLocalMessages(prev =>
                prev.map(msg => msg.id === message.id ? message : msg)
            );
        },

        // Mensagem lida (atualizar checkmarks)
        onMessageRead: (messageId) => {
            setLocalMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, status: 'read' }
                        : msg
                )
            );
        },

        // Indicador de digitação
        onTypingIndicator: (contactName, isTyping) => {
            if (isTyping) {
                setTypingContact(contactName);

                // Limpar depois de 3 segundos
                setTimeout(() => setTypingContact(null), 3000);
            } else {
                setTypingContact(null);
            }
        },
    });

    // Disparar typing quando usuário digita
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);
        sendTypingIndicator(true);

        // Para de digitar depois de 1 segundo
        setTimeout(() => sendTypingIndicator(false), 1000);
    };

    return (
        <AppLayout>
            {/* Mostrar typing indicator */}
            {typingContact && (
                <div className="text-sm text-gray-500">
                    {typingContact} está digitando...
                </div>
            )}

            {/* Renderizar mensagens */}
            {localMessages.map(message => (
                <MessageBubble key={message.id} message={message} />
            ))}
        </AppLayout>
    );
}
```

### 3️⃣ Disparar Events no Backend

Quando receber webhook do WhatsApp (serviço Go), dispare o event:

```php
// app/Jobs/ProcessIncomingMessage.php
use App\Events\WhatsApp\MessageReceived;

public function handle()
{
    $message = Message::create([
        'conversation_id' => $this->conversationId,
        'content' => $this->content,
        // ...
    ]);

    // 🔥 Broadcast automático!
    event(new MessageReceived($message));
}
```

### 4️⃣ Typing Indicator Backend

Criar rota para receber typing indicator:

```php
// routes/api.php
Route::post('/conversations/{conversation}/typing', function (Conversation $conversation) {
    $isTyping = request()->boolean('is_typing');
    $contactName = $conversation->contact->name ?? $conversation->contact->phone;

    event(new TypingIndicator(
        $conversation->id,
        $contactName,
        $isTyping
    ));

    return response()->json(['success' => true]);
});
```

## 🚀 Como Testar

### 1️⃣ Subir Soketi

```bash
docker-compose up -d soketi
```

### 2️⃣ Copiar .env.example para .env

```bash
cp .env.example .env
```

Configurar as variáveis:

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=whatize-app
PUSHER_APP_KEY=whatizeappkey
PUSHER_APP_SECRET=whatizeappsecret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1
```

### 3️⃣ Rebuild Frontend

```bash
npm run build
# ou
npm run dev
```

### 4️⃣ Testar no Terminal

```bash
# Terminal 1: Laravel Pail (ver logs)
php artisan pail

# Terminal 2: Disparar evento manualmente
php artisan tinker
>>> $message = \App\Models\Message::first();
>>> event(new \App\Events\WhatsApp\MessageReceived($message));
```

Deve aparecer no chat **INSTANTANEAMENTE** sem F5!

## 📊 Monitorar WebSocket

Abrir navegador:

```
http://localhost:9601/usage
```

Ver conexões ativas, canais privados, mensagens/segundo, etc.

## 🐛 Troubleshooting

### WebSocket não conecta?

1. Verificar se Soketi está rodando:
   ```bash
   docker ps | grep soketi
   ```

2. Verificar variáveis VITE no browser console:
   ```js
   console.log(import.meta.env.VITE_PUSHER_HOST);
   console.log(import.meta.env.VITE_PUSHER_PORT);
   ```

3. Verificar conexão no DevTools:
   - Abrir DevTools → Network → WS (WebSockets)
   - Deve aparecer: `ws://127.0.0.1:6001/app/whatizeappkey?protocol=7`

### Mensagens não chegam?

1. Verificar se event está sendo disparado:
   ```bash
   php artisan pail
   # Disparar evento manualmente e ver se aparece log
   ```

2. Verificar se canal está correto:
   ```js
   // No browser console
   window.Echo.connector.channels
   // Deve ter: private-conversation.{id}
   ```

3. Verificar autenticação do canal:
   ```php
   // routes/channels.php
   Broadcast::channel('conversation.{conversationId}', ConversationChannel::class);
   ```

## 🎉 Pronto!

Agora seu chat funciona em **TEMPO REAL** sem precisar recarregar a página!

- ✅ Nova mensagem → Aparece instantaneamente
- ✅ Mensagem lida → Checkmarks azuis instantâneos
- ✅ Digitando → "Fulano está digitando..." em tempo real
- ✅ 100% escalável com Soketi
- ✅ Grátis (sem Pusher pago)
