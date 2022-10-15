import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import  CredentialsProvider  from "next-auth/providers/credentials";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
// import clientPromise from "../../../lib/mongodb";

export default NextAuth({
  //configure auth providers
  providers: [
    CredentialsProvider({
      name: "exBeyond credential",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          required: true,
          placeholder: "email",
        },
        name: {
          label: "name",
          type: "text",
          required: true,
          placeholder: "username"
        },
        password: {
          label: "Password",
          type: "password",
          required: true,
          placeholder: "password",
        },
      },
      async authorize(credentials, req, session) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: 1, email: credentials.email };
        console.log(user, "user");

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          console.log("user", user);
          console.log(session, "session");
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          console.log("no user");
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
      callbacks: {
        async jwt({ token, user, account }) {
          if (user) {
            console.log(token, "callback token");
            return {
              ...token,
              accessToken: user.data.token,
              refreshToken: user.data.refreshToken,
            };
          }
          console.log("user not found");
        },
        async session({ session, token }) {
          session.user.accessToken = token.accessToken;
          session.user.refreshToken = token.refreshToken;
          session.user.tokenExpires = token.tokenExpires;
          
          console.log(session, "async session");
          return session;
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: null // If set, new users will be directed here on first sign in
  },
  
  // adapter: MongoDBAdapter(clientPromise),
  session: {
    jwt: {
      encryption: true,
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
