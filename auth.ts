import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const LOGIN_URL =
  process.env.LOGIN_URL ??
  'https://agent-mcp-production-46d7.up.railway.app/public/login';

// Self-hosted email/password accounts — the actual account record lives
// in flow_system's agent_user_accounts table (see indicator/agent/
// queries.py), reached only through the agent service's /public/login.
// The session itself is still JWT-only here: this app never stores a
// password or a user row of its own, it just asks the agent service
// "does this email/password pair check out" on each sign-in.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        const email = typeof creds?.email === 'string' ? creds.email : '';
        const password = typeof creds?.password === 'string' ? creds.password : '';
        if (!email || !password) return null;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
          const res = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
          });
          if (!res.ok) return null;
          const data = await res.json();
          if (!data.ok) return null;
          return { id: data.email as string, email: data.email as string };
        } catch {
          return null;
        } finally {
          clearTimeout(timeout);
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
});
