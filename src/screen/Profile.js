import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const TeacherProfile = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        if (!user) {
          throw new Error("No user logged in");
        }

        // Fetch teacher data from teachers table
        const { data: teacher, error: teacherError } = await supabase
          .from("teachers")
          .select("*")
          .eq("email", user.email)
          .single();

        if (teacherError) {
          console.error("Error fetching teacher profile:", teacherError.message);
          throw teacherError;
        }

        setTeacherData(teacher);
      } catch (error) {
        console.error("Error:", error);
        setTeacherData(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="error-container">
        <p>No teacher profile data found. Please ensure your profile exists.</p>
        <p>Check the browser console for more details.</p>
      </div>
    );
  }

  return (
    <div className="teacher-profile-container">
      <div className="teacher-profile-header">
        <h1>Teacher Profile</h1>
        <div className="teacher-profile-details">
          <p>
            <strong>Name:</strong> {teacherData.teacher}
          </p>
          <p>
            <strong>Email:</strong> {teacherData.email}
          </p>
          <p>
            <strong>Username:</strong> {teacherData.username}
          </p>
        </div>
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;
