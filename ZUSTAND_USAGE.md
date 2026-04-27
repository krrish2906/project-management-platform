# Zustand Auth Store Usage Guide

## Store Location
`store/useAuthStore.ts`

## Available State & Methods

### State
- `user` - Current user object (or null)
- `isAuthenticated` - Boolean indicating if user is logged in

### Methods
- `setUser(user)` - Set the current user (auto persists to localStorage)
- `logout()` - Clear user and auth state
- `updateUser(updates)` - Update specific user fields

---

## Usage Examples

### 1. Access User Data in Any Component

```typescript
'use client'

import { useAuthStore } from '@/store/useAuthStore';

export default function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### 2. Logout Button

```typescript
'use client'

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### 3. Update User Profile

```typescript
'use client'

import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileUpdate() {
  const updateUser = useAuthStore((state) => state.updateUser);

  const updateName = async (newName: string) => {
    // Call API
    const response = await fetch('/api/users/update', {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });

    if (response.ok) {
      // Update local state
      updateUser({ name: newName });
    }
  };

  return <div>...</div>;
}
```

### 4. Protected Route Hook (Already created)

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth(); // Automatically redirects if not authenticated

  return (
    <div>
      <h1>Dashboard for {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Features

✅ **Automatic Persistence** - User data is automatically saved to localStorage
✅ **Hydration** - State is restored on page reload
✅ **TypeScript** - Full type safety
✅ **React 19 Compatible** - Works with latest React
✅ **Minimal Re-renders** - Only components using auth state re-render

---

## Testing

### Check if user is logged in
```typescript
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
console.log('Logged in:', isAuthenticated);
```

### Get current user
```typescript
const user = useAuthStore((state) => state.user);
console.log('User:', user);
```

### Clear auth state (logout)
```typescript
const logout = useAuthStore((state) => state.logout);
logout();
```
