import Logo from '@/assets/logo.png';
import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]'>
      <Link to="/" className="font-montserrat text-xl font-bold text-[#1A1A1A] mb-8">
        <img src={Logo} alt="Logo" className="h-16" />
      </Link>
      <LoginForm />
    </div>
  )
}

export default LoginPage
