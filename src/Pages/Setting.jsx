import React, { useState, useEffect } from "react";
import "../Styles/Setting.css";
import { ArrowLeft } from "lucide-react";
import { auth } from "../Backend/firebase-init";
import { getuserDetail } from "../Utils/getuserDetail";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Backend/firebase-init";
import { doc, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

export default function Setting() {
const { theme, setTheme } = useContext(ThemeContext);
  const [mute, setMute] = useState(false);
  const navigate = useNavigate();
  // ✅ PASSWORD STATES (FIXED)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userProfile, setUserProfile] = useState(null);

const [devices, setDevices] = useState([]);
const fetchDevices = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    const snapshot = await getDocs(
      collection(db, "userSessions", uid, "sessions")
    );

    const deviceList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setDevices(deviceList);
  } catch (err) {
    console.log(err);
  }
};

const logoutAllDevices = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    await updateDoc(doc(db, "users", uid), {
      forceLogout: true,
    });
 
    alert("Logged out from all devices");
  } catch (err) {
    console.log(err);
  }
};
  // ✅ FETCH USER
  useEffect(() => {
     fetchDevices();
    const fetchUser = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const data = await getuserDetail(uid);
        if (Array.isArray(data) && data.length > 0) {
          setUserProfile(data[0]);
        }
      } catch (err) {
        console.log("Error:", err);
      }
    };

    fetchUser();
  }, []);

  // ✅ APPLY THEME TO BODY


  // 🔐 PASSWORD UPDATE
  const handlePasswordUpdate = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // 🔐 re-authenticate
      await reauthenticateWithCredential(user, credential);

      // 🔄 update password
      await updatePassword(user, newPassword);

      alert("Password updated successfully");

      // clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Wrong current password or session expired");
      console.log(error);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">

        {/* HEADER */}
        <div className="settings-header">
          <div className="header-left">
           <ArrowLeft className="icon" onClick={() => navigate("/home")} />
            <h2>Settings</h2>
          </div>

          <div className="header-right">
            <img
              className="avatar"
              src={userProfile?.profile_pic_url}
              alt="profile"
            />
          </div>
        </div>

        {/* THEME */}
        <div className="card1">
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
        </div>

        {/* SECURITY */}
        <div className="card1">
          <h3>Security</h3>

          <div className="security-row">
            <div>
              <p className="bold">Logout from All Devices</p>
              <span className="sub">
                Sign out from all active sessions.
              </span>
            </div>
           <button className="primary-btn" onClick={logoutAllDevices}>
  Log Out Everywhere
</button>
          </div>
        </div>

        {/* DEVICES */}
        <div className="card1">
          <h3>Active Devices</h3>

          <div className="table">
            <div className="table-head">
              <span>Device</span>
              <span>Location</span>
              <span>Last Active</span>
            </div>

           {devices.map((d, i) => (
  <div className="table-row" key={i}>
    <span>{d.device}</span>
    <span>Unknown</span>
    <span>{d.lastActive?.toDate?.().toLocaleString() || "Now"}</span>
  </div>
))}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="card1">
          <h3>Change Password</h3>

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="primary-btn full" onClick={handlePasswordUpdate}>
            Update Password
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="card1">
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