import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/mongoconnect";

export default NextAuth({
  //configure auth providers
  providers: [
    CredentialsProvider({
      name: "JALMMWebAPP",
      // credentials:{},
      credentials: {
        email: {},
        // name: {},
        password: {},
        // role: {},
      },
      async authorize(credentials, req, session) {
        const { db } = await connectToDatabase();

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        // console.log(user);

        if (!user) {
          console.log("no such user");
          return null;
        }

        if (user.password !== credentials.password) {
          console.log("nor right credentials");
          return null;
        } else {
          // console.log({ credentials });
          return user;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },

  session: {
    jwt: {
      encryption: true,
      maxAge: 30 * 24 * 60,
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.user.role = token.role;
      return session;
    },
  },
 
  secret: process.env.NEXTAUTH_SECRET,
});
