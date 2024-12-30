import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./screen/SignIn";
import Record from "./screen/Record";
import Section from "./screen/Section";
import Calendar from "./screen/Calendar";
import Attendance from "./screen/Attendance";
import Student from "./screen/Student";
import Profile from "./screen/Profile";
import Studentmanage from "./screen/Studentmanage";
import Teachermanage from "./screen/Teachermanage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route
            path="/record"
            element={
              <ProtectedRoute>
                <Record />
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
            path="/studentmanage"
            element={
              <ProtectedRoute>
                <Studentmanage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachermanage"
            element={
              <ProtectedRoute>
                <Teachermanage />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
