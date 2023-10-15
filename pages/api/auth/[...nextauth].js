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
        email: {
          
        },
        name: {
          
        },
        password: {
          
        },
      },
      async authorize(credentials, req, session) {
        const { db } = await connectToDatabase();

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });
        
        console.log(user)

        if (!user) {
          console.log("no such user")
          return null;
        }

        if (
          
          user.password !== credentials.password
        ) {
          console.log("nor right credentials")
          return null;
        }
        else{
          console.log({ credentials });
          return user;
        }
       
      },
    }),
  ],
  pages:{
    signIn: "/auth/login",
  },

  session: {
    jwt: {
      encryption: true,
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
