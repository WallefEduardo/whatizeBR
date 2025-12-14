# Componentes Reutilizáveis

> **Atualizar este arquivo sempre que criar novos componentes**
>
> **Ver detalhes completos em:** [COMPONENTES_ESPECIALIZADOS.md](COMPONENTES_ESPECIALIZADOS.md)

## UI Base

- `resources/js/Components/UI/Button.tsx` - Button ✅
- `resources/js/Components/UI/Input.tsx` - Input ✅
- `resources/js/Components/UI/Select.tsx` - Select ✅
- `resources/js/Components/UI/Modal.tsx` - Modal ✅
- `resources/js/Components/UI/ConfirmDialog.tsx` - ConfirmDialog ✅
- `resources/js/Components/UI/Badge.tsx` - Badge ✅
- `resources/js/Components/UI/Card.tsx` - Card ✅
- `resources/js/Components/UI/Avatar.tsx` - Avatar ✅
- `resources/js/Components/UI/Dropdown.tsx` - Dropdown ✅
- `resources/js/Components/UI/Tooltip.tsx` - Tooltip ✅
- `resources/js/Components/UI/Toast.tsx` - Toast ✅
- `resources/js/Components/UI/Switch.tsx` - Switch ✅
- `resources/js/Components/UI/Checkbox.tsx` - Checkbox ✅
- `resources/js/Components/UI/Radio.tsx` - Radio ✅
- `resources/js/Components/UI/Textarea.tsx` - Textarea ✅
- `resources/js/Components/UI/DatePicker.tsx` - DatePicker ✅
- `resources/js/Components/UI/FileUpload.tsx` - FileUpload ✅
- `resources/js/Components/UI/Loading.tsx` - Loading ✅

## UI Advanced (com busca e features especiais)

- `resources/js/Components/Specialized/DateTimePicker.tsx` - DateTimePicker ⭐ ✅
- `resources/js/Components/Specialized/SearchableSelect.tsx` - SearchableSelect ⭐ ✅
- `resources/js/Components/Specialized/MultiSelect.tsx` - MultiSelect ⭐ ✅
- `resources/js/Components/Specialized/CurrencyInput.tsx` - CurrencyInput ⭐ ✅

## Table

- `resources/js/Components/UI/Table.tsx` - Table ✅
- `resources/js/Components/UI/TableActions.tsx` - TableActions ✅
- `resources/js/Components/UI/Pagination.tsx` - Pagination ✅

## Layout

- `resources/js/Components/Specialized/Breadcrumbs.tsx` - Breadcrumbs ✅
- `resources/js/Components/Layout/AppLayout.tsx` - AppLayout (futuro)
- `resources/js/Components/Layout/Sidebar.tsx` - Sidebar (futuro)
- `resources/js/Components/Layout/Navbar.tsx` - Navbar (futuro)
- `resources/js/Components/Layout/ThemeToggle.tsx` - ThemeToggle (futuro)

## Chat

- `resources/js/Components/Chat/ChatList.tsx` - ChatList
- `resources/js/Components/Chat/ConversationItem.tsx` - ConversationItem
- `resources/js/Components/Chat/ChatWindow.tsx` - ChatWindow
- `resources/js/Components/Chat/MessageBubble.tsx` - MessageBubble
- `resources/js/Components/Chat/MessageInput.tsx` - MessageInput
- `resources/js/Components/Chat/AttachmentMenu.tsx` - AttachmentMenu
- `resources/js/Components/Chat/EmojiPicker.tsx` - EmojiPicker
- `resources/js/Components/Chat/TypingIndicator.tsx` - TypingIndicator
- `resources/js/Components/Chat/MediaPreview.tsx` - MediaPreview
- `resources/js/Components/Chat/QuickReplies.tsx` - QuickReplies

## Chatbot

- `resources/js/Components/Chatbot/FlowBuilder.tsx` - FlowBuilder
- `resources/js/Components/Chatbot/FlowCanvas.tsx` - FlowCanvas
- `resources/js/Components/Chatbot/NodePalette.tsx` - NodePalette
- `resources/js/Components/Chatbot/NodeEditor.tsx` - NodeEditor
- `resources/js/Components/Chatbot/FlowSimulator.tsx` - FlowSimulator
- `resources/js/Components/Chatbot/Nodes/StartNode.tsx` - StartNode
- `resources/js/Components/Chatbot/Nodes/TextNode.tsx` - TextNode
- `resources/js/Components/Chatbot/Nodes/ButtonNode.tsx` - ButtonNode
- `resources/js/Components/Chatbot/Nodes/ListNode.tsx` - ListNode
- `resources/js/Components/Chatbot/Nodes/MediaNode.tsx` - MediaNode
- `resources/js/Components/Chatbot/Nodes/DelayNode.tsx` - DelayNode
- `resources/js/Components/Chatbot/Nodes/ConditionNode.tsx` - ConditionNode
- `resources/js/Components/Chatbot/Nodes/ApiNode.tsx` - ApiNode
- `resources/js/Components/Chatbot/Nodes/TransferNode.tsx` - TransferNode
- `resources/js/Components/Chatbot/Nodes/EndNode.tsx` - EndNode

## Dashboard

- `resources/js/Components/Dashboard/StatsCard.tsx` - StatsCard
- `resources/js/Components/Dashboard/ConversationsChart.tsx` - ConversationsChart
- `resources/js/Components/Dashboard/ResponseTimeChart.tsx` - ResponseTimeChart
- `resources/js/Components/Dashboard/AgentPerformance.tsx` - AgentPerformance
- `resources/js/Components/Dashboard/RecentActivity.tsx` - RecentActivity

## Common

- `resources/js/Components/Common/SearchBar.tsx` - SearchBar
- `resources/js/Components/Common/FilterPanel.tsx` - FilterPanel
- `resources/js/Components/Common/LoadingSpinner.tsx` - LoadingSpinner
- `resources/js/Components/Common/EmptyState.tsx` - EmptyState
- `resources/js/Components/Common/ErrorBoundary.tsx` - ErrorBoundary

## Hooks

- `resources/js/hooks/useConfirm.tsx` - useConfirm ✅
- `resources/js/contexts/ThemeContext.tsx` - ThemeProvider + useTheme ✅
- `resources/js/Hooks/useWebSocket.ts` - useWebSocket (futuro)
- `resources/js/Hooks/useDebounce.ts` - useDebounce (futuro)
- `resources/js/Hooks/useMediaQuery.ts` - useMediaQuery (futuro)

## Regras Importantes

- ❌ **NUNCA usar `alert()`, `confirm()` ou `prompt()` nativos**
- ✅ Sempre usar `ConfirmDialog` com hook `useConfirm`
- ✅ Ícones de ações em tabelas devem ser em CINZA (#737373)
- ✅ Border-radius padrão: 4px (botões, inputs, cards)
- ✅ Todos os componentes devem ter no máximo 200-300 linhas
