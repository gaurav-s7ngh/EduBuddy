# api/Dockerfile

# Use PHP with Apache (compatible with your .htaccess)
FROM php:8.2-apache

# Install the PDO MySQL extension (required for your db.php)
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite (required for .htaccess)
RUN a2enmod rewrite

# Copy your API files into the server
COPY . /var/www/html/

# Set permissions so Apache can read the files
RUN chown -R www-data:www-data /var/www/html