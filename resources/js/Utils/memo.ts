/**
 * Utilitários para memoização e otimização de performance
 */

/**
 * Debounce function - Atrasa execução até que não seja chamada por X ms
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   api.search(query);
 * }, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - Limita execução a uma vez a cada X ms
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scrolling...');
 * }, 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize simples para funções puras
 *
 * @example
 * const expensiveCalculation = memoize((n: number) => {
 *   return n * n;
 * });
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  };
}

/**
 * Deep equality check otimizado
 *
 * Útil para comparação em React.memo e useMemo
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Batch updates para evitar re-renders desnecessários
 *
 * @example
 * const batchedUpdate = createBatchedUpdate();
 * batchedUpdate(() => setState1(val1));
 * batchedUpdate(() => setState2(val2));
 * batchedUpdate(() => setState3(val3));
 * // Todos os updates acontecem em um único render
 */
export function createBatchedUpdate() {
  let queue: Array<() => void> = [];
  let isScheduled = false;

  const flush = () => {
    const updates = [...queue];
    queue = [];
    isScheduled = false;

    updates.forEach((update) => update());
  };

  return (update: () => void) => {
    queue.push(update);

    if (!isScheduled) {
      isScheduled = true;
      Promise.resolve().then(flush);
    }
  };
}
