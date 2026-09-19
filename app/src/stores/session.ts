/**
 * Authentication state.
 *
 * Holds a signed token rather than a plain "logged in" boolean, and re-verifies
 * it on hydration so an edited or expired token is rejected rather than trusted.
 */
import { create } from 'zustand';
import { hashPassword, signSession, verifySession, type SessionPayload } from '@/lib/auth/token';

export const DEMO_ACCOUNT = {
  email: 'alex@zat.demo',
  password: 'exploremyworld',
  handle: 'alexden',
  name: 'Alex Den',
} as const;

type Account = { email: string; passwordHash: string; handle: string; name: string };

type SessionState = {
  session: SessionPayload | null;
  token: string | null;
  ready: boolean;
  accounts: Account[];
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (input: {
    email: string;
    password: string;
    handle: string;
    name: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signInAsDemo: () => Promise<void>;
  signOut: () => void;
};

const TOKEN_KEY = 'zat:v1:session';
const ACCOUNTS_KEY = 'zat:v1:accounts';

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session lasts for this tab only */
  }
};

export const useSession = create<SessionState>()((set, get) => ({
  session: null,
  token: null,
  ready: false,
  accounts: [],

  async hydrate() {
    const accounts = safeRead<Account[]>(ACCOUNTS_KEY, []);
    let token: string | null = null;
    try {
      token = localStorage.getItem(TOKEN_KEY);
    } catch {
      token = null;
    }

    const session = token ? await verifySession(token) : null;
    if (token && !session) {
      // Expired or tampered with — clear rather than silently ignore.
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* nothing to remove */
      }
    }
    set({ accounts, session, token: session ? token : null, ready: true });
  },

  async signIn(email, password) {
    const normalised = email.trim().toLowerCase();
    const hash = await hashPassword(password);

    if (normalised === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      await get().signInAsDemo();
      return { ok: true };
    }

    const account = get().accounts.find((a) => a.email === normalised);
    if (!account || account.passwordHash !== hash) {
      return { ok: false, error: 'That email and password do not match an account.' };
    }

    const token = await signSession({
      sub: account.email,
      handle: account.handle,
      name: account.name,
      email: account.email,
    });
    safeWrite(TOKEN_KEY, token);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* in-memory only */
    }
    set({ token, session: await verifySession(token) });
    return { ok: true };
  },

  async signUp({ email, password, handle, name }) {
    const normalised = email.trim().toLowerCase();
    const lowerHandle = handle.trim().toLowerCase();

    if (get().accounts.some((a) => a.email === normalised) || normalised === DEMO_ACCOUNT.email) {
      return { ok: false, error: 'An account already exists for that email.' };
    }
    if (
      get().accounts.some((a) => a.handle === lowerHandle) ||
      lowerHandle === DEMO_ACCOUNT.handle
    ) {
      return { ok: false, error: 'That handle is already taken.' };
    }

    const account: Account = {
      email: normalised,
      passwordHash: await hashPassword(password),
      handle: lowerHandle,
      name: name.trim(),
    };
    const accounts = [...get().accounts, account];
    safeWrite(ACCOUNTS_KEY, accounts);

    const token = await signSession({
      sub: account.email,
      handle: account.handle,
      name: account.name,
      email: account.email,
    });
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* in-memory only */
    }
    set({ accounts, token, session: await verifySession(token) });
    return { ok: true };
  },

  async signInAsDemo() {
    const token = await signSession({
      sub: DEMO_ACCOUNT.email,
      handle: DEMO_ACCOUNT.handle,
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
    });
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* in-memory only */
    }
    set({ token, session: await verifySession(token) });
  },

  signOut() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nothing to remove */
    }
    set({ session: null, token: null });
  },
}));
