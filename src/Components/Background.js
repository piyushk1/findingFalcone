import * as React from "react";
import "../Components/Background.css";

function Background() {
  return (
    <div>
      <div className="bg"></div>
      <div className="star-field">
        <div className="layer"></div>
        <div className="layer"></div>
        <div className="layer"></div>
      </div>
    </div>
  );
}

export default Background;
