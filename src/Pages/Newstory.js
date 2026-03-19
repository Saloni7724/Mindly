import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Styles/Newstory.css";
import { Bell, Ellipsis, Mic, X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { blogTags } from "../Utils/tags.js";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { auth, db, storage } from "../Backend/firebase-init.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Newstory() {
  const { blogId } = useParams();
  const [username, setUsername] = useState("");
  const [user_img_url, setUserUrl] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const [isPublish, setisPublish] = useState(false);
  const [titlePublish, settitlePublish] = useState(title);
  const [previewText, setPreviewText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState(blogTags);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutIdRef = useRef(null);
  const [savedText, setsavedText] = useState(false);
  const [alertText, setAlertText] = useState("");

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const toolbarOptions = [["bold", "italic", "link", "image", "blockquote", "code-block"]];
  const quillRef = useRef(null);

  // ✅ Custom image handler: upload to Firebase Storage, insert URL into editor (NO base64)
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) {
          alert("Please login first.");
          return;
        }

        // Upload to storage
        const safeName = file.name.replace(/\s+/g, "_");
        const storageRef = ref(
          storage,
          `blog_images/${user.uid}/${blogId}/${Date.now()}_${safeName}`
        );

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        // Insert into editor
        const quill = quillRef.current?.getEditor?.();
        if (!quill) return;

        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1);
      } catch (err) {
        console.error("IMAGE UPLOAD ERROR:", err);
        alert("Image upload failed. Check Storage rules/internet.");
      }
    };
  }, [blogId]);

  const module = {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: imageHandler, // ✅ override default base64 image
      },
    },
  };

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const userImage = localStorage.getItem("profile_pic_url");
    setUsername(name);
    setUserUrl(userImage);

    const fetchBlogData = async () => {
      try {
        const blogDocRef = doc(db, "Blog", blogId);
        const blogDoc = await getDoc(blogDocRef);

        if (blogDoc.exists()) {
          const jsonData = blogDoc.data();

          const currentUser = auth.currentUser;
          if (currentUser && jsonData.user_id) {
            if (currentUser.uid !== jsonData.user_id) {
              navigate("/");
            } else {
              setTitle(jsonData.blog_title || "");
              setValue(jsonData.blog_content || "");
              settitlePublish(jsonData.poster_title || jsonData.blog_title || "");
              setPreviewText(jsonData.poster_description || "");
              setSearchTerm(jsonData.blog_related_tag || "");
            }
          } else {
            console.error("No user data found or user is not logged in.");
          }
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching blog data: ", error);
      }
    };

    fetchBlogData();
  }, [blogId, navigate]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (input) setShowDropdown(true);
    else setShowDropdown(false);

    const filtered = blogTags.filter((tag) =>
      tag.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredTags(filtered);
  };

  const handleTagSelect = (tag) => {
    setSearchTerm(tag);
    setShowDropdown(false);
  };

  const getFirst150Characters = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.length > 100 ? textContent.substring(0, 100) : textContent;
  };

  const storeBlogAsDraft = useCallback(async () => {
    try {
      setsavedText(true);
      const user = auth.currentUser;
      if (!user) return;

      const blogDocRef = doc(db, "Blog", blogId);

      // ✅ Safety: if base64 exists (should not after our handler), strip it to avoid Firestore size crash
      const safeValue = (value || "").replace(
        /<img[^>]+src="data:image\/[^"]+"[^>]*>/g,
        ""
      );

      const blogData = {
        blog_id: blogId,
        user_id: user.uid,
        blog_title: title ? title : "Undefined Title",
        blog_content: safeValue ? safeValue : "No Description Avaiable",
        blog_status: "Draft",
        created_at: new Date().toISOString(),
      };

      await setDoc(blogDocRef, blogData, { merge: true });
    } catch (error) {
      console.error("Error saving blog draft:", error);
    }

    setTimeout(() => {
      setsavedText(false);
    }, 1000);
  }, [blogId, title, value]);

  useEffect(() => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

    timeoutIdRef.current = setTimeout(() => {
      storeBlogAsDraft();
    }, 1000);

    const extractedText = getFirst150Characters(value);
    setPreviewText(extractedText);

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [value, storeBlogAsDraft]);

  const setPublishTitle = (e) => {
    const totalLength = e.target.value;
    if (totalLength.length < 60) {
      setAlertText("");
      settitlePublish(e.target.value);
    } else {
      setAlertText("Poster Title Maximum size is 60 character");
    }
  };

  const Titlechange = (e) => {
    const v = e.target.value;

    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

    timeoutIdRef.current = setTimeout(() => {
      storeBlogAsDraft();
    }, 2000);

    setTitle(v);
    setPublishTitle(e);
  };

  const submitBlog = () => {
    setisPublish(true);
  };

  const getFirstImageSrc = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const img = tempDiv.querySelector("img");
    return img ? img.src : "";
  };

  const firstImageSrc = getFirstImageSrc(value);

  const startContinuousListening = () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      alert("This Browser Not Support This Functionality");
    }
  };

  useEffect(() => {
    if (transcript) setValue(transcript);
  }, [transcript]);

  const saveAsBlog = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first.");
        return;
      }

      const blogDocRef = doc(db, "Blog", blogId);

      // ✅ Extra safety: strip any base64 img tags if pasted from somewhere
      const safeValue = (value || "").replace(
        /<img[^>]+src="data:image\/[^"]+"[^>]*>/g,
        ""
      );

      const blogData = {
        blog_title: title,
        blog_content: safeValue,
        poster_title: titlePublish,
        poster_description: previewText,
        blog_related_tag: searchTerm,
        blog_status: "Publish",
        uploded_at: new Date().toISOString(),
        poster_image_url: firstImageSrc || "", // ✅ optional, helps home cards
      };

      await setDoc(blogDocRef, blogData, { merge: true });

      navigate("/");
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Publish failed. Check Firestore rules / content size / internet.");
    }
  };

  const textAreaChange = (e) => {
    const totalLength = e.target.value;
    if (totalLength.length < 100) {
      setAlertText("");
      setPreviewText(totalLength);
    } else {
      setAlertText("Description Lenght Maximum size is 100 character.");
    }
  };

  return (
    <>
      {isPublish ? (
        <div className="publish">
          <div className="preview">
            <p className="previewtext">Preview </p>
            <p className="storyheader">{title}</p>
            <div
              className="content-decs"
              dangerouslySetInnerHTML={{ __html: value }}
            ></div>
          </div>

          <div className="final">
            <div className="storyposter">
              <p className="storypostertext">Story Poster</p>
              {firstImageSrc ? (
                <img src={firstImageSrc} alt="Story Preview" className="storyimage" />
              ) : (
                <div className="storydiv">
                  No image available for display. Please consider adding an image to
                  enhance your content.
                </div>
              )}
            </div>

            <div className="storyheaderview">
              <input
                className="storyheadertext"
                value={titlePublish}
                onChange={setPublishTitle}
              />
              <textarea
                className="storyfirsttext"
                value={previewText}
                onChange={textAreaChange}
                style={{ resize: "none", overflow: "hidden" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              {alertText ? <h4 className="alertText">* {alertText} *</h4> : null}
            </div>

            <div className="publishing">
              <p className="publishingtext">Publishing to {username}</p>
              <p className="addtopic">
                Add Topics to Help Users Find Your Content Seamlessly and Easily.
              </p>

              <div className="tag-dropdown-container">
                <input
                  type="text"
                  className="storyfirsttext1"
                  placeholder="Search Tags"
                  value={searchTerm}
                  onChange={handleInputChange}
                />
                {showDropdown && filteredTags.length > 0 && (
                  <ul className="tag-dropdown">
                    {filteredTags.map((tag, index) => (
                      <li
                        key={index}
                        className="tag-dropdown-item"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              className="publishtag1"
              onClick={saveAsBlog}
              disabled={!searchTerm || titlePublish.length < 10 || previewText.length < 20}
            >
              Publish Now
            </button>
          </div>

          <X color="#676767" className="back" onClick={() => setisPublish(false)} />
        </div>
      ) : (
        <div className="main-story-write-page">
          <div className="header-story-write">
            <div className="left-side-story-header">
              <h1 className="sitename" onClick={() => navigate("/")}>
                Mindly
              </h1>
              <h4 className="draft-saved-text">Draft in {username}</h4>
              {savedText ? <h4 className="saved-text">Saved</h4> : null}
            </div>

            <div className="right-side-story-header">
              {!listening ? (
                <Mic
                  size={20}
                  color="#676767"
                  strokeWidth={1.5}
                  onClick={startContinuousListening}
                />
              ) : (
                <div onClick={SpeechRecognition.stopListening} className="loader1">
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                  <span className="stroke"></span>
                </div>
              )}

              <button
                className="publishtag"
                onClick={submitBlog}
                disabled={title.length < 10 || value.length < 30}
              >
                Publish
              </button>

              <Ellipsis size={20} color="#676767" />
              <Bell size={20} strokeWidth={1.5} color="#676767" />
              <img src={user_img_url} alt="" className="user-profile-pic-url" />
            </div>
          </div>

          <div className="actual-writing-content">
            <input
              type="text"
              value={title}
              className="blog-title-text-input"
              placeholder="Title"
              onChange={Titlechange}
            />
          </div>

          <ReactQuill
            className="richtexteditor"
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={setValue}
            modules={module}
            style={{ fontFamily: "'IBM Plex Serif', serif" }}
          />
        </div>
      )}
    </>
  );
}
