import React, { useState } from "react";
import "../Styles/SettingsUI.css";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const [theme, setTheme] = useState("auto");
  const [mute, setMute] = useState(false);

  const devices = [
    {
      name: "iPhone 12",
      location: "New York, USA",
      last: "5 mins ago",
    },
    {
      name: "MacBook Pro",
      location: "Los Angeles, USA",
      last: "Today, 10:15 AM",
    },
    {
      name: "Chrome on Windows",
      location: "Chicago, USA",
      last: "Yesterday, 2:45 PM",
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        {/* HEADER */}
        <div className="settings-header">
          <div className="header-left">
            <ArrowLeft className="icon" />
            <h2>Settings</h2>
          </div>

          <div className="header-right">
            <SettingsIcon className="icon" />
            <img
              src="https://i.pravatar.cc/40"
              alt="user"
              className="avatar"
            />
          </div>
        </div>

        {/* THEME */}
        <div className="card">
          <h3>Theme Settings</h3>

          <label className="radio">
            <input
              type="radio"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />
            Light Mode
          </label>

          <label className="radio">
            <input
              type="radio"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            Dark Mode
          </label>

          <label className="radio">
            <input
              type="radio"
              checked={theme === "auto"}
              onChange={() => setTheme("auto")}
            />
            Auto (Set Time)
          </label>

          {theme === "auto" && (
            <div className="time-row">
              <span>From:</span>
              <select>
                <option>7:00 PM</option>
              </select>
              <span>To:</span>
              <select>
                <option>7:00 AM</option>
              </select>
            </div>
          )}
        </div>

        {/* SECURITY */}
        <div className="card">
          <h3>Security</h3>
          <div className="security-row">
            <div>
              <p className="bold">Logout from All Devices</p>
              <span className="sub">
                Sign out from all active sessions.
              </span>
            </div>
            <button className="primary-btn">Log Out Everywhere</button>
          </div>
        </div>

        {/* DEVICES */}
        <div className="card">
          <h3>Active Devices</h3>

          <div className="table">
            <div className="table-head">
              <span>Device</span>
              <span>Location</span>
              <span>Last Active</span>
            </div>

            {devices.map((d, i) => (
              <div className="table-row" key={i}>
                <span>{d.name}</span>
                <span>{d.location}</span>
                <span>{d.last}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="card">
          <h3>Change Password</h3>

          <input placeholder="Current Password" />
          <input placeholder="New Password" />
          <input placeholder="Confirm New Password" />

          <button className="primary-btn full">
            Update Password
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="card">
          <h3>Notifications</h3>

          <div className="toggle-row">
            <div>
              <p className="bold">Notification Sounds</p>
              <span className="sub">
                Enable notification sound effects.
              </span>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={mute}
                onChange={() => setMute(!mute)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}