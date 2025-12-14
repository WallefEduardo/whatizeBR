# Docker - Ambiente de Desenvolvimento

## Serviços Disponíveis

- **Nginx** - Web Server (porta 80)
- **PHP-FPM 8.2** - Application
- **PostgreSQL 16** - Database (porta 5432)
- **Redis 7** - Cache & Queue (porta 6379)
- **RabbitMQ** - Message Queue (porta 5672, Management: 15672)
- **MinIO** - Object Storage S3-compatible (porta 9000, Console: 9001)
- **Worker** - Laravel Queue Worker

## Comandos Rápidos

### Subir todos os containers
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Parar containers
```bash
docker-compose down
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Executar comandos no container PHP
```bash
# Rodar migrations
docker-compose exec php php artisan migrate

# Rodar seeders
docker-compose exec php php artisan db:seed

# Instalar dependências
docker-compose exec php composer install

# Gerar key
docker-compose exec php php artisan key:generate

# Limpar cache
docker-compose exec php php artisan cache:clear
docker-compose exec php php artisan config:clear
docker-compose exec php php artisan route:clear
docker-compose exec php php artisan view:clear

# Entrar no container
docker-compose exec php bash
```

### Acessar PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d whatize
```

### Acessar Redis
```bash
docker-compose exec redis redis-cli
```

## URLs de Acesso

- **Aplicação**: http://localhost
- **RabbitMQ Management**: http://localhost:15672 (user: `whatize`, pass: `secret`)
- **MinIO Console**: http://localhost:9001 (user: `whatize`, pass: `secret123`)

## Credenciais Padrão

### PostgreSQL
- Host: `postgres` (dentro do Docker) ou `localhost:5432` (fora do Docker)
- Database: `whatize`
- Username: `postgres`
- Password: `secret`

### Redis
- Host: `redis` (dentro do Docker) ou `localhost:6379` (fora do Docker)
- Password: (none)

### RabbitMQ
- Host: `rabbitmq` (dentro do Docker) ou `localhost:5672` (fora do Docker)
- Username: `whatize`
- Password: `secret`
- Management UI: http://localhost:15672

### MinIO
- Endpoint: `http://minio:9000` (dentro do Docker) ou `http://localhost:9000` (fora do Docker)
- Access Key: `whatize`
- Secret Key: `secret123`
- Console: http://localhost:9001

## Primeira Execução

```bash
# 1. Copiar .env para Docker
cp .env.docker .env

# 2. Subir containers
docker-compose up -d

# 3. Instalar dependências
docker-compose exec php composer install
docker-compose exec php npm install

# 4. Gerar key (se necessário)
docker-compose exec php php artisan key:generate

# 5. Rodar migrations
docker-compose exec php php artisan migrate

# 6. Build assets
docker-compose exec php npm run build

# 7. Criar storage link
docker-compose exec php php artisan storage:link
```

## Troubleshooting

### Erro de permissão
```bash
docker-compose exec php chown -R www-data:www-data /var/www/storage
docker-compose exec php chmod -R 775 /var/www/storage
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker-compose up -d --build
```

### Ver status dos containers
```bash
docker-compose ps
```

### Ver uso de recursos
```bash
docker stats
```

## Volumes Persistentes

Os dados são salvos em volumes Docker:
- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `rabbitmq_data` - Dados do RabbitMQ
- `minio_data` - Arquivos do MinIO

Para limpar volumes:
```bash
docker-compose down -v
```
