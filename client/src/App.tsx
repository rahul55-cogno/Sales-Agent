import { BrowserRouter, Route, Routes } from 'react-router';
import Main from './pages/Main';
import { GoogleSignIn } from './components/GoogleSignIn';
import { AuthLayout } from './components/AuthLayout';
import { useState } from 'react';


const App = () => {
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignIn = (userData: any) => {
    setUser(userData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Main />} path='/' />
        <Route element={<AuthLayout>
          <GoogleSignIn />
        </AuthLayout>}
          path='/login' />
      </Routes>
    </BrowserRouter>
  )
}

export default App