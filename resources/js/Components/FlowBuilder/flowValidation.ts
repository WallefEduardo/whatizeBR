import { Node, Edge } from '@xyflow/react';

export interface ValidationError {
    type: 'error' | 'warning';
    message: string;
    nodeId?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validate a chatbot flow
 */
export function validateFlow(nodes: Node[], edges: Edge[]): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if there's at least one node
    if (nodes.length === 0) {
        errors.push({
            type: 'error',
            message: 'O fluxo deve ter pelo menos um nó',
        });
        return { isValid: false, errors };
    }

    // Check for start node
    const startNodes = nodes.filter((node) => node.type === 'start');
    if (startNodes.length === 0) {
        errors.push({
            type: 'error',
            message: 'O fluxo deve ter um nó de Início',
        });
    } else if (startNodes.length > 1) {
        errors.push({
            type: 'error',
            message: 'O fluxo deve ter apenas um nó de Início',
        });
    }

    // Check for end node
    const endNodes = nodes.filter((node) => node.type === 'end');
    if (endNodes.length === 0) {
        errors.push({
            type: 'warning',
            message: 'Recomenda-se adicionar pelo menos um nó de Fim',
        });
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach((edge) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    const startNode = startNodes[0];
    if (startNode) {
        const reachableNodes = getReachableNodes(startNode.id, edges);

        nodes.forEach((node) => {
            if (node.type !== 'start' && !reachableNodes.has(node.id)) {
                errors.push({
                    type: 'warning',
                    message: `Nó "${node.data.label || node.type}" não está conectado ao fluxo principal`,
                    nodeId: node.id,
                });
            }
        });
    }

    // Validate individual nodes
    nodes.forEach((node) => {
        const nodeErrors = validateNode(node, edges);
        errors.push(...nodeErrors);
    });

    // Check for circular dependencies (infinite loops)
    const cycles = detectCycles(nodes, edges);
    if (cycles.length > 0) {
        errors.push({
            type: 'warning',
            message: 'Detectado possível loop infinito no fluxo. Certifique-se de que há condições de saída.',
        });
    }

    const isValid = errors.filter((e) => e.type === 'error').length === 0;
    return { isValid, errors };
}

/**
 * Validate individual node
 */
function validateNode(node: Node, edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);

    switch (node.type) {
        case 'start':
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Início deve estar conectado a outro nó',
                    nodeId: node.id,
                });
            }
            break;

        case 'text':
            if (!node.data.message || node.data.message.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Texto deve ter uma mensagem',
                    nodeId: node.id,
                });
            }
            if (!node.data.wait_for_response && outgoingEdges.length === 0) {
                errors.push({
                    type: 'warning',
                    message: 'Nó de Texto sem conexão de saída',
                    nodeId: node.id,
                });
            }
            break;

        case 'button':
            if (!node.data.message || node.data.message.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Botões deve ter uma mensagem',
                    nodeId: node.id,
                });
            }
            if (!node.data.buttons || node.data.buttons.length === 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Botões deve ter pelo menos um botão',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Botões deve estar conectado a outro nó',
                    nodeId: node.id,
                });
            }
            break;

        case 'list':
            if (!node.data.message || node.data.message.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Lista deve ter uma mensagem',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Lista deve estar conectado a outro nó',
                    nodeId: node.id,
                });
            }
            break;

        case 'media':
            if (!node.data.media_url || node.data.media_url.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Mídia deve ter uma URL',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'warning',
                    message: 'Nó de Mídia sem conexão de saída',
                    nodeId: node.id,
                });
            }
            break;

        case 'delay':
            if (!node.data.delay_seconds || node.data.delay_seconds < 1) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Delay deve ter pelo menos 1 segundo',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Delay deve estar conectado a outro nó',
                    nodeId: node.id,
                });
            }
            break;

        case 'condition':
            if (!node.data.variable || node.data.variable.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Condição deve ter uma variável',
                    nodeId: node.id,
                });
            }
            if (node.data.value === undefined || node.data.value === null || node.data.value === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de Condição deve ter um valor',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length < 2) {
                errors.push({
                    type: 'warning',
                    message: 'Nó de Condição deve ter duas saídas (verdadeiro e falso)',
                    nodeId: node.id,
                });
            }
            break;

        case 'api':
            if (!node.data.url || node.data.url.trim() === '') {
                errors.push({
                    type: 'error',
                    message: 'Nó de API deve ter uma URL',
                    nodeId: node.id,
                });
            }
            if (outgoingEdges.length === 0) {
                errors.push({
                    type: 'warning',
                    message: 'Nó de API sem conexão de saída',
                    nodeId: node.id,
                });
            }
            break;

        case 'transfer':
            if (outgoingEdges.length > 0) {
                errors.push({
                    type: 'warning',
                    message: 'Nó de Transferir geralmente não precisa de conexões de saída (encerra o bot)',
                    nodeId: node.id,
                });
            }
            break;

        case 'end':
            if (outgoingEdges.length > 0) {
                errors.push({
                    type: 'error',
                    message: 'Nó de Fim não pode ter conexões de saída',
                    nodeId: node.id,
                });
            }
            break;
    }

    return errors;
}

/**
 * Get all nodes reachable from a starting node
 */
function getReachableNodes(startNodeId: string, edges: Edge[]): Set<string> {
    const reachable = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (reachable.has(currentId)) continue;

        reachable.add(currentId);

        const outgoing = edges.filter((edge) => edge.source === currentId);
        outgoing.forEach((edge) => {
            if (!reachable.has(edge.target)) {
                queue.push(edge.target);
            }
        });
    }

    return reachable;
}

/**
 * Detect cycles in the flow (simplified cycle detection)
 */
function detectCycles(nodes: Node[], edges: Edge[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(nodeId: string, path: string[]): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);

        const outgoing = edges.filter((edge) => edge.source === nodeId);

        for (const edge of outgoing) {
            if (!visited.has(edge.target)) {
                if (dfs(edge.target, [...path])) {
                    return true;
                }
            } else if (recursionStack.has(edge.target)) {
                cycles.push([...path, edge.target]);
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

    nodes.forEach((node) => {
        if (!visited.has(node.id)) {
            dfs(node.id, []);
        }
    });

    return cycles;
}

/**
 * Get the start node ID from the flow
 */
export function getStartNodeId(nodes: Node[]): string | null {
    const startNode = nodes.find((node) => node.type === 'start');
    return startNode?.id || null;
}

/**
 * Convert React Flow nodes/edges to backend format
 */
export function convertToBackendFormat(nodes: Node[], edges: Edge[]) {
    return {
        nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data,
            position: node.position,
        })),
        edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: edge.data,
        })),
        start_node_id: getStartNodeId(nodes),
    };
}
