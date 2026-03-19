import React, { useEffect, useState } from "react";
import "../Styles/Postposter.css";
import { Dot, EllipsisVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Backend/firebase-init";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
export default function Postposter(props) {
  const [totalword, setTotalWord] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Your ${props.blogData.blog_status} - Mindly`;
    console.log(props);
    let word =
      props.blogData.poster_title?.length +
      props.blogData.poster_description?.length;
    if (!word) {
      word =
        props.blogData.blog_title.length +
        getFirst150Characters(props.blogData.blog_content, 10000).length;
    }

    setTotalWord(word);
  }, [props]);

  const getFirst150Characters = (htmlContent, number_limit) => {
    const tempDiv = document.createElement("div"); // Create a temporary div to parse HTML
    tempDiv.innerHTML = htmlContent; // Set the innerHTML to the dangerous HTML
    const textContent = tempDiv.textContent || tempDiv.innerText || ""; // Extract plain text content

    return textContent.length > number_limit
      ? textContent.substring(0, number_limit)
      : textContent; // Return first 150 characters
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based index) and pad with zero
    const year = date.getFullYear(); // Get the full year

    return `${day}-${month}-${year}`; // Format as "dd-mm-yyyy"
  };

  const togglePopover = () => {
    setShowPopover((prevState) => !prevState);
  };

  const navigateToStoryEdit = () => {
    navigate(`/p/${props.blogData.blog_id}/edit`);
  };

  const deleteCurrentBlog = async () => {
    const currentUserId = auth.currentUser?.uid; // Get the current user's ID

    // Ensure the user is authenticated and the blog_id is available
    if (currentUserId && props.blogData.blog_id) {
      // Create a reference to the specific blog document using the blog_id
      const blogRef = doc(db, "Blog", props.blogData.blog_id);

      try {
        // Fetch the blog document to check the user_id
        const blogSnapshot = await getDocs(
          query(
            collection(db, "Blog"),
            where("blog_id", "==", props.blogData.blog_id)
          )
        );

        if (!blogSnapshot.empty) {
          const blogData = blogSnapshot.docs[0].data();

          // Check if the user_id of the blog matches the current user
          if (blogData.user_id === currentUserId) {
            // Proceed to delete the blog document
            await deleteDoc(blogRef);
            window.location.reload();
          } else {
            console.error("You are not authorized to delete this blog.");
          }
        } else {
          console.error("Blog not found.");
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    } else {
      console.error("User is not authenticated or blog_id is missing.");
    }
  };

  return (
    <>
      <div className="poster">
        <div className="title-poster">
          <h3 className="header-poster">
            {props.blogData.poster_title
              ? props.blogData.poster_title
              : props.blogData.blog_title}
          </h3>
          <div className="popover-button">
            <EllipsisVertical
              color="#444"
              size={18}
              strokeWidth={1.5}
              onClick={togglePopover}
              cursor="pointer"
            />
            <div className={`popover ${showPopover ? "visible" : ""}`}>
              <ul>
                {props.blogData.blog_status === "Draft" ? (
                  <>
                    <li onClick={navigateToStoryEdit}>Edit Draft</li>
                    <div className="divider"></div>
                    <li onClick={deleteCurrentBlog}>Delete Draft</li>
                  </>
                ) : (
                  <>
                    <li onClick={navigateToStoryEdit}>Edit Story</li>

                    <div className="divider"></div>
                    <li onClick={deleteCurrentBlog}>Delete Story</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        <h4 className="desc-poster">
          {props.blogData.poster_description
            ? props.blogData.poster_description
            : getFirst150Characters(props.blogData.blog_content, 200)}
        </h4>
        <div className="footer-poster">
          <h3 className="created-or-uploaded">
            {props.blogData.uploded_at
              ? formatDate(props.blogData.uploded_at)
              : formatDate(props.blogData.created_at)}{" "}
            {props.blogData.blog_status !== "Draft"
              ? "Uploded on"
              : "Edited on"}
          </h3>
          <Dot color="#676767" size={20} />
          <h3 className="totalword">{totalword} words</h3>
          {props.blogData?.blog_related_tag && (
            <>
              <Dot color="#676767" size={20} />
              <h3 className="totalword">{props.blogData.blog_related_tag}</h3>
            </>
          )}
        </div>
      </div>
    </>
  );
}
