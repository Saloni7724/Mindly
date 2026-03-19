import React from "react";
import "../Styles/Teammindly.css";
import { useNavigate } from "react-router-dom";
import female from "../Utils/MANSI.jpg";
import female2 from "../Utils/SALONI.jpg";


export default function Teammindly() {
  const navigate = useNavigate();

  const gotohome = () => {
    navigate("/");
  };

  return (
    <div className="main-team-part">
      <h1 className="sitename">Mindly</h1>

      <div className="card">
        <div className="actual-card">
          
          {/* ✅ Fixed Profile Photo */}
          <img
            src={female}
            alt="profile"
            className="avatar"
          />

          <h1 className="team-member-name">Mansi Patel</h1>
          <p className="team-member-skills">Fullstack Developer</p>
        </div>
      </div>

      <div className="card-female">
        <div className="actual-card">
          
          {/* ✅ Fixed Profile Photo */}
          <img
            src={female2}
            alt="profile"
            className="avatar"
          />

          <h1 className="team-member-name">Saloni Patel</h1>
          <p className="team-member-skills">Fullstack Developer</p>
        </div>
      </div>

      <button className="gotohomepage" onClick={gotohome}>
        Homepage
      </button>
    </div>
  );
}