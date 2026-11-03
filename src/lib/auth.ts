export interface UserSession {
  id?: string;
  username: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'USER';
  isGuestMember?: boolean;
  workspaceId?: string;
  workspaceName?: string;
  verificationMethod?: 'EMAIL' | 'PHONE';
  isVerified?: boolean;
  avatarText?: string;
  avatarUrl?: string | null;
  token?: string;
  onboardingCompleted?: boolean;
}

export interface StoredUser extends UserSession {
  passwordHash: string;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'sentrix_registered_users_v1';
const STORAGE_SESSION_KEY = 'sentrix_active_session_v1';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Cryptographic SHA-256 Hashing via native Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Validation Rules
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required.' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Username must not exceed 20 characters.' };
  }
  if (/\s/.test(username)) {
    return { isValid: false, error: 'Username must not contain any spaces.' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): {
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasSpecial: boolean;
  };
  error?: string;
} {
  const checks = {
    minLength: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };

  const isValid = checks.minLength && checks.hasLower && checks.hasUpper && checks.hasSpecial;

  let error: string | undefined;
  if (!checks.minLength) error = 'Password must be at least 8 characters long.';
  else if (!checks.hasLower) error = 'Password must include at least 1 lowercase letter.';
  else if (!checks.hasUpper) error = 'Password must include at least 1 uppercase letter.';
  else if (!checks.hasSpecial) error = 'Password must include at least 1 special character.';

  return { isValid, checks, error };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone.trim());
}

// Retrieve registered users from localStorage
export function getRegisteredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save registered users
function saveRegisteredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Register a new user: calls Backend NestJS API with local fallback
export async function registerUser(params: {
  username: string;
  email: string;
  phone: string;
  verificationMethod: 'EMAIL' | 'PHONE';
  password: string;
}): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  const usernameCheck = validateUsername(params.username);
  if (!usernameCheck.isValid) {
    return { success: false, error: usernameCheck.error };
  }

  if (!validateEmail(params.email)) {
    return { success: false, error: 'Please enter a valid active work email address.' };
  }

  if (!params.phone || params.phone.trim().length < 7) {
    return { success: false, error: 'Please enter an active phone number.' };
  }

  const passwordCheck = validatePassword(params.password);
  if (!passwordCheck.isValid) {
    return { success: false, error: passwordCheck.error };
  }

  // 1. Try registering through Backend NestJS API
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      const session: UserSession = {
        id: data.id,
        username: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role,
        verificationMethod: data.verificationMethod,
        isVerified: data.isVerified,
        avatarText: data.avatarText,
        avatarUrl: data.avatarUrl ?? null,
        token: data.token,
        onboardingCompleted: data.onboardingCompleted ?? false,
      };

      // Also sync to local registry
      const localUsers = getRegisteredUsers();
      localUsers.push({
        ...session,
        passwordHash: await hashPassword(params.password),
        createdAt: new Date().toISOString(),
      });
      saveRegisteredUsers(localUsers);
      setSession(session);

      return { success: true, user: session };
    } else {
      const errData = await res.json().catch(() => ({}));
      const message = Array.isArray(errData.message)
        ? errData.message.join(', ')
        : errData.message || 'Registration failed.';
      return { success: false, error: message };
    }
  } catch {
    // 2. Resilient Offline Local Fallback
    const existingUsers = getRegisteredUsers();
    const lowerUsername = params.username.toLowerCase();
    const lowerEmail = params.email.toLowerCase();

    if (
      lowerUsername === 'pungkyrama' ||
      existingUsers.some((u) => u.username.toLowerCase() === lowerUsername)
    ) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    if (existingUsers.some((u) => u.email.toLowerCase() === lowerEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(params.password);
    const newUser: StoredUser = {
      username: params.username,
      email: params.email,
      phone: params.phone,
      role: 'USER',
      verificationMethod: params.verificationMethod,
      isVerified: true,
      avatarText: params.username.slice(0, 2).toUpperCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    existingUsers.push(newUser);
    saveRegisteredUsers(existingUsers);

    const fallbackSession: UserSession = {
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      verificationMethod: newUser.verificationMethod,
      isVerified: newUser.isVerified,
      avatarText: newUser.avatarText,
      onboardingCompleted: false,
    };
    setSession(fallbackSession);

    return {
      success: true,
      user: fallbackSession,
    };
  }
}

// Unified Login: calls Backend NestJS API with local fallback
export async function loginUser(
  identifier: string,
  password: string,
  targetRole: 'USER' | 'ADMIN' = 'USER',
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  const cleanId = identifier.trim();

  // 1. Try Backend NestJS API first (fetches real user data, roles, and avatar)
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: cleanId,
        password,
        role: targetRole,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const session: UserSession = {
        id: data.id,
        username: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role,
        verificationMethod: data.verificationMethod,
        isVerified: data.isVerified,
        avatarText: data.avatarText,
        avatarUrl: data.avatarUrl ?? null,
        token: data.token,
        onboardingCompleted: data.onboardingCompleted ?? false,
      };
      setSession(session);
      return { success: true, user: session };
    } else {
      const errData = await res.json().catch(() => ({}));
      const message = Array.isArray(errData.message)
        ? errData.message.join(', ')
        : errData.message || 'Invalid credentials.';
      return { success: false, error: message };
    }
  } catch {
    // 2. Resilient Offline Local Fallback
    if (cleanId === 'pungkyrama' && password === '0o0o 0o0o') {
      const localUsers = getRegisteredUsers();
      const storedAdmin = localUsers.find((u) => u.username.toLowerCase() === 'pungkyrama');
      const adminSession: UserSession = {
        username: 'pungkyrama',
        email: 'admin@sentrix.enterprise',
        role: 'ADMIN',
        isVerified: true,
        avatarText: 'PR',
        avatarUrl: storedAdmin?.avatarUrl ?? null,
        onboardingCompleted: true,
      };
      setSession(adminSession);
      return { success: true, user: adminSession };
    }

    if (targetRole === 'ADMIN') {
      return {
        success: false,
        error: 'Invalid Admin credentials. (Hint: username "pungkyrama" and password "0o0o 0o0o")',
      };
    }

    const users = getRegisteredUsers();
    const lowerId = cleanId.toLowerCase();

    const user = users.find(
      (u) => u.username.toLowerCase() === lowerId || u.email.toLowerCase() === lowerId,
    );

    if (!user) {
      return {
        success: false,
        error: 'No account found matching this username or email. Please sign up first.',
      };
    }

    const enteredHash = await hashPassword(password);
    if (enteredHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    const session: UserSession = {
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationMethod: user.verificationMethod,
      isVerified: user.isVerified,
      avatarText: user.avatarText || user.username.slice(0, 2).toUpperCase(),
      avatarUrl: user.avatarUrl ?? null,
      onboardingCompleted: user.onboardingCompleted ?? false,
    };

    setSession(session);
    return { success: true, user: session };
  }
}

// Update User Profile Photo / Avatar
export async function updateUserAvatar(
  username: string,
  avatarUrl: string | null,
  userId?: string,
): Promise<{ success: boolean; avatarUrl: string | null; error?: string }> {
  // 1. Update active local session
  const currentSession = getSession();
  if (currentSession && currentSession.username.toLowerCase() === username.toLowerCase()) {
    currentSession.avatarUrl = avatarUrl;
    setSession(currentSession);
  }

  // 2. Update local registered users store
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx !== -1) {
    users[idx].avatarUrl = avatarUrl;
    saveRegisteredUsers(users);
  } else if (username.toLowerCase() === 'pungkyrama') {
    users.push({
      username: 'pungkyrama',
      email: 'admin@sentrix.enterprise',
      role: 'ADMIN',
      isVerified: true,
      avatarText: 'PR',
      avatarUrl: avatarUrl,
      passwordHash: '',
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    });
    saveRegisteredUsers(users);
  }

  // 3. Persist to Backend NestJS API & PostgreSQL
  try {
    const res = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        avatarUrl,
        userId: userId || currentSession?.id,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, avatarUrl: data.avatarUrl ?? avatarUrl };
    }
  } catch (err) {
    console.warn('Backend avatar update skipped/offline fallback applied:', err);
  }

  return { success: true, avatarUrl };
}

// Session Management
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_SESSION_KEY) ||
      localStorage.getItem('sentirix_active_session_v1') ||
      localStorage.getItem('omniflow_active_session_v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_SESSION_KEY);
  localStorage.removeItem('sentirix_active_session_v1');
  localStorage.removeItem('omniflow_active_session_v1');
}
