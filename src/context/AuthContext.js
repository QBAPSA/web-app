import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});
const ADMIN_EMAIL = "jeraldtimbang@admin.com";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  const fetchTeacherData = async (email) => {
    try {
      if (email === ADMIN_EMAIL) {
        // Skip fetching teacher data for admin
        setTeacherData(null);
        return null;
      }

      const { data: teacher, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      setTeacherData(teacher);
      return teacher;
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setTeacherData(null);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchTeacherData(session.user.email);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTeacherData(session.user.email);
      } else {
        setTeacherData(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await fetchTeacherData(data.user.email);
        }
        return { data, error: null };
      } catch (error) {
        console.error("Sign in error:", error);
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setTeacherData(null);
        return { error: null };
      } catch (error) {
        console.error("Sign out error:", error);
        return { error };
      }
    },
    user,
    teacherData,
    loading,
    isAdmin: user?.email === ADMIN_EMAIL,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
