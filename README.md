# BizLink AI - Enterprise Installation Guide

## 🐧 CentOS 7 / RHEL 7 Deployment

BizLink AI is designed to run in a high-performance Linux environment. Because CentOS 7 repos are often dated, we recommend using the provided `install.sh` which configures modern NodeSource and PHP repositories automatically.

### Prerequisites
- SSH access with sudo/root privileges.
- A clean CentOS 7 minimal install is preferred.
- MySQL 5.7+ or MariaDB 10.3+.

### Step-by-Step Setup
1. **Extract the ZIP** to your web directory (e.g., `/var/www/bizlink`).
2. **Execute Installation**:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. **Database Import**:
   ```bash
   # Log into MySQL and create the database first
   mysql -u root -p -e "CREATE DATABASE bizlink_ai;"
   # Import the schema
   mysql -u root -p bizlink_ai < schema.sql
   ```
4. **Configuration**: 
   Edit the `.env` file to include your `API_KEY` from Google Gemini.

### Production Serving (Nginx Example)
We recommend using **PM2** to keep the Node.js server running:
```bash
npm install -g pm2
pm2 start server.js --name "bizlink-api"
```

Then, configure Nginx to proxy requests:
```nginx
server {
    listen 80;
    server_name your-agency-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php-fpm/php-fpm.sock;
        fastcgi_index api.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

---
© 2024 BizLink AI Engineering. All Rights Reserved.
