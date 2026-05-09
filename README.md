# 🚀 Servi-Connect - Chat Application

Real-time messaging platform with audio support, typing indicators, and read receipts.

## 📋 Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MariaDB 10.4+
- Docker (optional - for real-time Mercure)

### Launch
```bash
# Windows
START.bat

# Linux/Mac
bash START.sh
```

Then select option from menu:
- `3` - Both API + Frontend (recommended for testing)
- `4` - Includes Mercure real-time broker

### URLs
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Mercure**: http://localhost/.well-known/mercure (optional)

---

## 📁 Project Structure

```
servi-connect-web/          # Next.js Frontend
├── app/                     # Pages (conversations, search, admin)
├── components/              # React components
│   └── chat/               # Chat components (ChatWindow, MessageInput, TypingIndicator)
├── lib/
│   ├── api/                # API client functions
│   ├── hooks/              # Custom hooks (useConversationMessages, useTypingStore, etc)
│   └── stores/             # Zustand state stores

service-app/                # Symfony Backend  
├── src/
│   ├── Controller/Api/     # API controllers
│   │   ├── MessageController.php
│   │   ├── ConversationController.php
│   │   ├── ConversationTypingController.php
│   │   └── Admin/*         # Admin CRUD controllers
│   └── Service/
│       ├── ConversationService.php
│       ├── MediaUploadService.php
│       └── MercureService.php      # Real-time publishing
├── config/
│   └── routes.yaml         # API routing configuration
└── var/
    └── log/                # Application logs
```

---

## 🎯 Features

### Chat Messaging
- ✅ Text messages
- ✅ Image/video/audio uploads
- ✅ Native audio recording (MediaRecorder API)
- ✅ Optimistic UI updates
- ✅ Message history

### Real-time Features
- ✅ **Typing Indicators**: "X is typing..."
- ✅ **Read Receipts**: Mark messages as read
- ✅ **Live Updates**: Mercure WebSocket protocol
- ✅ **Auto-refresh**: Messages sync without refresh

### Admin Panel
- ✅ User management (CRUD)
- ✅ Banner management
- ✅ Category management
- ✅ Provider verification

### Search
- ✅ Provider search by category
- ✅ Geospatial filtering (coordinates + radius)
- ✅ Infinite pagination
- ✅ Map view (Leaflet)

---

## 🔧 API Endpoints

### Conversations
```
GET    /api/conversations                    # List all conversations
POST   /api/conversations                    # Create new conversation
GET    /api/conversations/{id}/messages      # Get messages
POST   /api/conversations/{id}/messages      # Send message
PATCH  /api/conversations/{id}/messages/read # Mark as read
POST   /api/conversations/{id}/typing        # Send typing indicator
```

### Media
```
POST   /api/media/upload                     # Upload image/video/audio
```

### Admin
```
GET    /api/admin/users                      # List users
PUT    /api/admin/users/{id}                 # Update user
DELETE /api/admin/users/{id}                 # Delete user
# ... similar endpoints for banners and categories
```

### Search
```
GET    /api/search/providers                 # Search providers
GET    /api/search/categories                # Get categories
```

---

## 🔌 Tech Stack

**Frontend**
- Next.js 16 (React 19)
- TanStack React Query (server state)
- Zustand (client state)
- Tailwind CSS 4
- TypeScript

**Backend**
- Symfony 7.4
- PHP 8.2
- Doctrine ORM
- JWT Authentication
- API Platform

**Real-time**
- Mercure (Server-Sent Events)
- HTTP Polling (fallback)

**Database**
- MariaDB 10.4
- 13 tables (users, conversations, messages, etc)

---

## 🚀 Deployment

### Development
```bash
# Backend
cd service-app
php -S localhost:8000 -t public

# Frontend  
cd servi-connect-web
npm run dev
```

### Production
```bash
# Build frontend
npm run build

# Deploy to Vercel/AWS/etc
npm run start

# Backend on server with PHP-FPM
# Configure Mercure on separate container
```

See [DEPLOYMENT_REPORT.md](./DEPLOYMENT_REPORT.md) for complete deployment guide.

---

## 📚 Documentation

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical overview
- [DEPLOYMENT_REPORT.md](./DEPLOYMENT_REPORT.md) - Deployment guide
- [MERCURE_SETUP.md](./MERCURE_SETUP.md) - Real-time configuration
- [integration_audit.md](./memories/session/integration_audit.md) - Integration details

---

## 🧪 Testing

### Manual Testing Checklist

**Conversations**
- [ ] Load /client/conversations
- [ ] Select conversation, see messages
- [ ] Send text message
- [ ] Send audio message (record + upload)
- [ ] See "X is typing..." indicator
- [ ] Messages mark as read

**Admin**
- [ ] Access /admin/users
- [ ] Create/edit/delete users
- [ ] Verify provider
- [ ] Manage banners and categories

**Search**
- [ ] Access /client/search
- [ ] Filter by category
- [ ] View provider list
- [ ] View map

### Automated Testing
```bash
# Frontend
npm run test

# Backend
php bin/phpunit
```

---

## 🔒 Security

- JWT token authentication
- CORS configuration
- Rate limiting on POST endpoints
- SQL injection protection (Doctrine ORM)
- XSS protection (React)
- CSRF tokens
- File upload validation
- User permission checks

---

## 🐛 Troubleshooting

**API returns 500 errors**
- Check `config/routes.yaml` has correct glob pattern
- Check database connection
- Review logs: `var/log/`

**Typing indicators not working**
- Check Zustand store is imported
- Verify API call in browser console
- Check Mercure connection (if enabled)

**Messages not sending**
- Verify authentication token
- Check conversation access permissions
- Review network tab for API errors

**Database connection failed**
- Ensure MariaDB is running
- Check `config/database.yaml` connection string
- Verify database user permissions

---

## 📈 Performance

- Optimistic UI updates (no lag)
- Message pagination (load on scroll)
- Typed debouncing (1s)
- Automatic caching (React Query)
- Real-time push (Mercure) instead of polling

---

## 📞 Support

For issues or questions:
1. Check the documentation files above
2. Review browser console errors (F12)
3. Check server logs: `var/log/`
4. Verify database connection
5. Test API endpoints with curl

---

## 📝 License

MIT License - Feel free to use and modify

---

## 🎉 Status

**Version**: 1.0.0  
**Status**: Production-Ready (after testing)  
**Last Updated**: April 14, 2026  

---

**Ready to launch? Run `START.bat` or `bash START.sh` to begin!** 🚀
