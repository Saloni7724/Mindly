import React, { useState, useRef, useEffect, useContext } from "react";
import { blogCurrentData } from "../Utils/context";
import "../Styles/Sidebar.css";
import {
  ChevronDown,
  EllipsisVertical,
  MessageCircleReply,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { auth, db } from "../Backend/firebase-init";
import { getuserDetail } from "../Utils/getuserDetail";
import defaultuser from "../Utils/defaultuser.png";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { generateRandomId } from "../Utils/generateId";
import useCommentStore from "../Utils/useCommentStore.js";

const Sidebar = ({ isOpen, toggleSidebar, blog_id }) => {
  const { currentBlogData } = useContext(blogCurrentData);
  const [openDiv, setOpenDiv] = useState(false);
  const contentRef = useRef(null);
  const [myName, setMyname] = useState("");
  const [selected, setSelected] = useState("Most Recent");
  const [showOptions, setShowOptions] = useState(false); // Define the state for showing options
  const options = ["Most Recent", "Most Liked", "Oldest One"];
  const [commentValue, setCommentValue] = useState("");
  const [comments, setComments] = useState([]);
  const [openPopover, setOpenPopover] = useState(-1);
  const { commentsStore, fetchCommentsInfo, deleteComment, setcommentsStore } =
    useCommentStore();
  const [commentUserData, setCommentUserData] = useState([]);
  const [openDialog, setopenDialog] = useState(false);
  const [editComment, setEditComment] = useState("");
  const [editCommentIndex, setEditCommentIndex] = useState(-1);
  const toggleOpenbar = () => {
    if (!openDiv) {
      setOpenDiv(true);
    }
  };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "Blog", blog_id), (res) => {
      const data = res.data();
      const commentsIds = data.comments || [];
      setComments(commentsIds);
    });

    return () => {
      unSub();
    };
  }, [blog_id]);

  // this function is used when the commentIds is updated
  useEffect(() => {
    fetchCommentsInfo(comments);
  }, [comments, fetchCommentsInfo]);

  useEffect(() => {
    const getCommentUserData = async () => {
      for (const value of commentsStore) {
        const userData = await getuserDetail(value.comment_user);

        const newUser = userData[0];
        setCommentUserData((prev) => {
          return [...prev, newUser];
        });
      }
    };

    getCommentUserData();
  }, [commentsStore]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser?.uid) return;
      try {
        const userData = await getuserDetail(auth.currentUser.uid);
        setMyname(userData[0]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Here this function add Comments into Database , Temporary this will add the comments into the Array
  const addComment = async () => {
    // this function is used to add comments into the currentBlog
    const emptyCommentMessages = [
      "Don't be shy! Share your thoughts with us.",
      "Your voice matters—go ahead and type something!",
      "We can't wait to hear what you think. Write a comment!",
      "Got something on your mind? Let us know!",
      "A blank comment is no fun! Let's add some words.",
      "We'd love to hear your opinion. Don't leave the box empty!",
      "Let your words shine—add a comment!",
    ];

    if (!commentValue) {
      const randomIndex = Math.floor(
        Math.random() * emptyCommentMessages.length
      );
      toast.error(emptyCommentMessages[randomIndex]);
    }

    // this part of the code add comments into the firestore firebase
    setCommentValue("");
    try {
      const commentId = generateRandomId();
      const commentRef = doc(db, "Comments", commentId);
      const commentData = {
        commentId: commentId,
        comment: commentValue,
        comment_user: auth.currentUser.uid,
        blogId: currentBlogData.blog_id,
        createdAt: serverTimestamp(),
      };
      await setDoc(commentRef, commentData);

      // now we have to insert this comment id into the blog
      const blogCommentRef = doc(db, "Blog", currentBlogData.blog_id);
      await updateDoc(blogCommentRef, {
        comments: arrayUnion(commentId),
      });

      fetchCommentsInfo(comments);
    } catch (error) {
      console.log(
        "THIS-ERROR-HAPPEND-FROM-SIDEBAR-COMMENT-INSERTION\n",
        error.message
      );
    }

    console.log(
      commentsStore,
      "this is the comment user data",
      commentUserData
    );
  };

  const removeComment = async (commentId, userId) => {
    if (!commentId || !userId) return;
    deleteComment(commentId);
    const blogRef = doc(db, "Blog", currentBlogData.blog_id); // Reference to the Blog document
    await updateDoc(blogRef, {
      comments: arrayRemove(commentId),
    });

    const updatedArray = commentUserData.filter((json) => json.id !== userId);
    setCommentUserData(updatedArray);
    setOpenPopover(-1);
  };

  const openclosePopover = (index) => {
    console.log(index);

    if (openPopover === -1) setOpenPopover(index);

    if (openPopover === index) {
      setOpenPopover(-1);
    } else {
      setOpenPopover(index);
    }
  };

  function getTimeDifferenceFromNow(dateInput) {
    const inputDate = new Date(dateInput.toDate().toLocaleString());
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const difference = currentDate - inputDate;

    // Convert difference to seconds, minutes, hours, days, and months
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }

  const setCurrentUpdateComment = (index) => {
    console.log(commentsStore[index].comment);

    setEditComment(commentsStore[index].comment);
    setEditCommentIndex(index);
    setopenDialog(true);
  };

  const updateComment = async () => {
    if (commentsStore[editCommentIndex].comment === editComment) {
      toast.error("Look's like you forgot to update Comment");
    }
    console.log("This is the comments Store", commentsStore);

    try {
      const updateRef = doc(
        db,
        "Comments",
        commentsStore[editCommentIndex].commentId
      );

      await updateDoc(updateRef, {
        comment: editComment,
        isEdited: true,
      });

      const updatedCommentsStore = commentsStore.map(
        (commentObj) =>
          commentObj.commentId === commentsStore[editCommentIndex].commentId
            ? { ...commentObj, comment: editComment, isEdited: true } // Update only the matching comment
            : commentObj // Keep other comments unchanged
      );

      setcommentsStore(updatedCommentsStore, []);
      setEditComment("");
      setopenDialog(false);
      setEditCommentIndex(-1);
      toast.success("Thanks for Correcting Feedback !");
    } catch (error) {
      console.log("THIS-ERROR-FROM-UPDATING-COMMENT\n", error.message);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* this is the dialog box when the comments is edited */}
      {openDialog && (
        <div className="dialog-backdrop" onClick={() => setopenDialog(false)}>
          <div className="dialogbox" onClick={(e) => e.stopPropagation()}>
            <div className="site-name-from-side-bar">
              <h2 className="sitename" style={{ margin: "0px" }}>
                Mindly
              </h2>
              <X
                size={20}
                strokeWidth={1.25}
                onClick={() => setopenDialog(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="user-data-from-sidebar">
              <img
                src={
                  commentUserData[editCommentIndex]?.profile_pic_url ||
                  defaultuser
                }
                alt=""
              />
              <p className="username-from-sidebar">
                {commentUserData[editCommentIndex]?.user_name || "Loading.."}
              </p>
            </div>

            <input
              type="text"
              className="input-from-edit"
              placeholder="Write Down Emotions"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
            <div className="comment-edit-button">
              <button className="edit-comment-button" onClick={updateComment}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        style={{
          fontFamily: "Roboto",
          fontSize: "14px",
        }}
        autoClose={2500}
      />
      <div className="response-top-sidebar-div">
        <h1 className="top-response-text-sidebar">
          Comment({comments?.length ? comments.length : "0"})
        </h1>
        <button className="close-btn" onClick={toggleSidebar}>
          <X strokeWidth={1.25} size={20} />
        </button>
      </div>

      <div className="sidebar-content">
        {/* This Section is for input in which we have to write comment */}
        <div
          className={`div-open-expand ${openDiv ? "expanded" : ""}`}
          onClick={toggleOpenbar}
          ref={contentRef}
        >
          {openDiv && (
            <div className="upper-part-of-the-comment">
              <img src={myName.profile_pic_url || defaultuser} alt="user.png" />
              <p>{myName.user_name || "Loading.."}</p>
            </div>
          )}
          <input
            type="text"
            className="comment-input-main"
            value={commentValue}
            onChange={(e) => {
              setCommentValue(e.target.value);
            }}
            placeholder="Leave Comment for Author"
            onFocus={() => setOpenDiv(true)}
          />
          {openDiv && (
            <div className="bottom-part-of-the-comment">
              <button className="cancel" onClick={() => setOpenDiv(false)}>
                Cancel
              </button>
              <button className="comment" onClick={addComment}>
                Comment
              </button>
            </div>
          )}
        </div>
        {/* This is Drop down that Filter the Comment Section which is Shown */}
        <div className="drop-down-most-recent-tag">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="dropdown-button"
          >
            {selected} <ChevronDown size={20} strokeWidth={1.5} />
          </button>

          {showOptions && (
            <div className="dropdown-options">
              {options.map((option) => (
                <div
                  key={option}
                  className="dropdown-option"
                  onClick={() => {
                    setSelected(option);
                    setShowOptions(false); // Close dropdown after selection
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* here is the actual comment is visible */}
        <div className="actual-visible-comment">
          {commentsStore.length > 0 ? (
            commentsStore.map((comment, index) => (
              <div className="comment-value" key={comment.id || index}>
                <div
                  className={
                    openPopover === index ? "popover-sidebar" : "close-popover"
                  }
                >
                  <ul>
                    {/* Add edit and delete actions */}
                    {comment.comment_user === auth.currentUser.uid && (
                      <li
                        onClick={() => {
                          setCurrentUpdateComment(index);
                          setOpenPopover(-1);
                        }}
                      >
                        <Pencil size={16} strokeWidth={1.25} /> Edit
                      </li>
                    )}
                    <div className="separator"></div>
                    {(comment.comment_user || currentBlogData.user_id) ===
                      auth.currentUser.uid && (
                      <li
                        style={{ color: "#800000" }}
                        onClick={() =>
                          removeComment(
                            comment.commentId,
                            commentUserData[index].id
                          )
                        }
                      >
                        <Trash2 size={16} strokeWidth={1.25} />
                        Delete
                      </li>
                    )}
                  </ul>
                </div>
                <div className="side-bar-top">
                  <div className="user-data-from-sidebar">
                    <img
                      src={
                        commentUserData[index]?.profile_pic_url || defaultuser
                      }
                      alt=""
                    />
                    <p className="username-from-sidebar">
                      {commentUserData[index]?.user_name || "Loading.."}
                    </p>
                  </div>
                  <EllipsisVertical
                    size={32}
                    strokeWidth={1.25}
                    style={{ cursor: "pointer" }}
                    onClick={() => openclosePopover(index)}
                  />
                </div>
                <p className="comment-data-sidebar">{comment.comment}</p>
                <div className="response-comment-sidebar-bottom">
                  <ThumbsUp
                    size={16}
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                  />
                  <ThumbsDown
                    size={16}
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                  />
                  <MessageCircleReply
                    size={16}
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className="bottom-part-of-the-comment-sidebar">
                  <p className="created-at-comment">
                    {getTimeDifferenceFromNow(comment.createdAt)}
                  </p>
                  <p className="created-at-comment">
                    {commentsStore[index].isEdited ? "Edited" : ""}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No comments available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
