// ========================== Publicprofilepost.js ==========================
import React, { useContext, useEffect, useState } from "react";
import "../Styles/Visiblepost.css";
import { Bookmark, EllipsisVertical, Share2, Smile } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { blogCurrentData, blogCurrentUserData } from "../Utils/context";
import { useNavigate } from "react-router-dom";

export default function Publicprofilepost({ blogData, userData, onSave, isSaved }) {
  const [blogthumb_nail, setThumbnail] = useState(null);
  const { setCurrentBlogData } = useContext(blogCurrentData);
  const { setCurrentBlogUserData } = useContext(blogCurrentUserData);
  const navigate = useNavigate();

  // Saved status logic
  const savedStatus =
    isSaved !== undefined
      ? isSaved
      : userData?.saveList?.includes(blogData.blog_id);

  const [localSaved, setLocalSaved] = useState(savedStatus);

  // Get first image from blog content
  const getFirstImageSrc = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const img = tempDiv.querySelector("img");
    return img ? img.src : "";
  };

  useEffect(() => {
    if (blogData?.blog_content) {
      const data_image = getFirstImageSrc(blogData.blog_content);
      setThumbnail(data_image);
    }
  }, [blogData]);

  useEffect(() => {
    setLocalSaved(savedStatus);
  }, [savedStatus]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const generateLink = () => {
    const { poster_title, blog_id } = blogData;
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

  const shareButtonClicked = (e) => {
    e.stopPropagation();
    const linkToCopy = window.location.origin + generateLink();
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => toast.success("Link has been copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const gotoCurrentBlog = () => {
    setCurrentBlogData(blogData);
    setCurrentBlogUserData(userData);
    navigate(generateLink());
  };

  // ================== Handle save with sound ==================
  // Preload audio once
  const clickAudio = new Audio("/click-sound.mp3");

  const handleBookmarkClick = (e) => {
    e.stopPropagation();

    // Toggle saved state
    const newSavedState = !localSaved;
    setLocalSaved(newSavedState);

    // Play sound immediately inside click handler
    clickAudio.currentTime = 0; // restart if already playing
    clickAudio.play().catch((err) => console.log("Sound play error:", err));

    // Call parent save function
    if (onSave) onSave(blogData.blog_id, newSavedState);
    else toast.error("Save function not provided");
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="visible-post-main-div">
        <div className="bottom-content-visible-post">
          <div className="left-side-visible-post">
            <h1 className="visible-blog-title" onClick={gotoCurrentBlog}>
              {blogData.poster_title}
            </h1>
            <h2 className="visible-blog-desc" onClick={gotoCurrentBlog}>
              {blogData.poster_description}
            </h2>

            <div className="left-side-visible-bottom">
              <div className="interaction-left-side">
                <span style={{ color: "#676767" }}>{formatDate(blogData.uploded_at)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#676767" }}>
                  <Smile size={20} strokeWidth={1.25} />
                  {blogData.user_interaction || "0"}
                </span>
              </div>

              <div className="interation-right">
                {/* SAVE BUTTON */}
                <div style={{ position: "relative" }}>
                  <Bookmark
                    size={24}
                    onClick={handleBookmarkClick}
                    className={`action-icon ${localSaved ? "saved" : ""}`}
                  />
                </div>

                {/* SHARE */}
                <Share2
                  size={20}
                  strokeWidth={1.25}
                  style={{ cursor: "pointer", color: "#676767" }}
                  onClick={shareButtonClicked}
                />
                <EllipsisVertical size={20} strokeWidth={1.25} style={{ cursor: "pointer" }} />
              </div>
            </div>

            <p className="tag-bottom-which-type">Written on {blogData.blog_related_tag}</p>
          </div>

          <div className="right-side-visible-post">
            {blogthumb_nail && <img src={blogthumb_nail} alt="thumbnail" />}
          </div>
        </div>
      </div>

      {/* Heart burst animation */}
      <style>{`
        @keyframes burst {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.5); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 0; }
        }
      `}</style>
    </>
  );
}