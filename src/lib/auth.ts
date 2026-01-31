import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Parse demo users from environment variable
function getDemoUsers(): Map<string, string> {
  const users = new Map<string, string>();
  const demoUsers = process.env.DEMO_USERS || "admin:admin123";

  demoUsers.split(",").forEach((pair) => {
    const [username, password] = pair.split(":");
    if (username && password) {
      users.set(username.trim(), password.trim());
    }
  });

  return users;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const users = getDemoUsers();
        const storedPassword = users.get(credentials.username);

        if (storedPassword && storedPassword === credentials.password) {
          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@firecrawl.local`,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
