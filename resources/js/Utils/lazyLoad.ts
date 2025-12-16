import { lazy, ComponentType } from 'react';

/**
 * Wrapper para lazy loading com retry automático
 *
 * Útil para quando o carregamento falha por problemas de rede
 *
 * @example
 * const Dashboard = lazyWithRetry(() => import('@/Pages/Dashboard'));
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
) {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }

            console.warn(
              `Failed to load component, retrying... (${retriesLeft} attempts left)`
            );

            setTimeout(() => {
              attemptImport(retriesLeft - 1);
            }, interval);
          });
      };

      attemptImport(retries);
    });
  });
}

/**
 * Preload de componente para melhorar UX
 *
 * Carrega o componente em background antes do usuário navegar
 *
 * @example
 * const Dashboard = lazyWithRetry(() => import('@/Pages/Dashboard'));
 * // Preload quando usuário passar o mouse no link
 * <Link onMouseEnter={() => preloadComponent(Dashboard)}>Dashboard</Link>
 */
export function preloadComponent<T extends ComponentType<any>>(
  Component: React.LazyExoticComponent<T>
) {
  const componentModule = (Component as any)._payload;
  if (componentModule && componentModule._status === 'pending') {
    componentModule._result();
  }
}
