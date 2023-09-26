import React from "react";
import "./Header.css"; // You can create a CSS file for styling
import falcone from "./assets/falcone.png";
const Header = () => {
  return (
    <div className="header">
      <div className="header-left">
        <img
          src={falcone} // Replace with the actual path to your space icon
          alt="Space Icon"
          className="space-icon"
        />
      </div>
      <div className="header-title">Finding Falcone</div>
      <div className="header-right">
        <span className="header-link">Reset</span>
        <span className="header-link">Geektrust</span>
        <img
          src="/avatar.png" // Replace with the actual path to your avatar image
          alt="Avatar"
          className="avatar"
        />
      </div>
    </div>
  );
};

export default Header;
