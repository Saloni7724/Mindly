import React, { useEffect, useState } from "react";
import "../Styles/Homepage.css";
import mainImage from "../undraw_font_re_efri 1.png";
import { ArrowRight, Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../Backend/firebase-init";
import { saveSession } from "../Utils/saveSession"; // you already have this
import { updateDoc } from "firebase/firestore"; // for step 9
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  
} from "firebase/auth";

import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { generateRandomId } from "../Utils/generateId";
import { doc, setDoc ,getDoc } from "firebase/firestore";

export default function Homeapage() {
  const [isNewUser, setIsNewUser] = useState(() => {
    return localStorage.getItem("newUser") === "true" || false;
  });
 const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIslogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const localSession = localStorage.getItem("sessionId");
    console.log("Local session cookies", localSession);
  }, []);

  const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible((prev) => !prev);

  const reload = () => window.location.reload();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      const profileCompleted =
        snap.exists() && snap.data()?.profileCompleted === true;

      if (!profileCompleted) {
        navigate("/setuserprofile");
        return;
      }

      // 🔹 Step 9: Reset forceLogout flag
      if (snap.exists() && snap.data()?.forceLogout) {
        await updateDoc(userRef, { forceLogout: false });
      }

      // 🔹 Step 2: Create session
      const sessionId = generateRandomId();
      localStorage.setItem("sessionId", sessionId);

      await setDoc(userRef, { activeSession: sessionId }, { merge: true });
      
      // 🔹 Save session in userSessions subcollection
      await saveSession(user);

      navigate("/");
    } catch (err) {
      console.log("AUTH STATE ERROR:", err);
      navigate("/");
    }
  });

  return () => unsubscribe();
}, [navigate]);

      

      

  const closeForm = (value) => {
    setIsForgotPassword(false);
    if (value === 0) {
      setIslogin(false);
      setIsSignUp(true);
    } else if (value === 1) {
      setIslogin(true);
      setIsSignUp(false);
    } else if (value === 2) {
      setIsForgotPassword(true);
      setIslogin(false);
      setIsSignUp(false);
    } else {
      setIsForgotPassword(false);
      setIslogin(false);
      setIsSignUp(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkFormData = () => {
    if (!email || !isValidEmail(email)) {
      toast.error("Email Address is not valid");
      return false;
    }
    if (!password) {
      toast.error("Password is not valid");
      return false;
    }
if (isNewUser) {
  console.log("New user");
}
    if (isSignUp) {
      if (!confirmPassword) {
        toast.error("Please fill out all fields");
        return false;
      }
      if (confirmPassword !== password) {
        toast.error("Passwords don't match");
        return false;
      }
    }
    return true;
  };

  const signin = async () => {
    setLoading(true);

    if (checkFormData()) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        closeForm(3);
      } catch (error) {
        console.log(error);
        checkError(error);
      }
    }
    setLoading(true);

  };

  const signup = async () => {
    setLoading(true);

    if (checkFormData()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await setDoc(
  doc(db, "users", user.uid),
  {
    user_id: user.uid,
    profileCompleted: false,
  },
  { merge: true }
);


        // ✅ Verification mail will still be sent, but app won't block
        await sendEmailVerification(user);

        setIsNewUser(true);
        localStorage.setItem("newUser", "true");
        closeForm(3);
      } catch (error) {
        checkError(error);
      }
    } else {
      toast.error("Please fill out all required fields correctly.");
    }
  setLoading(true);

  };

  const checkError = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        toast.error("This email is already registered. Please log in.");
        break;
      case "auth/weak-password":
        toast.error("Password should be at least 6 characters.");
        break;
      case "auth/invalid-email":
        toast.error("Invalid email address. Please enter a valid email.");
        break;
      case "auth/invalid-credential":
        toast.error("Please check your email and password.");
        break;
      case "auth/user-not-found":
        toast.error("No user found with this email. Please sign up.");
        break;
      default:
        toast.error("Authentication error: " + error.message);
    }
  };

  const resetEmail = async () => {
  setLoading(true);

    if (!email) {
      toast.error("Enter Valid Email Address", {
        style: { fontSize: "14px", fontFamily: "Roboto" },
      });
    } else {
      try {
        await sendPasswordResetEmail(auth, email);
        closeForm(3);
        toast.success("Reset Link Has been Sent to your email address", {
          style: { fontSize: "14px", fontFamily: "Roboto" },
        });
      } catch (error) {
        toast.error(`Error: ${error.message}`, {
          style: { fontSize: "14px", fontFamily: "Roboto" },
        });
      }
    }
   setLoading(true);

  };

  return (
    <>
      <ToastContainer
        style={{
          fontFamily: "Roboto",
          fontSize: "14px",
        }}
        autoClose={2000}
      />

      {/* Login and Sign Up Form */}
      <form
        className={`commonbutton ${isLogin || isSignUp ? "show" : ""}`}
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="sitename1">Mindly</h1>

        <h3 className="thought">
          {isLogin
            ? "Inspire Someone by your Stories and Writing"
            : "Show the world your emotions in words."}
        </h3>

        <span className="close-button">
          <X onClick={() => closeForm(3)} />
        </span>

        <div className="inputfields">
          <h3 className="labelofinput">Email Address</h3>
          <div className="input">
            <input
              type="email"
              placeholder="abc@xyz.com"
              className="inputfield"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <h3 className="labelofinput">Password</h3>
          <div className="input">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="********"
              className="inputfield"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {isPasswordVisible ? (
                <EyeOff
                  size={20}
                  strokeWidth={1.7}
                  style={{ marginRight: "5px" }}
                />
              ) : (
                <Eye
                  size={20}
                  strokeWidth={1.7}
                  style={{ marginRight: "5px" }}
                />
              )}
            </span>
          </div>

          {isLogin && (
            <div className="forgot">
              <button className="forgotpassword" onClick={() => closeForm(2)}>
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        {isSignUp && (
          <div className="confirmPassword">
            <h3 className="labelofinput">Confirm Password</h3>
            <div className="input">
              <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                placeholder="********"
                className="inputfield"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={toggleConfirmPasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {isConfirmPasswordVisible ? (
                  <EyeOff
                    size={20}
                    strokeWidth={1.7}
                    style={{ marginRight: "5px" }}
                  />
                ) : (
                  <Eye
                    size={20}
                    strokeWidth={1.7}
                    style={{ marginRight: "5px" }}
                  />
                )}
              </span>
            </div>
          </div>
        )}

        <button
          className="signin"
          type="button"
          onClick={isLogin ? signin : signup}
          disabled={loading}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
        >
          {!loading ? (
            isLogin ? (
              "Sign in"
            ) : (
              "Sign up"
            )
          ) : (
            <Loader2 size={15} style={{ color: "white" }} className="loader" />
          )}
        </button>

        {isLogin ? (
          <button className="alreadytext" onClick={() => closeForm(0)}>
            Don't Have An Account?{" "}
            <span style={{ textDecoration: "underline", marginLeft: "5px" }}>
              Sign up
            </span>
          </button>
        ) : (
          <button className="alreadytext" onClick={() => closeForm(1)}>
            Already Have An Account?{" "}
            <span style={{ textDecoration: "underline", marginLeft: "5px" }}>
              Sign in
            </span>
          </button>
        )}
      </form>

      {/* Forgot Password Form */}
      <form
        className={`commonbutton ${isForgotPassword ? "show" : ""}`}
        onSubmit={(e) => e.preventDefault()}
      >
        <h1 className="sitename1">Mindly</h1>
        <h3 className="thought">Password Can be Changed, Emotions Can't</h3>

        <span className="close-button">
          <X onClick={() => closeForm(3)} />
        </span>

        <div className="inputfields">
          <h3 className="labelofinput">Email Address</h3>
          <div className="input">
            <input
              type="email"
              placeholder="abc@xyz.com"
              className="inputfield"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="signin"
            type="button"
            onClick={resetEmail}
            disabled={loading}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {!loading ? (
              "Send Reset Link"
            ) : (
              <Loader2 size={15} style={{ color: "white" }} className="loader" />
            )}
          </button>

          <button className="alreadytext" onClick={() => closeForm(1)}>
            Already Have An Account?{" "}
            <span style={{ textDecoration: "underline", marginLeft: "5px" }}>
              Sign in
            </span>
          </button>
        </div>
      </form>

      {/* Dashboard */}
      <div
        className={`${
          isLogin || isSignUp || isForgotPassword
            ? "makeblur active"
            : "makeblur"
        }`}
        onClick={
          isLogin || isSignUp || isForgotPassword
            ? () => closeForm(3)
            : undefined
        }
      >
        {/* ✅ HEADER (RESTORED) */}
        <div className="header">
          <h1 className="sitename">Mindly</h1>

          <div className="headerpart">
            <a href="*" className="homepagebuttons">
              Features
            </a>
            <a href="*" className="homepagebuttons">
              Contact Team
            </a>
            <a href="*" className="homepagebuttons">
              Write
            </a>
            <a href="#" className="signinbutton" onClick={() => closeForm(1)}>
              Sign in
            </a>
          </div>
        </div>

        <div className="headerbottom">
          <img src={mainImage} alt="" />
          <div className="headerbottomcontent">
            <h1 className="thought1">Unveil Thoughts</h1>
            <h1 className="thought2">Voice Yours</h1>
            <h3 className="qoute">Place Where Your Stories Meet Others' Emotions.</h3>
            <a href="#" className="getstarted" onClick={() => closeForm(1)}>
              Get Started <ArrowRight style={{ marginLeft: 2 }} />
            </a>
          </div>
        </div>

        {/* ✅ FOOTER (RESTORED) */}
        <div className="footer">
          <h1 className="sitename" onClick={reload}>
            Mindly
          </h1>
          <div className="footerpart">
            <a href="*" className="footerbutons">
              Team Mindly
            </a>
            <a href="*" className="footerbutons">
              Contact
            </a>
            <a href="*" className="footerbutons">
              About
            </a>
            <a href="*" className="footerbutons">
              Terms
            </a>
            <a href="*" className="footerbutons">
              Help
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
