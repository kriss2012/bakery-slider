import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-brand">DvBakes</div>
      <ul className="nav-items">
        <li>Home</li>
        <li>Menu</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <button className="nav-button">Order Now</button>
    </div>
  );
};

export default Navbar;
