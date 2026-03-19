import React, { useEffect, useState } from "react";
import "../Styles/Userprofile.css";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"; // ✅ added serverTimestamp
import { auth, db } from "../Backend/firebase-init";
import { useNavigate } from "react-router-dom";
import img from "../Utils/profilepicture.png";
import { toast, ToastContainer } from "react-toastify";
import { blogTags } from "../Utils/tags.js";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth"; // ✅ added
import Avatar from "../Component/Avatar";




export default function Userprofile({ setLoading }) {
  // Initialization of the Data
    const [profileName, setProfileName] = useState("");

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  const [authUser, setAuthUser] = useState(null);

  const [user, setUser] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isTagsEnabled, setTagEnabled] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [loading, isLoading] = useState(false);
  const [checking, setChecking] = useState(true);


  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    setAuthUser(user);
     console.log("PHOTO URL 👉", authUser?.photoURL);

    if (!user) {
      navigate("/");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
setProfileName(data?.user_name || "");
console.log("PROFILE NAME 👉", data?.name);


      if (snap.exists() && snap.data()?.profileCompleted === true) {
        navigate("/");
        return;
      }
    } catch (e) {
      navigate("/");
      return;
    } finally {
      setChecking(false);
    }
  });

  return () => unsub();
}, [navigate]);



  // ✅ GUARD: if profile already completed, redirect to home
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/"); // not logged in
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data();

          // ✅ if profile already completed, block this page
          if (data?.profileCompleted === true) {
            navigate("/");
            return;
          }

          // ✅ prefill if partial data exists (optional)
          if (data?.user_name) setName(data.user_name);
          if (data?.user_profile_description) setDescription(data.user_profile_description);
const pic = data?.profile_pic_url || "";

// agar DB me placeholder/default wali image saved hai to usko empty treat karo
if (!pic || pic.includes("profilepicture")) setProfilePicUrl("");
else setProfilePicUrl(pic);


          // ✅ store minimal local cache (optional)
          if (data?.user_id) localStorage.setItem("user_id", data.user_id);
        }
      } catch (e) {
        console.log("Userprofile guard error:", e);
        navigate("/");
      }
    });

    return () => unsub();
  }, [navigate]);
 

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  // Handle profile picture change
const handleProfilePicChange = (e) => {
  const file = e.target.files?.[0];

  // ✅ agar file select nahi hui (cancel) to empty kar do
  if (!file) {
    setProfilePicUrl("");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setProfilePicUrl(reader.result); // local preview
  };
  reader.readAsDataURL(file);
};


  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const setTagEnagle = () => {
  if (!name || !description) {
  toast.error("Fields Cannot be Empty");
  return;
    } else {
      setTagEnabled(true);
    }
  };

  const storeIntoDatabase = async () => {
    isLoading(true);

    // ✅ bug fix: stop loader if error happens
    if (selectedTags.length < 5) {
      toast.error("Select Minimum 5 Tags");
      isLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User is not authenticated.");
        isLoading(false);
        navigate("/");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);

      // ✅ IMPORTANT: merge true + profileCompleted true
      await setDoc(
        userDocRef,
        {
          user_id: user.uid,
          user_name: name,
          user_profile_description: description,
          profile_pic_url: profilePicUrl,
          user_interested_tags: selectedTags,
          profileCompleted: true, // ✅ THIS is the key
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(), // harmless if already exists (merge)
        },
        { merge: true }
      );

      // Store profile data in local storage (optional)
      localStorage.removeItem("newUser"); // old logic, keep for safety
      localStorage.setItem("user_id", user.uid);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_profile_description", description);
      localStorage.setItem("profile_pic_url", profilePicUrl);
      localStorage.setItem("user_interested_tags", JSON.stringify(selectedTags));

      toast.success("Profile Created successfully!");
      if (typeof setLoading === "function") setLoading();

      navigate("/");
    } catch (error) {
      console.error("Error storing data:", error);
      toast.error("Error updating profile: " + error.message);
    }

    isLoading(false);
  };


  // Actual Html (UI SAME)
  if (checking) return null;
console.log("USER DATA 👉", user);
// const getInitials = (name = "") => {
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "U";
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//   return (parts[0][0] + parts[1][0]).toUpperCase();
// };
const initialsName = name || authUser?.displayName || authUser?.email || "User";
console.log("✅ USERPROFILE OPENED");

  return (
    <>
      <ToastContainer
        style={{
          fontFamily: "Roboto",
          fontSize: "14px",
        }}
      />

      <div className={`commonbutton ${isTagsEnabled ? "show" : ""}`}>
        <h1 className="sitename">Mindly</h1>
        <h3 className="setuprofiletext">Select Your Interested Tag</h3>
        <div className="selectTag">
          {blogTags.map((tag, index) => (
            <button
              key={index}
              className={`tagItem ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="continuebutton1">
          <button
            className="continue"
            type="button"
            onClick={storeIntoDatabase}
            disabled={loading}
            style={{
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {!loading ? (
              "Continue"
            ) : (
              <Loader2 size={15} style={{ color: "white" }} className="loader" />
            )}
          </button>
        </div>
      </div>

      <div className={`setupyourprofile ${!isTagsEnabled ? "show" : ""}`}>
        <h1 className="sitename">Mindly</h1>
        <h3 className="setuprofiletext">Update Your Profile</h3>
        <div className="profileactualdetail">
          <div
            className="profilepicture-container"
            onClick={() => document.getElementById("fileInput").click()}
          >
{profilePicUrl ? (
  <img src={profilePicUrl} alt="Profile" className="profilepicture" />
) : (
  <div className="profileAvatarFallback">
   {getInitials(initialsName)}

  </div>
)}





          </div>
          <div className="nameanddescription">
            <input
              type="text"
              className="name"
              placeholder="Profile Name"
              value={name}
              onChange={handleNameChange}
            />
            <input
              type="text"
              className="description"
              placeholder="Description"
              value={description}
              onChange={handleDescriptionChange}
            />
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
            />
          </div>
        </div>
        

        <div className="continuebutton">
          <button className="continue" onClick={setTagEnagle}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}
