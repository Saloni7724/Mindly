import React, { useContext, useEffect, useState } from "react";
import { blogCurrentData, blogCurrentUserData } from "../Utils/context";
import "../Styles/Readblog.css";
import Header from "../Component/Header";
import { Dot, Heart, MessageCircle } from "lucide-react";
import { checkfollow, followpage } from "../Utils/Followpage";
import { auth, db } from "../Backend/firebase-init";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Component/Sidebar";
import useCommentStore from "../Utils/useCommentStore.js";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";



import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  deleteDoc, // ✅ FIX 1: added
} from "firebase/firestore";

import { getuserDetail } from "../Utils/getuserDetail.js";

export default function Readblog() {

  const { currentBlogData, setCurrentBlogData } = useContext(blogCurrentData);
  const { currentBlogUserData, setCurrentBlogUserData } =
    useContext(blogCurrentUserData);

  const [readMin, setReadMin] = useState(0);
  const [isFollow, setIsfollow] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isFilled, setIsFilled] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { commentIds } = useCommentStore();
  const { username, blogcontent } = useParams();
  const [isLodaing, setIsLoading] = useState(false);

  const getBlogDetail = async () => {
    const blogId = blogcontent.split("-").pop();
    const blogRef = collection(db, "Blog");
    const blogIntent = query(blogRef, where("blog_id", "==", blogId));
    const querySnapshot = await getDocs(blogIntent);

    if (!querySnapshot.empty) {
      const blogData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCurrentBlogData(blogData[0]);
      const userDetailBlog = getuserDetail(blogData[0].user_id);
      setCurrentBlogUserData(userDetailBlog);
    }
  };

  useEffect(() => {
    if (!currentBlogData) {
      getBlogDetail();
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser?.uid || !currentBlogData) return;

    if (currentBlogData.liked?.includes(auth.currentUser.uid)) {
      setIsFilled(true);
    }

    setLikeCount(currentBlogData.liked?.length);

    const checkfollowuse = async () => {
      if (!auth.currentUser.uid || !currentBlogUserData.user_id) return;
      const result_check_follow = await checkfollow(
        auth.currentUser.uid,
       currentBlogUserData.user_id
      );

      result_check_follow ? setIsfollow(true) : setIsfollow(false);
    };

    checkfollowuse();
  }, [currentBlogUserData, currentBlogData]);

  const readMinute = (htmlString) => {
    const strippedString = htmlString.replace(/<[^>]*>/g, "");
    const words = strippedString.trim().split(/\s+/);
    return words.filter((word) => word.length > 0).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    document.title = currentBlogData.poster_title + " - Mindly";
    setReadMin(readMinute(currentBlogData.blog_content));
  }, [currentBlogData, currentBlogUserData]);

  // ✅ FOLLOW
const followWork = async () => {

  console.log("🚀 FOLLOW CLICKED");
  if (auth.currentUser.uid === currentBlogUserData.user_id) return;

  if (!auth.currentUser) {
    console.log("❌ No user logged in");
    return;
  }

  if (!currentBlogUserData?.user_id) {
    console.log("❌ user_id missing");
    return;
  }

  // ✅ INSTANT UI CHANGE
  setIsfollow(true);

  try {

    const result = await followpage(
      auth.currentUser.uid,
      currentBlogUserData.user_id
    );

    console.log("✅ FOLLOW RESULT:", result);

    // ❌ If failed → revert UI
    if (!result) {
      setIsfollow(false);
      return;
    }

    console.log("📢 ADDING NOTIFICATION");

    await addDoc(collection(db, "Notifications"), {
      senderId: auth.currentUser.uid,
      receiverId: currentBlogUserData.user_id,
      type: "follow",
      message: "Followed you",
      createdAt: serverTimestamp(),
      isRead: false,
    });

    console.log("✅ NOTIFICATION CREATED");

  } catch (error) {
    console.log("❌ ERROR:", error);

    // ❌ revert UI if error
    setIsfollow(false);
  }
};
  // ✅ UNFOLLOW LOGIC
  const unfollow = async (follower_id, followee_id) => {
    try {
      const q = query(
        collection(db, "Follower"),
        where("follower_id", "==", follower_id),
        where("followee_id", "==", followee_id)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No matching follow record found.");
        return false;
      }

      const promises = snapshot.docs.map((docItem) =>
        deleteDoc(doc(db, "Follower", docItem.id))
      );

      await Promise.all(promises);

      return true;
    } catch (error) {
      console.log("Unfollow error:", error.message);
      return false;
    }
  };

  // ✅ FIX 2: Wrapper function (missing before)
 const unFollowWork = async () => {

  // ✅ instant UI
  setIsfollow(false);

  const result = await unfollow(
    auth.currentUser.uid,
    currentBlogUserData.user_id
  );

  if (!result) {
    setIsfollow(true); // revert
  }
};

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addIntoLike = async () => {
    const currentUser = auth.currentUser.uid;
    const updateLikeRef = doc(db, "Blog", currentBlogData.blog_id);

    await updateDoc(updateLikeRef, {
      liked: isFilled ? arrayRemove(currentUser) : arrayUnion(currentUser),
    });

    setIsFilled((prev) => !prev);

    isFilled
      ? setLikeCount((prev) => prev - 1)
      : setLikeCount((prev) => prev + 1);
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

 if (isLodaing) {
  return (
    <div className="loading-read-outer">
      <div className="loading-read-inner"></div>
    </div>
  );
}

return (
  <>
    <Sidebar
      isOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      blog_id={currentBlogData.blog_id}
    />
    <Header />

    <div className="read-outer-div">
      <div className="read-header-part">
        <div className="read-header-title">
          <h1 className="read-title">{currentBlogData.blog_title}</h1>
          <h3 className="read-description">
            {currentBlogData.poster_description}
          </h3>
        </div>

        <div className="user-detail-read-card">
          {currentBlogUserData?.profile_pic_url ? (
            <img
              src={currentBlogUserData.profile_pic_url}
              alt=""
              className="authorAvatar"
            />
          ) : (
            <div className="authorAvatarFallback">
              {getInitials(currentBlogUserData?.user_name || "User")}
            </div>
          )}

          <div className="username-follow-button">
            <div className="upper-side">
              <h3 className="profile-name">
                {currentBlogUserData.user_name}
              </h3>

              <Dot size={15} />

              {!isFollow ? (
              <button
  className="follow-read"
  onClick={() => {
    console.log("BUTTON CLICKED ✅");
    followWork();
  }}
>
  Follow
</button>
              ) : (
                <button className="follow-read" onClick={unFollowWork}>
                  Following
                </button>
              )}
            </div>

            <div className="bottom-side">
              <h3 className="bottom-read-text">
                {(readMin / 200).toFixed(0) > 0
                  ? (readMin / 200).toFixed(0)
                  : 1}{" "}
                min read
              </h3>

              <Dot size={10} />

              <h3 className="uploded-on">
                {formatDate(currentBlogData.uploded_at)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div
        className="original-part-blog"
        dangerouslySetInnerHTML={{ __html: currentBlogData.blog_content }}
      ></div>

      <div className="tag-read">
        <h1 className="tag-read-text">Tags</h1>
        <h3
          className="tags-read"
          onClick={() =>
            navigate(`/searchresult/${currentBlogData.blog_related_tag}`)
          }
        >
          {currentBlogData.blog_related_tag}
        </h3>
      </div>

      <div className="bottom-read-blog-comment-like-section">
        <div className="like-post">
          <div className="icon-container" onClick={addIntoLike}>
            <Heart
              className={`icon ${isFilled ? "filled" : "outlined"}`}
              size={20}
            />
          </div>
          <p className="like-count-read-blog">{likeCount}</p>
        </div>

        <div className="like-post">
          <MessageCircle
            strokeWidth={1.25}
            size={20}
            onClick={toggleSidebar}
          />
          {commentIds?.length ? commentIds?.length : "0"}
        </div>
      </div>
    </div>
  </>
);
}