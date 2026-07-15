import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
    <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/feed' : '/login'} replace />} />
  </Routes>;
}
