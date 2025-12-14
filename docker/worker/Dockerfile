FROM php:8.2-cli

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    zip \
    unzip

# Limpar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP
RUN docker-php-ext-install pdo pdo_pgsql pgsql pcntl

# Instalar Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Configurar working directory
WORKDIR /var/www

# Copiar arquivos do projeto
COPY . .

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

CMD ["php", "artisan", "queue:work", "--sleep=3", "--tries=3", "--max-time=3600"]
