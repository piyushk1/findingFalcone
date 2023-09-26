import React from "react";

function Popup({ timeTaken, planetName, onClose }) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h1>
          Success! Congratulations on finding Falcone! King Shan is Mighty
          Pleased!
        </h1>
        <h1>Time Taken: {timeTaken}</h1>
        <h1>Planet found: {planetName}</h1>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Popup;
