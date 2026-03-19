import React, { useCallback, useEffect, useState } from "react";
import "../Styles/Lefthomepagepart.css";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Backend/firebase-init";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import Visiblepost from "./Visiblepost";
import { blogTags } from "../Utils/tags.js";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { generateRandomId } from "../Utils/generateId";


export default function Lefthomepagepart({ searchparam }) {
  const [userInterestedTag, setInterestedTag] = useState(["Following"]);
  const [blogs, setBlogs] = useState([]);
  const [recommendedTags, setrecommendedTags] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const navigate = useNavigate();


  const getRandomTags = (tags, count = 6) => {
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    return shuffledTags.slice(0, count);
  };

  useEffect(() => {
    const tags = localStorage.getItem("user_interested_tags");
    if (tags) {
      const og_tags = tags.split(",").map((tag) => tag.trim());
      setInterestedTag((prevTags) =>
        Array.from(new Set([...prevTags, ...og_tags]))
      );
    }

    setrecommendedTags(getRandomTags(blogTags));
  }, []);
  useEffect(() => {
  const fetchSavedPosts = async () => {
    if (!auth.currentUser) return;

    const savedRef = collection(db, "Saved");

    const q = query(
      savedRef,
      where("user_id", "==", auth.currentUser.uid)
    );

    const snapshot = await getDocs(q);

    const savedIds = snapshot.docs.map(doc => doc.data().blog_id);

    setSavedPosts(savedIds);
  };

  fetchSavedPosts();
}, []);

  const fetchInitialBlog = useCallback(async () => {
    if (!auth.currentUser?.uid) return;

    const BlogCollectionRef = collection(db, "Blog");

    const queryIntent = query(
      BlogCollectionRef,
      where("blog_related_tag", "==", searchparam),
      limit(5)
    );

    const snapshot = await getDocs(queryIntent);

    const blogData = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((blog) => blog.user_id !== auth.currentUser?.uid);

    setBlogs(blogData);
  }, [searchparam]);

  const fetchFollowingblog = async () => {
    if (!auth.currentUser?.uid) return;

    const followingIntent = collection(db, "Follower");

    const q = query(
      followingIntent,
      where("follower_id", "==", auth.currentUser.uid)
    );

    const snapshot = await getDocs(q);

    const followingData = snapshot.docs.map((doc) => doc.data());

    const followeeIds = followingData.map((item) => item.followee_id);

    if (!followeeIds.length) return;

    const BlogCollectionRef = collection(db, "Blog");

    const q1 = query(
      BlogCollectionRef,
      where("user_id", "in", followeeIds),
      where("blog_status", "==", "Publish"),
      limit(5)
    );

    const snapshot1 = await getDocs(q1);

    const blogData = snapshot1.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBlogs(blogData);
  };

  useEffect(() => {
    if (searchparam) {
      fetchInitialBlog();
    } else {
      fetchFollowingblog();
    }
  }, [searchparam, fetchInitialBlog]);

  useEffect(() => {
    const fetchTrendingBlogs = async () => {
      if (!auth.currentUser?.uid) return;

      const followerRef = collection(db, "Follower");

      const q1 = query(
        followerRef,
        where("follower_id", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q1);

      const followingData = snapshot.docs.map((doc) => doc.data());

      const followeeIds = followingData.map((item) => item.followee_id);

      const blogRef = collection(db, "Blog");

      let q;

      if (followeeIds.length > 0) {
        q = query(
          blogRef,
          where("user_id", "in", followeeIds),
          limit(5)
        );
      } else {
        q = query(
          blogRef,
          limit(5)
        );
      }

      const snapshotBlogs = await getDocs(q);

      const data = snapshotBlogs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrendingBlogs(data);
    };

    fetchTrendingBlogs();
  }, []);

  const navigatetowrite = () => {
    navigate(`/p/${generateRandomId()}/edit`);
  };

  const gotosearch = (tag) => {
    navigate(`/searchresult/${encodeURIComponent(tag)}`);
  };

const handleSavePost = async (blog) => {

  const savedRef = doc(db, "Saved", `${auth.currentUser.uid}_${blog.id}`);

  const existingDoc = await getDoc(savedRef);

  if (existingDoc.exists()) {
    await deleteDoc(savedRef);

    setSavedPosts((prev) => prev.filter(id => id !== blog.id));

  } else {
    await setDoc(savedRef, {
      user_id: auth.currentUser.uid,
      blog_id: blog.id,
      createdAt: new Date(),
    });

    setSavedPosts((prev) => [...prev, blog.id]);
  }
};
  return (
    <div className="main-tag">
      <div className="left-side-of-the-part">
        <div className="user-interested-tag">
          <Plus strokeWidth={1.2} size={20} />

          {userInterestedTag.map((tag, index) => (
            <h4
              key={index}
              className={`tags ${
                searchparam === tag ||
                (index === 0 && searchparam === undefined) ? "active" : ""
              }`}
              onClick={() =>
                tag === "Following"
                  ? navigate("/")
                  : navigate(`/searchresult/${encodeURIComponent(tag)}`)
              }
            >
              {tag}
            </h4>
          ))}
        </div>

        <div className="actucal-content-blog">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-item">
        <Visiblepost
  blogData={blog}
  onSave={handleSavePost}
  isSaved={savedPosts.includes(blog.id)}
/>
            </div>
          ))}
        </div>
      </div>

      <div className="right-side-of-the-part">
        <div className="recommended-title-div">
          <h1 className="recommended-title">Recommended Title</h1>

          <div className="actual-recommended-title">
            {recommendedTags.map((tag, index) => (
              <span
                key={index}
                className="tag-item-recommended"
                onClick={() => gotosearch(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="trending-topics">
          <h1 className="recommended-title">Trending Topics</h1>

          <div className="trending-data">
            {trendingBlogs.map((blog) => (
              <div
                key={blog.id}
                className="trending-item"
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="trending-avatar">
                  {blog.author_name
                    ? blog.author_name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div className="trending-content">
                  <h4>{blog.blog_title}</h4>
                  <p>{blog.blog_related_tag || "General"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="right-bottom-part">
            {selectedBlog ? (
              <div className="selected-blog-preview">
                <h3>{selectedBlog.blog_title}</h3>

                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedBlog.blog_content,
                  }}
                />
              </div>
            ) : (
              <>
                <h3>Write Some Emotions</h3>

                <p
                  className="trending-topics-view"
                  onClick={navigatetowrite}
                >
                  Let's Go
                </p>
              </>
            )}

            <div className="footer-buttons">
              <button
                className="footer-bottom-right"
                onClick={() => navigate("/teammindly")}
              >
                Team Mindly
              </button>

              <button
                className="footer-bottom-right"
                onClick={() => navigate("/Contact")}
              >
                Contact
              </button>

              <button
                className="footer-bottom-right"
                onClick={() => navigate("/About")}
              >
                About
              </button>

              <button
                className="footer-bottom-right"
                onClick={() => navigate("/terms")}
              >
                Terms
              </button>

              <button
                className="footer-bottom-right"
                onClick={() => navigate("/help")}
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}