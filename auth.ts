import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// JWT-only session — no user database. All "login" gates is a page
// showing more detail (full signal history) than the public track-record
// aggregate; there is nothing per-user to persist, so a stateless session
// is the whole story, not a placeholder for "add a DB later".
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
});
