import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import  { NotificationCenter } from './components/NotificationCenter'
import NotFound from './pages/NotFound'
import  LoginForm from './features/authentication/LoginForm'
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {

  return (
    <>
      {/* <h1>My App</h1> */}
      {/* <NotificationCenter /> */}
      <AuthProvider>
        <Routes>
         {/* Public Route */}
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<NotificationCenter />} />
        </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App
