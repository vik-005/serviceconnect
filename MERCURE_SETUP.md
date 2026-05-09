# Configuration Real-time Chat avec Mercure

## Installation Mercure

### Option 1: Docker (Recommandé)
```bash
docker run -d \
  -p 3000:3000 \
  -e ALLOWED_ORIGINS="http://localhost:3000" \
  -e JWT_SECRET="your-super-secret-key-change-this" \
  dunglas/mercure
```

### Option 2: Binary Download
```bash
# Download from https://mercure.rocks
./mercure &
```

## Configuration Symfony

### 1. Ajouter .env
```env
MERCURE_PUBLIC_URL=http://localhost/.well-known/mercure
MERCURE_JWT_SECRET=your-super-secret-key-change-this
```

### 2. Enregistrer MercureService
```yaml
# config/services.yaml
services:
  App\Service\MercureService:
    arguments:
      $mercurePublicUrl: '%env(MERCURE_PUBLIC_URL)%'
      $mercureSecret: '%env(MERCURE_JWT_SECRET)%'
```

## Configuration Frontend

### 1. Client Mercure
```bash
npm install mercure
```

### 2. Utilisation dans Hook
```typescript
import { useEffect } from 'react';

export const useMercureSubscription = (conversationId: number) => {
  useEffect(() => {
    const url = new URL('http://localhost/.well-known/mercure');
    url.searchParams.append('topic', `conversation/${conversationId}/messages`);
    url.searchParams.append('topic', `conversation/${conversationId}/typing`);

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        // Handle new message from websocket
      } else if (data.type === 'typing') {
        // Handle typing indicator
      }
    };

    return () => eventSource.close();
  }, [conversationId]);
};
```

## Flux Real-time

### Message Flow
1. User A sends message via `/api/conversations/{id}/messages` (POST)
2. Backend stores message in database
3. Backend publishes to Mercure topic `conversation/{id}/messages`
4. User A receives optimistic response (no refresh needed)
5. User B receives Mercure event from server (real-time push)
6. User B UI updates without page refresh

### Typing Flow
1. User A types in textarea
2. Frontend sends `/api/conversations/{id}/typing` (POST, isTyping: true)
3. Backend publishes to Mercure topic `conversation/{id}/typing`
4. User B receives typing event
5. User B sees "User A est en train d'écrire..."
6. After 3s inactivity or send, frontend sends isTyping: false

## Performance Tips

1. **Message Pagination**: Load only last 50 messages, then load more on scroll
2. **Typing Cleanup**: Auto-remove typing indicator after 3s timeout
3. **Connection Pooling**: Reuse HTTP connections for Mercure
4. **Message Compression**: Use gzip for large payloads

## Fallback (HTTP Polling)

Si Mercure n'est pas disponible, useConversationWebSocket.ts utilise HTTP polling:
- Poll toutes les 2 secondes
- Moins efficace mais toujours fonctionnel
- Idéal pour développement sans Mercure

## Monitoring

### Check Mercure Health
```bash
curl http://localhost/.well-known/mercure/health
```

### Check Topics
```bash
# Subscribe to test topic
curl -H "Last-Event-ID: $(date +%s)" \
  http://localhost/.well-known/mercure?topic=test
```

## Production Checklist

- [ ] Change JWT_SECRET to strong random key
- [ ] Use HTTPS for production
- [ ] Limit ALLOWED_ORIGINS
- [ ] Setup proper logging/monitoring
- [ ] Configure auto-restart on crash
- [ ] Setup load balancing if needed
- [ ] Test with >100 concurrent connections
