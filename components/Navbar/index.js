import {useTheme} from 'next-themes'

const Navbar = () => {
    return (
        <h1 className='text-xl font-bold p-5 text-dark-primary dark:text-light-primary'>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
    )
}

export default Navbar