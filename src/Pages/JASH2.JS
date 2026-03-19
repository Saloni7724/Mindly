  
  
  
 //Yourprofile.js 
  
  
  
  import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import { auth, db } from "../Backend/firebase-init";
import { getuserDetail } from "../Utils/getuserDetail";
import { setDoc } from "firebase/firestore";

import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import "../Styles/Yourprofile.css";
import { Ellipsis, EllipsisVertical, Pen, X } from "lucide-react";
import Publicprofilepost from "../Component/Publicprofilepost";
import { toast, ToastContainer } from "react-toastify";

export default function Yourprofile() {
  // ✅ userprofile should be null initially (not [])
  const [userprofile, setUserprofile] = useState(null);

  const [userBlog, setUserBlog] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followeeIds, setFolloweeIds] = useState([]);
  const [followeeProfileDetail, setFolloweeProfileDetail] = useState([]);
  const [followerData, setFollowerData] = useState([]);
  const [followerDataIds, setFollowerDataIds] = useState([]);
  const [isPost, setIsPost] = useState(true);
  const [saveData, setsaveData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUsername, setnewUsername] = useState("");
  const [newDescription, setnewDescription] = useState("");

  // ✅ Fetch user profile safely
  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const userData = await getuserDetail(uid);

        // userData expected: array, take first item if available
        if (Array.isArray(userData) && userData.length > 0 && userData[0]) {
          setUserprofile(userData[0]);
        } else {
          // ✅ fallback (prevents crash)
          setUserprofile({
            user_id: uid,
            user_name: "New User",
            user_profile_description: "",
            profile_pic_url: "https://i.pravatar.cc/150?img=3",
            user_interested_tags: [],
            saveList: [],
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        // ✅ fallback even if error occurs
        const uid2 = auth.currentUser?.uid;
        if (uid2) {
          setUserprofile({
            user_id: uid2,
            user_name: "New User",
            user_profile_description: "",
            profile_pic_url: "https://i.pravatar.cc/150?img=3",
            user_interested_tags: [],
            saveList: [],
          });
        }
      }
    };

    fetchUserData();
  }, []);

  // ✅ Load blogs + followees after profile is available
  useEffect(() => {
    const getUserBlog = async () => {
      if (!userprofile?.user_id) return;

      const blogCollection = collection(db, "Blog");
      const queryIntent = query(
        blogCollection,
        where("user_id", "==", auth.currentUser?.uid || userprofile.user_id),
        where("blog_status", "==", "Publish")
      );

      const blogDataSnapShots = await getDocs(queryIntent);
      const blogData = blogDataSnapShots.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setUserBlog(blogData);
    };

    const getFolloweeData = async () => {
      if (!userprofile?.user_id) return;

      const followeeCollection = collection(db, "Follower");
      const queryIntent = query(
        followeeCollection,
        where("follower_id", "==", userprofile.user_id),
        limit(5)
      );

      const followeeSnapShots = await getDocs(queryIntent);
      const followeeData = followeeSnapShots.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setFolloweeIds(followeeData);
    };

    if (userprofile?.user_id) {
      getUserBlog();
      getFolloweeData();
      setnewUsername(userprofile?.user_name || "");
      setnewDescription(userprofile?.user_profile_description || "");
    }
  }, [userprofile]);

  // ✅ Fetch followee profile details safely (skip undefined users)
  useEffect(() => {
    const getAllFollowers = async () => {
      try {
        for (const value of followeeIds) {
          if (!value?.followee_id) continue;

          const userData = await getuserDetail(value.followee_id);
          const newUser = Array.isArray(userData) ? userData[0] : null;
          if (!newUser || !newUser.user_id) continue;

          setFolloweeProfileDetail((prev) => {
            const isUserExists = prev.some(
              (user) => user?.user_id === newUser.user_id
            );
            if (!isUserExists) return [...prev, newUser];
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching follower user data:", error);
      }
    };

    if (followeeIds.length) getAllFollowers();
  }, [followeeIds]);

const getAllFollowersData = async (list) => {
  if (!Array.isArray(list) || list.length === 0) return;

  try {
    for (const value of list) {
      if (!value?.follower_id) continue;

      const userData = await getuserDetail(value.follower_id);
      const newUser = Array.isArray(userData) ? userData[0] : null;
      if (!newUser || !newUser.user_id) continue;

      setFollowerData((prev) => {
        const exists = prev.some(
          (u) => u?.user_id === newUser.user_id
        );
        return exists ? prev : [...prev, newUser];
      });
    }
  } catch (error) {
    console.error("Error fetching follower data:", error);
  }
};


const getFollowerData = async () => {
  if (!userprofile?.user_id) return;

  const followeeCollection = collection(db, "Follower");
  const queryIntent = query(
    followeeCollection,
    where("followee_id", "==", userprofile.user_id),
    limit(5)
  );

  const followeeSnapShots = await getDocs(queryIntent);
  const followeeData = followeeSnapShots.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setFollowerDataIds(followeeData);
  await getAllFollowersData(followeeData); // ✅ IMPORTANT
};


const toggleIsFollowing = () => {
  setIsFollowing((prev) => {
    const next = !prev;
    if (next) {
      getFollowerData(); // Followers tab open hote hi load
    }
    return next;
  });
};


  const savedBlog = async (blogId) => {
    try {
      if (!blogId || (Array.isArray(blogId) && blogId.length === 0)) return;

      const blogRef = collection(db, "Blog");
      const q = query(blogRef, where("blog_id", "in", blogId));
      const docData = await getDocs(q);
      const data = docData.docs.map((d) => d.data());
      setsaveData(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadSavedData = async () => {
    if (!userprofile?.saveList) return;
    savedBlog(userprofile.saveList);
  };

const updateProfile = async () => {
  if (!auth.currentUser?.uid) return;

  if (!newUsername || !newDescription) {
    toast.error("Please fill username and description");
    return;
  }

  if (
    newUsername === (userprofile?.user_name || "") &&
    newDescription === (userprofile?.user_profile_description || "")
  ) {
    toast.error(`Oops! Looks like you haven't made any changes to your profile yet.`);
    return;
  }

  const updateData = {
    user_id: auth.currentUser.uid, // ✅ ensure this field exists
    user_name: newUsername,
    user_profile_description: newDescription,
    profile_pic_url: userprofile?.profile_pic_url || "",
  };

  const updatedDocRef = doc(db, "users", auth.currentUser.uid);

  try {
    await setDoc(updatedDocRef, updateData, { merge: true }); // ✅ works even if doc doesn't exist
    toast.success("Profile updated");
    // instead of full reload, fetch again (but reload is ok)
    window.location.reload();
  } catch (error) {
    console.log("ERROR-UPDATING-PROFILE", error.message);
    toast.error("Profile update failed: " + error.message);
  }
};


  // ✅ Prevent crash before userprofile is loaded
  if (!userprofile) {
    return (
      <>
        <ToastContainer
          style={{ fontFamily: "Poppins", fontSize: "14px" }}
          autoClose={2000}
        />
        <Header />
        <div style={{ padding: 20 }}>Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <ToastContainer
        style={{
          fontFamily: "Poppins",
          fontSize: "14px",
        }}
        autoClose={2000}
      />

      {isDialogOpen && (
        <div className="dialog-backdrop" onClick={() => setIsDialogOpen(false)}>
          <div
            className="dialogbox-profile"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="site-name-from-side-bar">
              <h2 className="sitename" style={{ margin: "0px" }}>
                Mindly
              </h2>
              <X
                size={20}
                strokeWidth={1.25}
                onClick={() => setIsDialogOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="changeusername">
              <p className="laber-for-input">Email Address</p>
              <input
                type="text"
                value={auth.currentUser?.email || ""}
                disabled
                style={{ cursor: "no-drop" }}
              />
            </div>
            <div className="changeimage">
              <p className="laber-for-input">Profile Picture</p>
              <img
                src={userprofile.profile_pic_url}
                alt={`${userprofile.user_name}.jpge`}
                style={{ cursor: "no-drop" }}
              />
            </div>
            <div className="changeusername">
              <p className="laber-for-input">Username</p>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setnewUsername(e.target.value)}
              />
            </div>
            <div className="changeusername">
              <p className="laber-for-input">Description</p>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setnewDescription(e.target.value)}
              />
            </div>
            <div className="comment-edit-button">
              <button className="edit-comment-button" onClick={updateProfile}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* this is the main page */}
      <Header />
      <div className="manage-profile-part">
        <div className="manage-profile-left-side">
          <div className="profile-upper-part">
            <img src={userprofile.profile_pic_url} alt="" />
            <div className="profile-upper-part-right-side">
              <div className="main-name-profile-upper-part">
                <h1 className="user-name-profile-upper-part">
                  {userprofile.user_name}
                </h1>
                <EllipsisVertical
                  size={20}
                  strokeWidth={1.25}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <p className="profile-upper-part-description">
                {userprofile.user_profile_description}
              </p>
              <button
                className="manage-profile-edit-profile"
                onClick={() => setIsDialogOpen(true)}
              >
                <Pen size={14} strokeWidth={1.25} />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="manage-profile-bottom-part">
            <div className="post-and-savelist-user">
              <button
                className={`visible-post-buttons ${
                  isPost ? "active-button-post" : ""
                }`}
                onClick={() => setIsPost(true)}
              >
                Post
              </button>
              <button
                className={`visible-post-buttons ${
                  !isPost ? "active-button-post" : ""
                }`}
                onClick={() => {
                  setIsPost(false);
                  loadSavedData();
                }}
              >
                Saved
              </button>
            </div>

            {isPost
              ? userBlog.map((blog, index) => (
                  <div key={index}>
                    <Publicprofilepost blogData={blog} userData={userprofile} />
                  </div>
                ))
              : saveData.map((blog, index) => (
                  <div key={index}>
                    <Publicprofilepost
                      blogData={blog}
                      isSaved={true}
                      userData={userprofile}
                    />
                  </div>
                ))}

            {isPost && userBlog.length <= 0 && (
              <div className="no-data-found">
                <p>Oops! It seems like you haven't shared anything yet.</p>
              </div>
            )}

            {!isPost && saveData.length <= 0 && (
              <div className="no-data-found">
                <p>Oops! It seems like you haven't shared anything yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="manage-profile-right-side">
          <div className="following-follower-buttons">
            <button
              className={`isFollowing ${isFollowing ? "active" : ""}`}
              onClick={toggleIsFollowing}
            >
              Followers
            </button>
            <button
              className={`isFollowing ${!isFollowing ? "active" : ""}`}
              onClick={toggleIsFollowing}
            >
              Following
            </button>
          </div>

          <div className="bottom-following-follower-part">
            {!isFollowing ? (
              <div className="follower-active">
                {followeeProfileDetail
                  .filter((u) => u && u.user_name) // ✅ safety
                  .map((userData, index) => (
                    <div key={index} className="personal-data-user">
                      <img src={userData?.profile_pic_url} alt="random.png" />
                      <div className="user-name-action">
                        <p className="user-name-followee">
                          {userData.user_name}
                        </p>
                        <Ellipsis
                          size={16}
                          strokeWidth={1.25}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  ))}
                {followeeProfileDetail.length <= 0 && (
                  <div className="loader-follower">
                    <p>Look's Like You are No Following Anyone</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="follower">
                {followerData
                  .filter((u) => u && u.user_name) // ✅ safety
                  .map((userData, index) => (
                    <div key={index} className="personal-data-user">
                      <img src={userData?.profile_pic_url} alt="random.png" />
                      <div className="user-name-action">
                        <p className="user-name-followee">
                          {userData.user_name}
                        </p>
                        <Ellipsis
                          size={16}
                          strokeWidth={1.25}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  ))}
                {followerData.length <= 0 && (
                  <div className="loader-follower">
                    <p>
                      Looks like no one's following you yet. <br />
                      Keep sharing, and they'll be sure to find you!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
