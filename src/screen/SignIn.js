import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/SignIn.css";
import logoSchool from "../assets/logoSchool.png";
import bgSignin from "../assets/bg33.png";

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
    <div
      className="sign-in-container"
      style={{
        backgroundImage: `url(${bgSignin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={logoSchool}
          alt="logoSchool"
          style={{ width: "150px", marginRight: "30px" }}
        />
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                border: "none",
                borderBottom: "1px solid #ccc",
                borderRadius: "0",
                fontSize: "16px",
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333" }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                border: "none",
                borderBottom: "1px solid #ccc",
                borderRadius: "0",
                fontSize: "16px",
              }}
            />
          </div>
          {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
          {/* <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontSize: "0.9em", color: "#555" }}>
            <a href="/forgotpassword" style={{ textDecoration: "none", color: "#007bff" }}>Forgot Password?</a>
            <a href="/createaccount" style={{ textDecoration: "none", color: "#007bff" }}>Create Account</a>
          </div> */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#ddd",
              color: "#333",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Signing in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;