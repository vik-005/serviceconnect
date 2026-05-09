#!/bin/bash
# Quick Start - Chat Application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  🚀 SERVI-CONNECT - CHAT APPLICATION LAUNCHER${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"

# Check prerequisites
echo -e "${YELLOW}1️⃣  Checking Prerequisites...${NC}"

# Check PHP
if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP not found. Please install PHP 8.2+${NC}"
    exit 1
fi
PHP_VERSION=$(php -v | grep -oP 'PHP \K[0-9.]+' | head -1)
echo -e "${GREEN}✅ PHP ${PHP_VERSION} found${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ ${NODE_VERSION} found${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null && ! command -v mysqld &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL/MariaDB not in PATH (but may still be running)${NC}"
else
    echo -e "${GREEN}✅ MySQL/MariaDB found${NC}"
fi

echo -e "\n${YELLOW}2️⃣  Checking Database Connection...${NC}"
# Check database
if mysql -h localhost -u root -e "SELECT 1" &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection OK${NC}"
    # Check if conseve database exists
    if mysql -h localhost -u root -e "USE conseve" &>/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database 'conseve' exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Database 'conseve' not found (will be created on first run)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database connection failed (ensure MariaDB is running)${NC}"
fi

# Menu
echo -e "\n${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Choose what to launch:${NC}"
echo -e "${GREEN}1${NC} - API Backend (Symfony) only"
echo -e "${GREEN}2${NC} - Frontend (Next.js) only"
echo -e "${GREEN}3${NC} - Both (API + Frontend)"
echo -e "${GREEN}4${NC} - Mercure (Real-time broker) + Both"
echo -e "${GREEN}5${NC} - Full Setup (All services)"
echo -e "${GREEN}6${NC} - Run Tests"
echo -e "${GREEN}0${NC} - Exit"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
read -p "Enter choice [0-6]: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Starting API Backend...${NC}"
        cd "c:/Users/x/Desktop/CONNCESERVICE/service-app" || exit
        echo -e "${GREEN}✅ Navigate to: ${GREEN}http://localhost:8000${NC}"
        php -S localhost:8000 -t public
        ;;
    2)
        echo -e "\n${YELLOW}Starting Frontend...${NC}"
        cd "c:/Users/x/Desktop/CONNCESERVICE/servi-connect-web" || exit
        echo -e "${GREEN}✅ Navigate to: ${GREEN}http://localhost:3000${NC}"
        npm run dev
        ;;
    3)
        echo -e "\n${YELLOW}Starting Both Services...${NC}"
        echo -e "${YELLOW}Terminal 1: API Backend${NC}"
        (cd "c:/Users/x/Desktop/CONNCESERVICE/service-app" && php -S localhost:8000 -t public) &
        API_PID=$!
        sleep 2
        
        echo -e "${YELLOW}Terminal 2: Frontend${NC}"
        (cd "c:/Users/x/Desktop/CONNCESERVICE/servi-connect-web" && npm run dev) &
        FRONTEND_PID=$!
        
        echo -e "${GREEN}✅ Services started:${NC}"
        echo -e "   API:      http://localhost:8000"
        echo -e "   Frontend: http://localhost:3000"
        echo -e "   Processes: $API_PID (API), $FRONTEND_PID (Frontend)"
        wait
        ;;
    4)
        echo -e "\n${YELLOW}Starting Mercure + Both Services...${NC}"
        
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
            echo -e "${YELLOW}Alternative: docker run -p 3000:3000 -e JWT_SECRET=test-secret dunglas/mercure${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Starting Mercure (Docker)...${NC}"
        docker run -d -p 3000:3000 \
            -e ALLOWED_ORIGINS="http://localhost:3000" \
            -e JWT_SECRET="test-secret-change-in-production" \
            dunglas/mercure
        
        echo -e "${YELLOW}Starting API Backend...${NC}"
        (cd "c:/Users/x/Desktop/CONNCESERVICE/service-app" && php -S localhost:8000 -t public) &
        API_PID=$!
        sleep 2
        
        echo -e "${YELLOW}Starting Frontend...${NC}"
        (cd "c:/Users/x/Desktop/CONNCESERVICE/servi-connect-web" && npm run dev) &
        FRONTEND_PID=$!
        
        echo -e "${GREEN}✅ All services started:${NC}"
        echo -e "   API:      http://localhost:8000"
        echo -e "   Frontend: http://localhost:3000"
        echo -e "   Mercure:  http://localhost/.well-known/mercure"
        wait
        ;;
    5)
        echo -e "\n${YELLOW}Full Setup not yet implemented.${NC}"
        echo -e "${YELLOW}Use option 4 (Mercure + Both Services) instead.${NC}"
        ;;
    6)
        echo -e "\n${YELLOW}═══════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Running Tests...${NC}"
        echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"
        
        echo -e "${YELLOW}📋 Manual Test Checklist:${NC}"
        
        echo -e "\n${YELLOW}Phase 1: Service Health${NC}"
        echo -e "  [ ] API responds: curl http://localhost:8000/"
        echo -e "  [ ] Frontend loads: http://localhost:3000"
        echo -e "  [ ] Database accessible: mysql -u root -p conseve"
        
        echo -e "\n${YELLOW}Phase 2: Authentication${NC}"
        echo -e "  [ ] Login page loads"
        echo -e "  [ ] Register works"
        echo -e "  [ ] JWT token generated"
        
        echo -e "\n${YELLOW}Phase 3: Conversations${NC}"
        echo -e "  [ ] Load /client/conversations"
        echo -e "  [ ] Select a conversation"
        echo -e "  [ ] Send text message"
        echo -e "  [ ] Send audio message"
        echo -e "  [ ] See 'typing indicator'"
        echo -e "  [ ] Messages appear immediately"
        
        echo -e "\n${YELLOW}Phase 4: Admin${NC}"
        echo -e "  [ ] Access /admin/users"
        echo -e "  [ ] List users"
        echo -e "  [ ] Edit user"
        echo -e "  [ ] Delete user"
        echo -e "  [ ] Verify provider"
        
        echo -e "\n${YELLOW}Phase 5: Search${NC}"
        echo -e "  [ ] Access /client/search"
        echo -e "  [ ] Filter by category"
        echo -e "  [ ] Filter by location"
        echo -e "  [ ] View map"
        
        echo -e "\n${YELLOW}═══════════════════════════════════════════════════${NC}"
        ;;
    0)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
