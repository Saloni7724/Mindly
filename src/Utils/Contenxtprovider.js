import React, { useState, useEffect } from "react";
import { blogCurrentData, blogCurrentUserData } from "./context";

const BlogContextProvider = ({ children }) => {
  // Load from localStorage or set initial values as null
  const [currentBlogData, setCurrentBlogData] = useState(
    () => JSON.parse(localStorage.getItem("currentBlogData")) || null
  );
  const [currentBlogUserData, setCurrentBlogUserData] = useState(
    () => JSON.parse(localStorage.getItem("currentBlogUserData")) || null
  );

  // Save blog data to localStorage whenever it changes
  useEffect(() => {
    if (currentBlogData) {
      localStorage.setItem("currentBlogData", JSON.stringify(currentBlogData));
    }
  }, [currentBlogData]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (currentBlogUserData) {
      localStorage.setItem(
        "currentBlogUserData",
        JSON.stringify(currentBlogUserData)
      );
    }
  }, [currentBlogUserData]);

  return (
    <blogCurrentData.Provider value={{ currentBlogData, setCurrentBlogData }}>
      <blogCurrentUserData.Provider
        value={{ currentBlogUserData, setCurrentBlogUserData }}
      >
        {children}
      </blogCurrentUserData.Provider>
    </blogCurrentData.Provider>
  );
};

export default BlogContextProvider;
