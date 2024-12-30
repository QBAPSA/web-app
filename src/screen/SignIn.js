import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/SignIn.css";
import logoSchool from "../assets/logoSchool.png";
import logoUSTP from "../assets/logoUSTP.png";

const ADMIN_EMAIL = "jeraldtimbang@admin.com";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
      } else {
        // Redirect to studentmanage if admin, otherwise to record
        if (email === ADMIN_EMAIL) {
          navigate("/StudentManage");
        } else {
          navigate("/record");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <img src={logoUSTP} alt="logoUSTP" className="logogo" />
      <img src={logoSchool} alt="logoSchool" className="logogo" />
      <h2>Welcome to QBAPSA</h2>
      <p>Sign into your Account</p>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default SignIn;
