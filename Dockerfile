FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    libicu-dev \
    libpq5 \
    postgresql-client \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip exif pcntl bcmath gd intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy code
WORKDIR /var/www
COPY service-api/composer.json service-api/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy rest
COPY service-api ./

RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www/var

CMD ["php-fpm"]

