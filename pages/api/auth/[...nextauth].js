import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default NextAuth({
    //configure auth providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    // jwt: {
    //     encryption: true
    // },
    // secret: "Iam awesome and I know it",

});
