import NextAuth from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import { uuid } from "uuidv4";
//

export default NextAuth({
  //configure auth providers
  providers: [
    CredentialsProvider({
      name: "JALMMWebAPP",
      // credentials:{},
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
          placeholder: "username",
        },
        password: {
          label: "Password",
          type: "password",
          required: true,
          placeholder: "password",
        },
      },
      async authorize(credentials, req, session) {
        let user = null
        
        if (credentials.email == "suresh.n@jalint.com.sa" && credentials.name == "suresh"){
          user = { id: uuid(), email: credentials.email, name: credentials.name};
          return user
        }

       
        else {
          // If you return null then an error will be displayed advising the user to check their details.
          // console.log("no user");
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
    
  ],
  // pages:{
  //   signIn: "/auth/login",
  // },

  // adapter: MongoDBAdapter(clientPromise),
  session: {
    jwt: {
      encryption: true,
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
