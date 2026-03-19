import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { db } from "../Backend/firebase-init";
import "../Styles/Visiblepost.css";
import { Bookmark, EllipsisVertical, Share2, Smile } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { blogCurrentData, blogCurrentUserData } from "../Utils/context";
import { useNavigate } from "react-router-dom";
import defaultuser from "../Utils/defaultuser.png";

export default function Visiblepost(props) {
  const [userData, setuserData] = useState(null);
  const [blogthumb_nail, setThumbnail] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const { setCurrentBlogData } = useContext(blogCurrentData);
  const { setCurrentBlogUserData } = useContext(blogCurrentUserData);
  const navigate = useNavigate();
const clickAudio = new Audio("/click-sound.mp3");
clickAudio.load();
  // ================= FETCH USER =================
  const fetchuserData = useCallback(async () => {
    try {
      const UserProfileRef = collection(db, "users");
      const queryIntent = query(
        UserProfileRef,
        where("user_id", "==", props.blogData?.user_id)
      );
      const documentSnapShots = await getDocs(queryIntent);
      const user_data_firebase = documentSnapShots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setuserData(user_data_firebase[0]);
    } catch (error) {
      console.log("VISIBLE-POST-ERROR-USER-PROFILE-FETCHING", error.message);
    }
  }, [props.blogData?.user_id]);

  // ================= GET FIRST IMAGE =================
  const getFirstImageSrc = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const img = tempDiv.querySelector("img");
    return img ? img.src : "";
  };

  useEffect(() => {
    const data_image = getFirstImageSrc(props.blogData.blog_content);
    setThumbnail(data_image);

    if (props.blogData.user_id) {
      fetchuserData();
    }
  }, [
    props.blogData.user_id,
    props.blogData.blog_content,
    fetchuserData,
  ]);

  // ================= FORMAT DATE =================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  // ================= GENERATE LINK =================
  const generateLink = () => {
    if (!userData) return;
    const { poster_title, blog_id } = props.blogData;
    const { user_name } = userData;

    const cleanTitle = poster_title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const cleanUserName = user_name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    return `/r/${cleanUserName}/${cleanTitle}-${blog_id}`;
  };

  // ================= SHARE =================
  const shareButtonClicked = () => {
    const linkToCopy = "https://localhost:3000" + generateLink();
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        toast.success("Link Has Been Copied");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // ================= OPEN BLOG =================
  const gotoCurrentBlog = async () => {
    const linkToCopy = generateLink();
    setCurrentBlogData(props.blogData);
    setCurrentBlogUserData(userData);

    try {
      const updateUserInteraction = doc(db, "Blog", props.blogData.blog_id);
      await updateDoc(updateUserInteraction, { viewCount: increment(1) });
      navigate(linkToCopy);
    } catch (error) {
      console.log("ERROR-VIEW-COUNT", error.message);
    }
  };

  const gotouser = () => {
    userData?.user_name
      ? navigate(`/search/profile/${userData.user_name}`)
      : alert("No user found currently");
  };

  // ================= SAVE BLOG =================
 const handleBookmarkClick = (e) => {
  e.stopPropagation();

  // ✅ PLAY SOUND FIRST (must be inside click event)
  clickAudio.currentTime = 0;
  clickAudio.play().catch((err) => console.log("Sound error:", err));

  if (props.onSave) {
    props.onSave(props.blogData);   // existing logic
    setIsSaved(!isSaved);
  } else {
    toast.error("Save function not provided");
  }
};
  // ================= RENDER =================
  return (
    <>
      <ToastContainer autoClose={2000} />

      <div className="visible-post-main-div">
        <div className="top-side-visible-post" onClick={gotouser}>
          <img src={userData?.profile_pic_url || defaultuser} alt="" />
          <h3 className="user-name-visible-post">
            {userData?.user_name || "Loading.."}
          </h3>
        </div>

        <div className="bottom-content-visible-post">
          <div className="left-side-visible-post">
            <h1 className="visible-blog-title" onClick={gotoCurrentBlog}>
              {props.blogData.poster_title}
            </h1>

            <h2 className="visible-blog-desc" onClick={gotoCurrentBlog}>
              {props.blogData.poster_description}
            </h2>

            <div className="left-side-visible-bottom">
              <div className="interaction-left-side">
                <span style={{ color: "#676767" }}>
                  {formatDate(props.blogData.uploded_at)}
                </span>

                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#676767",
                  }}
                >
                  <Smile size={16} strokeWidth={1.25} />
                  {props.blogData.viewCount || "0"}
                </span>
              </div>

              <div className="interation-right">
           <Bookmark
  size={20}
  onClick={handleBookmarkClick}
  className={`action-icon ${props.isSaved ? "saved" : ""}`}
/>
                <Share2
                  size={20}
                  strokeWidth={1.25}
                  style={{ cursor: "pointer" }}
                  onClick={shareButtonClicked}
                />

                <EllipsisVertical
                  size={20}
                  strokeWidth={1.25}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          <div className="right-side-visible-post">
            <img src={blogthumb_nail} alt="" onClick={gotoCurrentBlog} />
          </div>
        </div>
      </div>
    </>
  );
}
