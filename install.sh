
#!/bin/bash

# BizLink AI - Local AI (Ollama) & CWP/Apache Installer
# Optimized for CentOS 7 / RHEL 7 / Node.js 16

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}        BIZLINK AI - NODE 16 DEPLOYMENT            ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Identity Check
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (sudo ./install.sh)${NC}"
  exit
fi

# 2. Setup Inputs
echo -e "${YELLOW}CWP Environment Setup:${NC}"
read -p "Enter your CWP Username: " CWP_USER
read -p "Enter MariaDB Root Password: " DB_PASS
read -p "Which Ollama Model to install? (llama3, mistral, phi3) [llama3]: " AI_MODEL
AI_MODEL=${AI_MODEL:-llama3}

# Set Path
TARGET_DIR="/home/$CWP_USER/public_html"
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory $TARGET_DIR not found. Create account in CWP first.${NC}"
    exit
fi

# 3. System Core Dependencies (Node 16)
echo -e "\n${BLUE}[1/6] Installing Node.js 16 & Core Tools...${NC}"
yum install -y epel-release pciutils
if ! command -v node &> /dev/null; then
    # Targeting Node 16 legacy repository
    curl -sL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
fi
npm install -g pm2

# 4. Ollama Installation & Setup
echo -e "\n${BLUE}[2/6] Installing Ollama AI Engine...${NC}"
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    echo "Ollama installed."
else
    echo "Ollama is already installed."
fi

systemctl enable ollama || true
systemctl start ollama || true

echo -e "${YELLOW}Pulling AI Model: $AI_MODEL...${NC}"
ollama pull $AI_MODEL

# 5. Environment & Database
echo -e "\n${BLUE}[3/6] Configuring .env for Local Engine...${NC}"
cat <<EOT > "$TARGET_DIR/.env"
PORT=3000
NODE_ENV=production
OLLAMA_HOST=http://linkteam.us:11434
AI_MODEL=$AI_MODEL
DB_HOST=localhost
DB_USER=root
DB_PASS=$DB_PASS
DB_NAME=bizlink_ai
EOT

mysql -u root -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS bizlink_ai;"
if [ -f "$TARGET_DIR/schema.sql" ]; then
    mysql -u root -p"$DB_PASS" bizlink_ai < "$TARGET_DIR/schema.sql"
fi

# 6. Apache .htaccess Proxy
echo -e "\n${BLUE}[4/6] Configuring Apache Proxy...${NC}"
cat <<EOT > "$TARGET_DIR/.htaccess"
# BizLink AI - CWP Proxy Configuration
Options -Indexes
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^api/(.*)$ http://localhost:3000/api/\$1 [P,L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
EOT

# 7. NPM & Permissions
echo -e "\n${BLUE}[5/6] Finalizing Files...${NC}"
cd "$TARGET_DIR"
npm install --production

chown -R $CWP_USER:$CWP_USER "$TARGET_DIR"
find "$TARGET_DIR" -type d -exec chmod 755 {} \;
find "$TARGET_DIR" -type f -exec chmod 644 {} \;

# 8. Start with PM2
echo -e "\n${BLUE}[6/6] Launching Application...${NC}"
pm2 delete bizlink-ai || true
sudo -u $CWP_USER pm2 start server.js --name "bizlink-ai"
sudo -u $CWP_USER pm2 save

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}      BIZLINK AI DEPLOYED ON NODE 16!               ${NC}"
echo -e "${GREEN}====================================================${NC}"
