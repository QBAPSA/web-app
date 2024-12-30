import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Record = () => {
  const [showMenu, setShowMenu] = useState(false);

  // Function to toggle sliding menu visibility
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <h1>Record</h1>
      </header>

      {/* Sliding Menu */}
      <div className={`side-menu ${showMenu ? "active" : ""}`}>
        <button className="close-btn" onClick={toggleMenu}>
          Close
        </button>
        <ul>
          {/* <li><Link to="/home" onClick={toggleMenu}>Home</Link></li> */}
          <li>
            <Link
              to="/Attendance"
              onClick={toggleMenu}
              style={{ color: "white" }}
            >
              Attendance
            </Link>
          </li>
          <li>
            <Link to="/Student" onClick={toggleMenu} style={{ color: "white" }}>
              Override
            </Link>
          </li>
          <li>
            <Link to="/Profile" onClick={toggleMenu} style={{ color: "white" }}>
              Profile
            </Link>
          </li>
          <li>
            {/* <Link
              to="/Studentmanage"
              onClick={toggleMenu}
              style={{ color: "white" }}>
              Student
            </Link> */}
          </li>
        </ul>
      </div>

      <div className="home-content">
        <h2>QR-Based Attendance with Parental SMS Alert</h2>
        <div className="button-container">
          <Link to="/section">
            <button className="class-button">ICT11</button>
          </Link>
          {/* <Link to="/section">
            <button className="class-button">ICT12</button>
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Record;


