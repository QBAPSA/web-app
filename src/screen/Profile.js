import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const ADMIN_EMAIL = "jeraldtimbang@admin.com";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) {
          throw new Error("No user logged in");
        }

        if (user.email === ADMIN_EMAIL) {
          // Fetch admin data
          const { data: adminData, error: adminError } = await supabase
            .from("admin")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          if (adminError) {
            console.error("Error fetching admin profile:", adminError.message);
            throw adminError;
          }

          setProfileData({
            full_name: adminData?.full_name || "Jerald Timbang",
            email: adminData?.email || user.email,
            isAdmin: true
          });
        } else {
          // Fetch teacher data
          const { data: teacher, error: teacherError } = await supabase
            .from("teachers")
            .select("*")
            .eq("email", user.email)
            .single();

          if (teacherError) {
            console.error("Error fetching teacher profile:", teacherError.message);
            throw teacherError;
          }

          setProfileData({
            full_name: teacher.teacher,
            email: teacher.email,
            username: teacher.username,
            teacher_id: teacher.teacher_id,
            isAdmin: false
          });
        }
      } catch (error) {
        console.error("Error:", error);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profileData) {
    return <div className="error">Error loading profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>
      <div className="profile-content">
        <div className="profile-info">
          <h2>{profileData.isAdmin ? "Admin Profile" : "Teacher Profile"}</h2>
          <div className="info-item">
            <label>Full Name:</label>
            <span>{profileData.full_name}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{profileData.email}</span>
          </div>
          {!profileData.isAdmin && (
            <>
              <div className="info-item">
                <label>Username:</label>
                <span>{profileData.username}</span>
              </div>
              {/* <div className="info-item">
                <label>ID:</label>
                <span>{profileData.teacher_id}</span>
              </div> */}
            </>
          )}
        </div>
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;