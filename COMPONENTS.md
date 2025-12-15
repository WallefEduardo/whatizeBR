# Componentes UI - WhatsApp Sistema

Lista completa de componentes UI disponíveis no projeto.

## Design System

- **Fonte**: Inter Variable (Google Fonts)
- **Cores Primárias**: Green (#22c55e com variações 50-950)
- **Cores Neutras**: Gray scale completo (50-950)
- **Border Radius Padrão**: 4px
- **Utility Helper**: `cn()` para merge de classes Tailwind

## Componentes Base

### Botões e Inputs

#### Button
**Localização**: `resources/js/Components/UI/Button.tsx`

Variantes:
- `primary` - Verde (#22c55e)
- `secondary` - Cinza escuro
- `outline` - Borda com fundo branco
- `ghost` - Transparente com hover
- `danger` - Vermelho

Tamanhos: `sm`, `md`, `lg`

Props: `variant`, `size`, `isLoading`, `disabled`

---

#### Input
**Localização**: `resources/js/Components/UI/Input.tsx`

Input de texto com label e mensagem de erro integrados.

Props: `label`, `error`, `disabled`

---

#### Textarea
**Localização**: `resources/js/Components/UI/Textarea.tsx`

Textarea com label e mensagem de erro integrados.

Props: `label`, `error`, `disabled`

---

#### Select
**Localização**: `resources/js/Components/UI/Select.tsx`

Select com ícone chevron e opções customizadas.

Props: `label`, `error`, `options`, `disabled`

---

#### Checkbox
**Localização**: `resources/js/Components/UI/Checkbox.tsx`

Checkbox com label opcional e ícone de check.

Props: `label`, `disabled`

---

#### Radio
**Localização**: `resources/js/Components/UI/Radio.tsx`

Radio button com label opcional.

Props: `label`, `disabled`

---

#### Switch
**Localização**: `resources/js/Components/UI/Switch.tsx`

Toggle switch animado (Headless UI).

Props: `checked`, `onChange`, `label`, `disabled`

---

#### DatePicker
**Localização**: `resources/js/Components/UI/DatePicker.tsx`

Input de data com ícone de calendário.

Props: `label`, `error`, `disabled`

---

#### FileUpload
**Localização**: `resources/js/Components/UI/FileUpload.tsx`

Upload de arquivos com drag & drop, preview e validação de tamanho.

Props: `label`, `error`, `maxSize`, `acceptedTypes`, `showPreview`, `onChange`

---

### Navegação e Feedback

#### Modal
**Localização**: `resources/js/Components/UI/Modal.tsx`

Modal com transições suaves (Headless UI).

Props: `show`, `onClose`, `title`, `maxWidth`, `closeable`

Tamanhos: `sm`, `md`, `lg`, `xl`, `2xl`

---

#### ConfirmDialog
**Localização**: `resources/js/Components/UI/ConfirmDialog.tsx`

**⚠️ OBRIGATÓRIO**: Substituir `alert()` e `confirm()` nativos.

Tipos: `info`, `warning`, `danger`, `success`

Props: `show`, `onClose`, `onConfirm`, `title`, `message`, `type`, `confirmText`, `cancelText`, `isLoading`

---

#### Toast
**Localização**: `resources/js/Components/UI/Toast.tsx`

Sistema de notificações toast com Provider e hook.

Uso:
```tsx
// Wrap app com ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Usar hook
const { showToast } = useToast();
showToast('success', 'Título', 'Mensagem');
```

Tipos: `success`, `error`, `warning`, `info`

---

#### Dropdown
**Localização**: `resources/js/Components/UI/Dropdown.tsx`

Menu dropdown com transições (Headless UI).

Props: `trigger`, `items`, `align`

---

#### Tooltip
**Localização**: `resources/js/Components/UI/Tooltip.tsx`

Tooltip com posicionamento customizado.

Props: `content`, `position` (`top`, `bottom`, `left`, `right`)

---

### Layout e Estrutura

#### Card
**Localização**: `resources/js/Components/UI/Card.tsx`

Card com subcomponentes:
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

---

#### Badge
**Localização**: `resources/js/Components/UI/Badge.tsx`

Badge com 6 variantes de cor.

Variantes: `default`, `primary`, `success`, `warning`, `danger`, `info`

---

#### Avatar
**Localização**: `resources/js/Components/UI/Avatar.tsx`

Avatar circular com fallback (ícone ou iniciais).

Tamanhos: `xs`, `sm`, `md`, `lg`, `xl`

Props: `src`, `alt`, `size`, `fallback`

---

#### Loading
**Localização**: `resources/js/Components/UI/Loading.tsx`

Spinner de carregamento animado.

Tamanhos: `sm`, `md`, `lg`

Props: `size`, `text`

---

### Tabelas

#### Table
**Localização**: `resources/js/Components/UI/Table.tsx`

Sistema completo de tabelas com subcomponentes:
- `Table` - Container principal
- `TableHeader` - Cabeçalho
- `TableBody` - Corpo
- `TableFooter` - Rodapé
- `TableRow` - Linha
- `TableHead` - Célula de cabeçalho
- `TableCell` - Célula de dados

---

#### TableActions
**Localização**: `resources/js/Components/UI/TableActions.tsx`

Ações de tabela com ícones em CINZA (#737373).

Componentes:
- `TableAction` - Botão de ação individual
- `TableActions` - Container de ações

Props: `icon` (LucideIcon), `tooltip`, `onClick`

---

#### Pagination
**Localização**: `resources/js/Components/UI/Pagination.tsx`

Paginação completa em português com navegação.

Props: `links`, `from`, `to`, `total`, `onPageChange`

---

## Hook Auxiliar

### useConfirm
**Localização**: `resources/js/hooks/useConfirm.tsx`

Hook para facilitar uso do ConfirmDialog.

Uso:
```tsx
const { ConfirmDialogComponent, confirm } = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Confirmar exclusão',
    message: 'Tem certeza?',
    type: 'danger',
  });

  if (confirmed) {
    // Executar ação
  }
};

return (
  <>
    {ConfirmDialogComponent()}
    <Button onClick={handleDelete}>Excluir</Button>
  </>
);
```

Variante rápida: `useQuickConfirm()` com `confirmDelete()` e `confirmAction()`.

---

## Chat Components (Seção 4.5 - Chat ao Vivo) ✅

### EmojiPicker
**Localização**: `resources/js/Components/Chat/EmojiPicker.tsx`

Seletor de emojis integrado com emoji-picker-react.

Props: `isOpen`, `onClose`, `onEmojiSelect`

---

### AttachmentMenu
**Localização**: `resources/js/Components/Chat/AttachmentMenu.tsx`

Menu de anexos com suporte para:
- Imagem (JPG, PNG, GIF)
- Vídeo (MP4, AVI, MOV)
- Documento (PDF, DOC, XLS)
- Localização
- Contato

Props: `isOpen`, `onClose`, `onFileSelect`, `onLocationSelect`, `onContactSelect`

---

### AudioRecorder
**Localização**: `resources/js/Components/Chat/AudioRecorder.tsx`

Gravador de áudio com WebAudio API, timer e controles de gravação.

Props: `onAudioRecorded`, `onCancel`

---

### QuickReplies
**Localização**: `resources/js/Components/Chat/QuickReplies.tsx`

Respostas rápidas com busca e atalhos (/comando).

Props: `isOpen`, `onClose`, `onSelect`, `quickReplies`

---

### TypingIndicator
**Localização**: `resources/js/Components/Chat/TypingIndicator.tsx`

Indicador de digitação animado (3 dots).

Props: `contactName`

---

### ReplyPreview
**Localização**: `resources/js/Components/Chat/ReplyPreview.tsx`

Preview da mensagem sendo respondida com botão de cancelar.

Props: `message`, `onCancel`

---

### MediaPreview
**Localização**: `resources/js/Components/Chat/MediaPreview.tsx`

Preview de mídia antes de enviar, com campo de legenda opcional.

Suporta: `image`, `video`, `document`

Props: `file`, `type`, `onSend`, `onCancel`

---

### MessageBubble
**Localização**: `resources/js/Components/Chat/MessageBubble.tsx`

Bolha de mensagem completa com suporte a TODOS os tipos:
- ✅ **text** - Mensagem de texto
- ✅ **image** - Imagem com legenda opcional
- ✅ **video** - Vídeo com player e legenda
- ✅ **audio** - Player de áudio
- ✅ **document** - Documento com download
- ✅ **location** - Localização com mapa (Mapbox)
- ✅ **contact** - Cartão de contato
- ✅ **button** - Mensagem com botões interativos
- ✅ **list** - Mensagem com lista de opções
- ✅ **sticker** - Figurinha
- ✅ **reaction** - Reação a mensagem

Props: `message`, `onReply`, `formatTime`, `getStatusCheckmarks`

---

### MessageInput
**Localização**: `resources/js/Components/Chat/MessageInput.tsx`

Input de mensagem COMPLETO integrado com todos os componentes:
- ✅ Emoji picker
- ✅ Menu de anexos (imagem, vídeo, documento)
- ✅ Gravação de áudio
- ✅ Respostas rápidas
- ✅ Reply/Quote de mensagem
- ✅ Auto-resize do textarea
- ✅ Envio com Enter (Shift+Enter para nova linha)
- ✅ Preview de mídia antes de enviar

Props: `onSendText`, `onSendMedia`, `onSendAudio`, `replyingTo`, `onCancelReply`, `disabled`

---

### ColorPicker
**Localização**: `resources/js/Components/UI/ColorPicker.tsx`

Seletor de cores com preset de 12 cores e input customizado (hex).

Preset cores: Verde, Azul, Laranja, Vermelho, Roxo, Pink, Verde esmeralda, Laranja escuro, Indigo, Teal, Rosa, Roxo claro

Props: `value`, `onChange`, `label`, `error`

---

## Páginas CRUD (Fase 6.4) ✅

### Departments/Index
**Localização**: `resources/js/Pages/Departments/Index.tsx`

Página completa de CRUD de Departamentos com:
- ✅ Lista com Table component
- ✅ Modal de criação
- ✅ Modal de edição
- ✅ ColorPicker para cores
- ✅ Toggle ativo/inativo
- ✅ ConfirmDialog para exclusão
- ✅ Contagem de membros e conversas

---

### Tags/Index
**Localização**: `resources/js/Pages/Tags/Index.tsx`

Página completa de CRUD de Tags com:
- ✅ Lista com Table component
- ✅ Modal de criação
- ✅ Modal de edição
- ✅ ColorPicker para cores
- ✅ ConfirmDialog para exclusão
- ✅ Contagem de conversas e contatos
- ✅ Preview da tag com cor

---

### Members/Index
**Localização**: `resources/js/Pages/Members/Index.tsx`

Página completa de CRUD de Membros com:
- ✅ Lista com Table component
- ✅ Modal de criação
- ✅ Modal de edição
- ✅ Select de usuários e departamentos
- ✅ Max concurrent chats (slider visual)
- ✅ Toggle ativo/inativo
- ✅ ConfirmDialog para remoção
- ✅ Barra de progresso de utilização
- ✅ Slots disponíveis

---

## Importação

Todos os componentes podem ser importados de:

```tsx
// UI Base
import { Button, Input, Modal, ConfirmDialog, ... } from '@/Components/UI';
import ColorPicker from '@/Components/UI/ColorPicker';

// Chat Components
import EmojiPicker from '@/Components/Chat/EmojiPicker';
import AttachmentMenu from '@/Components/Chat/AttachmentMenu';
import AudioRecorder from '@/Components/Chat/AudioRecorder';
import QuickReplies from '@/Components/Chat/QuickReplies';
import TypingIndicator from '@/Components/Chat/TypingIndicator';
import ReplyPreview from '@/Components/Chat/ReplyPreview';
import MediaPreview from '@/Components/Chat/MediaPreview';
import MessageBubble from '@/Components/Chat/MessageBubble';
import MessageInput from '@/Components/Chat/MessageInput';
```
