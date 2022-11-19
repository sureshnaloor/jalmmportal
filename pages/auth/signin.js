import React from 'react';
import {providers, signIn, getSession, csrfToken} from "next-auth"
import { Container } from 'postcss';


export default function SignIn({providers, csrfToken}) {
  
  
}

SignIn.getInitialProps = async(context) => {
    const {req,res} = context
    const session = getSession({req});

    if (session && res && session.accessToken) {
        res.writeHead(302, {
            Location: '/',
        })
        res.end()
        return;
    }

    return {
        session: undefined,
        providers: await providers(context),
        csrfToken: await csrfToken(context),

    }
}