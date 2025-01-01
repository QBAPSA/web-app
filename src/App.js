import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./screen/SignIn";
import Record from "./screen/Record";
import Section from "./screen/Section";
import Calendar from "./screen/Calendar";
import Attendance from "./screen/Attendance";
import Student from "./screen/Student";
import Profile from "./screen/Profile";
import Studentmanage from "./screen/Studentmanage";
import Teachermanage from "./screen/Teachermanage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoute from "./components/PrivateRoute";

const ADMIN_EMAIL = "jeraldtimbang@admin.com";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route
        path="/record"
        element={
          <ProtectedRoute>
            {user?.email !== ADMIN_EMAIL ? (
              <Record />
            ) : (
              <Navigate to="/StudentManage" />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/section"
        element={
          <ProtectedRoute>
            <Section />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/:month"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <Student />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studentmanage"
        element={
          <PrivateRoute allowedEmail={ADMIN_EMAIL}>
            <Studentmanage />
          </PrivateRoute>
        }
      />
      <Route
        path="/teachermanage"
        element={
          <PrivateRoute allowedEmail={ADMIN_EMAIL}>
            <Teachermanage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
