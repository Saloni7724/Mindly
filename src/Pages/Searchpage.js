import React, { useEffect, useState } from "react";
import Header from "../Component/Header";
import "../Styles/Searchpage.css";
import { useParams } from "react-router-dom";
import { db } from "../Backend/firebase-init";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import Visiblepost from "../Component/Visiblepost";


export default function Searchpage() {
  const { searchparam } = useParams();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    document.title = `${searchparam} - Search Result - Mindly`;
    // Function to fetch blogs from Firebase
    const fetchBlogs = async () => {
      try {
        const blogsRef = collection(db, "Blog"); // Access the correct collection
        const q = query(
          blogsRef,
          where("blog_related_tag", "==", searchparam), // Filter by the `searchparam`
          limit(5) // Limit to 5 results
        );

        const querySnapshot = await getDocs(q);

        const fetchedBlogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBlogs(fetchedBlogs); // Update state with fetched blogs
      } catch (error) {
        console.error("Error fetching blogs: ", error);
      }
    };

    fetchBlogs();
  }, [searchparam]);

  return (
    <>
      <Header />
      <div className="main-search-page-div">
        <h1 className="search-param">{searchparam}</h1>

        <div className="blogs-list">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div key={blog.id} className="blog-item-search">
                <Visiblepost blogData={blog} />
              </div>
            ))
          ) : (
            <p className="search-blog-no-data-found">No blogs found with the tag "{searchparam}".</p>
          )}
        </div>
      </div>
    </>
  );
}
