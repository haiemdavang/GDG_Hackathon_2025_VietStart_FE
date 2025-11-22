import { Button } from '@mantine/core';
import { FiArrowLeft } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignIn } from '../Autho/SignIn';
import { SignUp } from '../Autho/SignUp';

export function AuthoPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] font-['Inter'] overflow-hidden relative bg-white">
      <span
        onClick={() => navigate("/")}
        className='m-4 inline-block absolute top-5 left-5 cursor-pointer z-50'
      >
        {location.pathname === "/login" ? <></> : <Button leftSection={<FiArrowLeft size={20} />} variant='light'>
          Quay lại
        </Button>}  
      </span>

      <div className={`w-[100vw] h-[100vh] flex [&>*]:flex-shrink-0 duration-1000 transition-all `}>
        {location.pathname === "/login" ? <SignIn /> : (
          <></>
        )}

        <div className={`w-0 overflow-hidden md:w-1/2 bg-primary/10 flex flex-col items-center gap-4 justify-center duration-200 transition-all ease-in-out ${location.pathname === "/login" ? "rounded-l-[200px]" : "rounded-r-[200px]"
          }`}>
          <div className="flex gap-3 items-center text-primary">
            <div className='text-4xl font-semibold'>
              <span className="text-primary">Viet</span>
              <span className="text-slate-700">Start</span>
            </div>
          </div>
          <div className="text-2xl font-semibold text-slate-700">
            Nơi thành công bắt đầu 
          </div>
        </div>

        {location.pathname === "/register" ? <SignUp /> : (
          <></>
        )}
      </div>
    </div>
  );
}

export default AuthoPage;