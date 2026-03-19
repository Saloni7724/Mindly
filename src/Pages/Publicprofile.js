import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../Backend/firebase-init";
import { addDoc, serverTimestamp } from "firebase/firestore";
import {
  collection,
  query,
  limit,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";

import "../Styles/Publicprofile.css";
import Publicprofilepost from "../Component/Publicprofilepost";
import { ArrowLeft } from "lucide-react";
import { unfollow } from "../Utils/Unfollowpage";
import { checkfollow, followpage } from "../Utils/Followpage";
import { toast } from "react-toastify";

export default function Publicprofile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [isFollow, setIsFollow] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH USER =================
  useEffect(() => {
    document.title = `${username} - Profile - Mindly`;

    const fetchUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("user_name", "==", username));
        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUser(userData.length > 0 ? userData[0] : null);
      } catch (error) {
        console.log("User Fetch Error:", error);
      }
      setLoading(false);
    };

    fetchUser();
  }, [username]);

  // ================= FETCH BLOGS + FOLLOW =================
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, "Blog");
        const q = query(
          blogsRef,
          where("user_id", "==", user.user_id),
          where("blog_status", "==", "Publish"),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const blogData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBlogs(blogData);
      } catch (error) {
        console.log("Blog Fetch Error:", error);
      }
    };

    const checkFollowStatus = async () => {
      if (!auth.currentUser) return;
      const result = await checkfollow(auth.currentUser.uid, user.user_id);
      setIsFollow(result);
    };

    fetchBlogs();
    checkFollowStatus();
  }, [user]);

  // ================= FOLLOW =================
  const followWork = async () => {
    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }
    if (auth.currentUser.uid === user.user_id) {
      toast.error("You cannot follow yourself");
      return;
    }

    setIsFollow(true);

    try {
      const result = await followpage(auth.currentUser.uid, user.user_id);
      if (!result) {
        setIsFollow(false);
        return;
      }

      await addDoc(collection(db, "Notifications"), {
        senderId: auth.currentUser.uid,
        receiverId: user.user_id,
        type: "follow",
        message: `${auth.currentUser.displayName || "Someone"} followed you`,
        createdAt: serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      setIsFollow(false);
    }
  };

  // ================= UNFOLLOW =================
  const unFollowWork = async () => {
    setIsFollow(false);

    try {
      const result = await unfollow(auth.currentUser.uid, user.user_id);
      if (!result) {
        setIsFollow(true);
        return;
      }

      await addDoc(collection(db, "Notifications"), {
        senderId: auth.currentUser.uid,
        receiverId: user.user_id,
        type: "unfollow",
        message: `${auth.currentUser.displayName || "Someone"} unfollowed you`,
        createdAt: serverTimestamp(),
        isRead: false,
      });
    } catch (error) {
      setIsFollow(true);
    }
  };

  // ================= SAVE BLOG =================
  const handleSavePost = async (blogId, willBeSaved) => {
    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const q = query(collection(db, "users"), where("user_id", "==", uid));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast.error("User document not found");
        return;
      }
      

      const userDoc = snapshot.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const userData = userDoc.data();
      const saveList = userData.saveList || [];

      const updatedSaveList = willBeSaved
        ? saveList.includes(blogId) ? saveList : [...saveList, blogId]
        : saveList.filter((id) => id !== blogId);

      await setDoc(userRef, { saveList: updatedSaveList }, { merge: true });

      // Show toast
      if (willBeSaved) toast.success("Saved Successfully!");
      else toast.info("Removed from Saved!");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // ================= NAVIGATION =================
  const goToHome = () => navigate("/");

  // ================= LOADING =================
  if (loading) return <div className="loading">Loading...</div>;

  // ================= USER NOT FOUND =================
  if (!user)
    return (
      <div className="user-not-found">
        <h1 className="user-not-found-text">Opps! Wrong Person</h1>
        <p className="gototext">
          It's okay to be on the wrong page! Let me guide you in the right direction.
        </p>
        <button onClick={goToHome} className="goto-home-public-button">
          Homepage
        </button>
      </div>
    );

  // ================= PROFILE UI =================
  return (
    <div className="public-profile-user">
      <ArrowLeft className="backtohome-arrow-left" onClick={goToHome} />

      <div className="user-display-public">
        <div className="left-profile-public">
          <img src={user?.profile_pic_url} alt="" />
          <div className="user-text-content">
            <h2 className="user-username-text-content">{user?.user_name}</h2>
            <p className="user-user-description-text-content">{user?.user_profile_description}</p>
          </div>
        </div>

        {auth.currentUser?.uid !== user?.user_id &&
          (!isFollow ? (
            <button className="follow-bottom-public-profile" onClick={followWork}>
              Follow
            </button>
          ) : (
            <button className="already-follow" onClick={unFollowWork}>
              Following
            </button>
          ))}
      </div>

      <div className="blogs-list">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog.id} className="blog-item-search">
              <Publicprofilepost blogData={blog} userData={user} onSave={handleSavePost} />
            </div>
          ))
        ) : (
          <p>No Data found from "{username}".</p>
        )}
      </div>
    </div>
  );
}