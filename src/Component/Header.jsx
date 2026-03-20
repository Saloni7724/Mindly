import React, { useEffect, useMemo, useState } from "react";
import "../Styles/Header.css";
import {

  ChartNoAxesColumn,
  LogOut,
  Pen,
  Search,
  Settings,
  Type,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Backend/firebase-init";
import { getDoc, doc } from "firebase/firestore";
import { generateRandomId } from "../Utils/generateId";
import { blogTags } from "../Utils/tags";

import NotificationBell from "../Component/NotificationBell";

export default function Header({ setLoading }) {
  const [userProfilePicUrl, setUserProfileImage] = useState(null);
  const [placeholderText, setPlaceholderText] = useState("Search...");
  const [searchParams, setSearchParams] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [sidebar, setSideBarStatus] = useState(false);

  const searchSuggestions = useMemo(
    () => [
      '"Artificial Intelligence"',
      '"Blockchain"',
      '"Travel"',
      '"Cooking"',
      '"Mental Health"',
    ],
    []
  );
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfileImage(userData.profile_pic_url || null);
      }
    } else {
      setUserProfileImage(null);
    }
  });

  return () => unsubscribe();
}, []);


  useEffect(() => {
    document.title = "Welcome to Mindly";

    const userInterestedTags = localStorage.getItem("user_interested_tags");
    const userIdfromLocal = localStorage.getItem("user_id");
   

    if (
      !userProfilePicUrl ||
      !userInterestedTags ||
      userIdfromLocal !== auth.currentUser?.uid
    ) {
      const fetchUserData = async () => {
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.profile_pic_url) {
              setUserProfileImage(userData.profile_pic_url);
            }
            if (userData.user_interested_tags) {
              const tags = userData.user_interested_tags.join(",");
              localStorage.setItem("user_interested_tags", tags);
            }
            localStorage.setItem("user_name", userData.user_name);
          }
        }
      };

      fetchUserData();
    }

    let index = 0;
    const interval = setInterval(() => {
      setPlaceholderText(`Search ${searchSuggestions[index]}`);
      index = (index + 1) % searchSuggestions.length;
    }, 2000);

    return () => clearInterval(interval);
  }, [searchSuggestions]);

  const gotoSearch = () => {
    console.log("Search Param", searchParams);
  };

  const gotowrite = () => {
    navigate(`/p/${generateRandomId()}/edit`);
  };

  const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    const maskedLocalPart =
      localPart.slice(0, 2) + "*".repeat(localPart.length - 2);
    return `${maskedLocalPart}@${domain}`;
  };

  const clearAllcookies = () => {
    const cookies = document.cookie.split(";");

    // Iterate through each cookie
    cookies.forEach((cookie) => {
      // Get the cookie name by splitting the cookie string
      const name = cookie.split("=")[0].trim();

      // Delete the cookie by setting its expiry date to a past date and specifying the path
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    });
  };

  const signOut = async () => {
    try {
      auth.signOut();
      clearAllcookies();
      setLoading();
      console.log("Logout Successful..");
      navigate("/homepage");
    } catch (error) {
      console.log("LOGOUT-ERROR", error.message);
    }
  };

  // Update search suggestions as the user types
  const handleSearchInputChange = (e) => {
    const input = e.target.value;
    setSearchParams(input);

    // Filter tags based on the input
    if (input) {
      const suggestions = blogTags.filter((tag) =>
        tag.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredTags(suggestions);
    } else {
      setFilteredTags([]);
    }
  };

  const searchContent = (tag) => {
    setSearchParams(tag);
    setFilteredTags([]);
    navigate(`/searchresult/${tag}`);
  };

  // Handle input focus and blur
  const handleInputFocus = () => setIsFocused(true);
  const handleInputBlur = () => {
    setTimeout(() => setIsFocused(false), 150); // Delay to allow click event to fire
  };

  const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};


  return (
    <div className="top-class-header">
      <div className="left-header-part">
        <h1
          className="sitename"
          style={{ fontSize: "35px", cursor: "pointer" }}
          onClick={() => window.location.reload()}
        >
          Mindly
        </h1>
        <div className="search-input-div">
          <Search
            size={20}
            style={{ color: "#3f3f3f", cursor: "pointer" }}
            onClick={gotoSearch}
          />
          <input
            type="text"
            className="search-content-bar"
            value={searchParams}
            onChange={handleSearchInputChange}
            placeholder={placeholderText}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                gotoSearch();
              }
            }}
          />
          {isFocused && filteredTags.length > 0 && (
            <ul className="suggestions-list">
              {filteredTags.map((tag, index) => (
                <li
                  key={index}
                  onMouseDown={() => {
                    searchContent(tag);
                  }}
                  className="suggestion-item"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="right-header-part">
        <div className="write-button-div" onClick={gotowrite}>
          <Pen size={18} style={{ color: "#676767" }} />
          <h3 className="write-button-h3-tag">Write</h3>
        </div>
       <NotificationBell />
{userProfilePicUrl ? (
  <img
    src={userProfilePicUrl}
    alt="U"
    className="user-profile-pic-url"
    onClick={() => setSideBarStatus(!sidebar)}
  />
) : (
  <div
    className="user-profile-pic-fallback"
    onClick={() => setSideBarStatus(!sidebar)}
  >
    {getInitials(
      auth.currentUser?.displayName ||
      localStorage.getItem("user_name") ||
      auth.currentUser?.email ||
      "User"
    )}
  </div>
)}


      </div>

      <div
        className={`floating-window-sidebar ${sidebar ? "active" : ""}`}
        style={{ border: "1px solid #D8D8D8" }}
      >
        <div className="content" onClick={() => navigate("/manageprofile")}>
          <UserRound size={20} strokeWidth={1.25} className="icon" />
          <h4 className="floating-window-text">Profile</h4>
        </div>
        <div className="content" onClick={() => navigate("/post/draft")}>
          <Type size={20} strokeWidth={1.25} className="icon" />
          <h4 className="floating-window-text">Your Post</h4>
        </div>
        <div className="content">
          <ChartNoAxesColumn size={20} strokeWidth={1.25} className="icon" />
          <h4 className="floating-window-text">Stats</h4>
        </div>
        <div className="content">
          <Settings size={20} strokeWidth={1.25} className="icon" />
          <h4 className="floating-window-text" onClick={() =>navigate("/Settings")}>Setting</h4>
        </div>
        <div className="divider"></div>
        <div
          className="signout"
          onClick={signOut}
          style={{ cursor: "pointer" }}
        >
          <div className="content">
            <LogOut size={20} color="#975757" strokeWidth={1.25} />
            <h4 className="floating-window-text" style={{ color: "#975757" }}>
              Sign Out
            </h4>
          </div>
          <h4 className="floating-window-text" style={{ color: "#975757" }}>
            {auth.currentUser ? maskEmail(auth.currentUser.email) : "No Email"}
          </h4>
        </div>
      </div>
    </div>
  );
}
