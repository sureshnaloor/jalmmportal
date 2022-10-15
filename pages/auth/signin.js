import React, { useState, useEffect } from 'react'
import { getCsrfToken, getProviders, useSession } from "next-auth/react"
import { useRouter } from "next/router";

const SignInComp = ({ ...props}) => {
  const [providers, setProviders] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === 'authenticated') {
    router.push('/');
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async() => {
    if (status !== 'loading') {
      if (providers === null) {
        setProviders(await getProviders());
        if (csrfToken === null) {
          setCsrfToken(await getCsrfToken());
        }
      }
    }  
  }, [status, providers, csrfToken]);

  const { query } = useRouter();

  return (
    <>                
      <div>
        
          
              {query.error && (
                <>
                  <div> error </div>
                </>
              )}

              <h2>signin form </h2>
              
            
        
      </div>
    </>
  )
}



export default SignInComp