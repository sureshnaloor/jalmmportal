import {useTheme} from 'next-themes'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const {theme, setTheme} = useTheme()
  const {data:session} = useSession()
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (session) {
    return (
        <div className="flex justify-between p-3 bg-light-secondary dark:bg-dark-secondary text-dark-primary dark:text-light-primary">
        <div className="font-bold my-auto text-lg">navigation bar</div>

        <div className="flex">
          <button onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
            switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      <div className="flex">
        <button onClick={() => signOut()}>sign Out {session.user.email}</button>
      </div>
        </div>
    );
  }

    return (
      <div className="flex justify-between p-3 bg-light-secondary dark:bg-dark-secondary text-dark-primary dark:text-light-primary">
        <div className="font-bold my-auto text-lg">navigation bar</div>

        <div className="flex">
          <button onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
            switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>

        <div className="flex">
          <button onClick={() => signIn()}>sign in</button>
        </div>
      </div>
    );
}

export default Navbar