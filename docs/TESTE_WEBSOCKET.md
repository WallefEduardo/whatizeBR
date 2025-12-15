# Como Testar o WebSocket (Soketi)

## ✅ Pré-requisitos

1. Soketi rodando no Docker:
```bash
docker-compose ps | grep soketi
# Deve mostrar: whatize_soketi ... Up
```

2. Vite rodando com variáveis carregadas:
```bash
npm run dev
# Reinicie se não reiniciou ainda!
```

3. Laravel serve rodando:
```bash
php artisan serve
```

---

## 🧪 TESTE 1: Verificar Conexão no Console

### Passo 1: Abrir o Chat
1. Acesse: http://localhost:8000/chat
2. Faça login se necessário
3. Clique em qualquer conversa

### Passo 2: Abrir DevTools
1. Pressione **F12** (ou Ctrl+Shift+I)
2. Vá na aba **Console**

### Passo 3: Verificar Mensagens
Deve aparecer no console:

✅ **Sucesso:**
```
WebSocket: Connecting to conversation.{id}
Pusher: Connection to socket established
```

❌ **Erro (tela branca):**
```
Uncaught You must pass your app key when you instantiate Pusher
```
> Solução: Reiniciar `npm run dev`

❌ **Erro (não conecta):**
```
WebSocket connection failed
```
> Solução: Verificar se Soketi está rodando: `docker-compose ps`

---

## 🧪 TESTE 2: Monitorar Soketi Dashboard

### Acesse o Dashboard
Abra em outra aba: **http://localhost:9601**

### O que você deve ver:
- **Connections**: Número de conexões ativas (deve ter 1+ quando você está no chat)
- **Channels**: Lista de canais ativos (deve aparecer `private-conversation.{id}`)
- **Messages**: Contador de mensagens broadcast

---

## 🧪 TESTE 3: Disparar Evento Manualmente (Mensagem)

### Passo 1: Estar no Chat
1. Abra o chat: http://localhost:8000/chat
2. Selecione uma conversa
3. Deixe o DevTools Console aberto (F12)

### Passo 2: Disparar Evento
Em **OUTRA ABA** do navegador, acesse:
```
http://localhost:8000/test/websocket/message
```

### Passo 3: Verificar Resultado

✅ **Deve acontecer:**
1. Nova mensagem aparece **instantaneamente** no chat (sem refresh!)
2. Console mostra: `WebSocket: Message received`
3. A mensagem diz: "Mensagem de teste do WebSocket! {hora}"

❌ **Não funcionou?**
- Verifique console: tem algum erro?
- Soketi está rodando? `docker-compose ps`
- Tem conversas no banco? Se não, crie uma primeiro

---

## 🧪 TESTE 4: Typing Indicator

### Passo 1: Estar no Chat
1. Abra o chat: http://localhost:8000/chat
2. Selecione uma conversa
3. Observe a área logo abaixo do header do chat

### Passo 2: Disparar Typing
Em **OUTRA ABA**, acesse:
```
http://localhost:8000/test/websocket/typing
```

### Passo 3: Verificar Resultado

✅ **Deve acontecer:**
1. Aparece "{Nome do Contato} está digitando..." logo abaixo do header
2. A mensagem some após 3 segundos
3. Console mostra: `WebSocket: Typing indicator`

---

## 🧪 TESTE 5: Testar Envio Real

### Passo 1: Configurar
Você precisa ter:
- WhatsApp API configurada
- Instância conectada
- Um número de teste

### Passo 2: Enviar Mensagem
1. No chat, digite uma mensagem
2. Aperte Enter ou clique em Enviar

### Passo 3: Verificar
✅ **Deve acontecer:**
1. Mensagem aparece com **status "pending"** (spinner girando)
2. Após envio via API, status muda para **"sent"** (1 check)
3. Após entrega, muda para **"delivered"** (2 checks cinza)
4. Após leitura, muda para **"read"** (2 checks azuis)

Tudo isso acontece **em tempo real sem refresh!**

---

## 🧪 TESTE 6: Verificar Logs do Soketi

```bash
docker-compose logs -f soketi
```

### O que procurar:
✅ **Conexões:**
```json
{
  "event": "pusher:connection_established",
  "data": "{\"socket_id\":\"...\"}"
}
```

✅ **Subscribe em canal:**
```json
{
  "channel": "private-conversation.{id}"
}
```

✅ **Broadcast de mensagens:**
```json
{
  "event": "message.received",
  "channel": "private-conversation.{id}"
}
```

---

## 📊 Checklist Completo

Use este checklist para validar que está tudo funcionando:

### Backend
- [x] Soketi rodando (docker-compose ps)
- [x] .env com BROADCAST_CONNECTION=pusher
- [x] .env com variáveis PUSHER_* configuradas
- [x] Events implementados (MessageReceived, MessageSent, etc)
- [x] ConversationChannel com autorização

### Frontend
- [x] Vite reiniciado após adicionar variáveis
- [x] bootstrap.ts configurado com Echo
- [x] useWebSocket hook criado
- [x] Chat/Index.tsx usando useWebSocket
- [x] Console sem erros de Pusher/Echo

### Testes Funcionais
- [ ] Console mostra "Connection established"
- [ ] Dashboard Soketi mostra conexão ativa
- [ ] Teste manual de mensagem funciona
- [ ] Teste manual de typing funciona
- [ ] Mensagens aparecem em tempo real
- [ ] Status atualiza em tempo real
- [ ] Typing indicator funciona

---

## 🐛 Troubleshooting

### Tela Branca
**Causa:** Variáveis VITE_PUSHER_* não carregadas
**Solução:** Ctrl+C no `npm run dev` e rodar de novo

### "You must pass your app key"
**Causa:** Mesma coisa - variáveis não carregadas
**Solução:** Reiniciar Vite

### "WebSocket connection failed"
**Causa:** Soketi não está rodando
**Solução:** `docker-compose up -d soketi`

### Mensagens não aparecem em tempo real
**Causa:** Echo não conectou ao canal
**Solução:** Verificar console - tem mensagem de "Connecting to conversation.{id}"?

### Eventos não disparam
**Causa:** BROADCAST_CONNECTION não está como "pusher"
**Solução:** Verificar .env e reiniciar Laravel (php artisan serve)

### Unauthorized (403) ao conectar
**Causa:** ConversationChannel negando acesso
**Solução:** Verificar se usuário logado tem permissão na conversa

---

## 🎯 Resultado Esperado

Se **TUDO** estiver funcionando:

1. ✅ Você entra no chat
2. ✅ Console mostra conexão estabelecida
3. ✅ Soketi dashboard mostra 1 conexão ativa
4. ✅ Você acessa `/test/websocket/message`
5. ✅ Mensagem aparece **instantaneamente** no chat
6. ✅ Você acessa `/test/websocket/typing`
7. ✅ Aparece "{nome} está digitando..."
8. ✅ Você digita no chat
9. ✅ Typing indicator é enviado (ver logs Soketi)
10. ✅ Você envia mensagem
11. ✅ Status muda de pending → sent → delivered → read

**Parabéns! WebSocket funcionando 100%!** 🎉
