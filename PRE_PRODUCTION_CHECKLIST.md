# ✅ PRE-PRODUCTION CHECKLIST

## 🔍 Code Reviews

### Backend (PHP/Symfony)
- [ ] All imports use `use` not `import`
- [ ] No SQL injection vulnerabilities (using Doctrine)
- [ ] All routes in `config/routes.yaml` with proper glob pattern
- [ ] Controllers have `#[IsGranted('ROLE_USER')]` guards
- [ ] Error handling with try/catch
- [ ] Logging implemented for important operations
- [ ] No hardcoded secrets or passwords

### Frontend (TypeScript/React)
- [ ] No `any` types (use proper interfaces)
- [ ] All API calls wrapped in try/catch
- [ ] Loading and error states handled
- [ ] Components properly memoized where needed
- [ ] No console.log in production code
- [ ] Proper error boundary usage
- [ ] Auto-logout on 401 errors

---

## 🗄️ Database

- [ ] All tables created successfully
  - [ ] users
  - [ ] conversations
  - [ ] messages
  - [ ] service_categories
  - [ ] provider_profiles
  - [ ] banners
  - [ ] media_files
  - [ ] notifications
  - [ ] reviews
  - [ ] service_bookings
  - [ ] payments
  - [ ] user_documents
  - [ ] audit_logs
- [ ] Foreign key constraints in place
- [ ] Proper indexing on search columns
- [ ] Backup strategy documented
- [ ] Migration scripts tested

---

## 🔐 Security

### Authentication
- [ ] JWT token signing works
- [ ] Token expiration configured (default: 24h)
- [ ] Refresh token mechanism implemented
- [ ] Password hashing (bcrypt)
- [ ] CORS only allows expected origins

### Authorization
- [ ] ROLE_USER vs ROLE_ADMIN properly enforced
- [ ] Providers can only manage their own data
- [ ] Clients can only see conversations with them
- [ ] Admin endpoints require ROLE_ADMIN

### Input Validation
- [ ] File uploads limited by size
- [ ] File uploads limited by type (whitelist)
- [ ] Message content sanitized
- [ ] Email validation on registration
- [ ] Phone number validation

### API Security
- [ ] Rate limiting on login endpoint
- [ ] Rate limiting on message endpoints
- [ ] CSRF tokens on forms
- [ ] SQL injection tests passed
- [ ] XSS prevention tests passed

---

## 🔌 API Endpoints

### Conversations
- [ ] GET /api/conversations returns 200
- [ ] POST /api/conversations creates conversation
- [ ] GET /api/conversations/{id}/messages loads all
- [ ] POST /api/conversations/{id}/messages sends
- [ ] PATCH /api/conversations/{id}/messages/read marks as read
- [ ] POST /api/conversations/{id}/typing sends typing status

### Admin
- [ ] GET /api/admin/users returns paginated results
- [ ] POST /api/admin/users creates user
- [ ] PUT /api/admin/users/{id} updates user
- [ ] DELETE /api/admin/users/{id} deletes user
- [ ] GET /api/admin/banners returns list
- [ ] GET /api/admin/categories returns list

### Search
- [ ] GET /api/search/providers returns geospatial results
- [ ] Pagination with limit/offset works
- [ ] Category filter works
- [ ] Location + radius filter works

---

## 🎨 Frontend Pages

### Conversations
- [ ] /client/conversations loads
- [ ] Conversation list displays correctly
- [ ] Click conversation shows messages
- [ ] Send text message works
- [ ] Record and send audio works
- [ ] See "X is typing..." indicator
- [ ] Messages mark as read

### Search
- [ ] /client/search loads
- [ ] SearchBar component works
- [ ] Category filter functional
- [ ] Location filter functional
- [ ] Provider list displays
- [ ] Infinite scroll pagination
- [ ] Map view (Leaflet) displays

### Admin
- [ ] /admin/users loads (if ROLE_ADMIN)
- [ ] User list displays
- [ ] Search/filter works
- [ ] Can verify provider
- [ ] Can toggle user status
- [ ] Can delete user
- [ ] Pagination works

---

## 🚀 Performance

### Load Testing
- [ ] Frontend loads in <3s
- [ ] API responds in <500ms average
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Message upload works (>20MB files)

### Browser Performance
- [ ] Lighthouse score >80
- [ ] Core Web Vitals good
- [ ] No console errors
- [ ] Memory leaks checked

### Network
- [ ] Requests compressed (gzip)
- [ ] API response size <100KB
- [ ] HTTP/2 enabled
- [ ] Static assets cached

---

## 📊 Monitoring

- [ ] Error tracking (Sentry/Rollbar) setup
- [ ] Performance monitoring (DataDog/New Relic)
- [ ] Log aggregation (ELK Stack)
- [ ] Database monitoring
- [ ] API monitoring (status codes, latency)
- [ ] WebSocket monitoring (Mercure)
- [ ] Alerts configured for:
  - High error rate (>5%)
  - High latency (>1s)
  - Database down
  - Low disk space

---

## 📝 Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Setup guide (README + START scripts)
- [ ] Deployment guide (DEPLOYMENT_REPORT.md)
- [ ] Troubleshooting guide (in docs)
- [ ] Database schema documented
- [ ] Architecture diagram created
- [ ] Environment variables documented

---

## 🧪 Testing

### Unit Tests
- [ ] Backend: >70% code coverage
- [ ] Controllers tested
- [ ] Services tested
- [ ] Validation tested

### Integration Tests
- [ ] API endpoints tested
- [ ] Message flow tested
- [ ] Auth flow tested
- [ ] Permission checks tested

### E2E Tests
- [ ] Chat complete flow
- [ ] Admin CRUD operations
- [ ] Search functionality
- [ ] Error scenarios

### Manual Testing
- [ ] Signup flow
- [ ] Login flow
- [ ] Create conversation
- [ ] Send message
- [ ] Audio recording/upload
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Admin operations

---

## 🔄 Deployment

### Pre-deployment
- [ ] All secrets moved to .env
- [ ] Database backed up
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Staging deployment successful
- [ ] Rollback plan documented

### Deployment
- [ ] API deployed to production
- [ ] Frontend deployed to CDN
- [ ] Database migrations ran
- [ ] Mercure deployed
- [ ] DNS updated
- [ ] SSL certificates installed
- [ ] Services restarted

### Post-deployment
- [ ] All URLs responding
- [ ] Error tracking active
- [ ] Monitoring running
- [ ] Database healthy
- [ ] API responding
- [ ] Frontend loading
- [ ] No critical errors

---

## ✨ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Developer** | [Name] | [Date] | [Sign] |
| **QA Lead** | [Name] | [Date] | [Sign] |
| **DevOps** | [Name] | [Date] | [Sign] |
| **Product Owner** | [Name] | [Date] | [Sign] |

---

**Status**: 🟢 **READY FOR LAUNCH**

Once all checkboxes are marked, the application is approved for production deployment!

---

**Date Created**: April 14, 2026  
**Last Updated**: April 14, 2026  
**Version**: 1.0.0
