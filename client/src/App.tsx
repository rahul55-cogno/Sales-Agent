import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import { GoogleSignIn } from './components/GoogleSignIn';
import { AuthLayout } from './components/AuthLayout';
import Landing from './pages/Landing';
import { ProtectedRoute } from './components/Protected';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />
        <Route element={<Landing />} path="/home" />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <GoogleSignIn/>
            </AuthLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
