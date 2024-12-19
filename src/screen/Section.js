import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../styles/Home.css'; // Ensure this path is correct

const Section = () => {
  const [showMenu, setShowMenu] = useState(false);

  // Function to toggle popup menu visibility
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="menu-icon" onClick={toggleMenu}>☰</div>
        <h1>Section</h1>
      </header>

      <div className="home-content">
        {/* <h2>ICT 11</h2> */}
        <div className="month-container">
          <Link to="/calendar/January" className="month-button">January</Link>
          <Link to="/calendar/February" className="month-button">February</Link>
          <Link to="/calendar/March" className="month-button">March</Link>
          <Link to="/calendar/April" className="month-button">April</Link>
          <Link to="/calendar/May" className="month-button">May</Link>
          <Link to="/calendar/June" className="month-button">June</Link>
          <Link to="/calendar/July" className="month-button">July</Link>
          <Link to="/calendar/August" className="month-button">August</Link>
          <Link to="/calendar/September" className="month-button">September</Link>
          <Link to="/calendar/October" className="month-button">October</Link>
          <Link to="/calendar/November" className="month-button">November</Link>
          <Link to="/calendar/December" className="month-button">December</Link>
        </div>
      </div>

      {/* Popup Menu */}
      {showMenu && (
        <div className={`side-menu ${showMenu ? 'active' : ''}`}>
        <button className="close-btn" onClick={toggleMenu}>Close</button>
        <ul>
        {/* <li><Link to="/home" onClick={toggleMenu}>Home</Link></li> */}
        
        <li><Link to="/Attendance" onClick={toggleMenu} style={{color: 'white'}}>Attendance</Link></li>
        <li><Link to="/Student" onClick={toggleMenu} style={{color: 'white'}}>Override</Link></li>
        <li><Link to="/Profile" onClick={toggleMenu} style={{color: 'white'}}>Profile</Link></li>
            </ul>
          </div>
        
      )}
    </div>
  );
};

export default Section;
