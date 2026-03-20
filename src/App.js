import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Homeapage from "./Pages/Homeapage";
import { useEffect, useState } from "react";
import Loading from "./Pages/Loading";
import Dashboard from "./Pages/Dashboard";
import Userprofile from "./Pages/Userprofile";
import Otherpage from "./Pages/Otherpage";
import Newstory from "./Pages/Newstory";
import Yourpost from "./Pages/Yourpost";
import Readblog from "./Pages/Readblog";
import BlogContextProvider from "./Utils/Contenxtprovider";
import Teammindly from "./Pages/Teammindly";
import Searchpage from "./Pages/Searchpage";
import Publicprofile from "./Pages/Publicprofile";
import Yourprofile from "./Pages/Yourprofile";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Settings from "./Pages/Setting";
import Terms from "./Pages/Terms";
import Help from "./Pages/Help";
import ThemeProvider from "./Context/ThemeContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./Backend/firebase-init";
import { auth } from "./Backend/firebase-init";
import { updateDoc, serverTimestamp } from "firebase/firestore";
 import { onAuthStateChanged } from "firebase/auth";
function App() {
    useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    if (savedTheme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.body.setAttribute("data-theme", savedTheme);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLoading();
  }, []);



useEffect(() => {
  let unsubscribeSnapshot = null;
  let interval = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const uid = user.uid;
    const sessionId = localStorage.getItem("sessionId");

    // 🔥 REALTIME LOGOUT LISTENER
    unsubscribeSnapshot = onSnapshot(doc(db, "users", uid), (docSnap) => {
      if (docSnap.data()?.forceLogout) {
        auth.signOut();
      }
    });

    // 🔥 UPDATE LAST ACTIVE
    if (sessionId) {
      interval = setInterval(async () => {
        try {
          const sessionRef = doc(
            db,
            "userSessions",
            uid,
            "sessions",
            sessionId
          );

          await updateDoc(sessionRef, {
            lastActive: serverTimestamp(),
          });
        } catch (err) {
          console.log("Update active error:", err);
        }
      }, 60000); // every 1 min
    }
  });

  return () => {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    if (interval) clearInterval(interval);
    unsubscribeAuth();
  };
}, []);


  const setLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  };
  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
      <ThemeProvider>   
    <BlogContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            default
            path="/homepage"
            element={<Homeapage setLoading={setLoading} />}
          />
          <Route
            default
            path="/teammindly"
            element={<Teammindly setLoading={setLoading} />}
          />
          <Route path="/" element={<Dashboard />}>
            <Route
              path=":searchparam"
              element={<Otherpage setLoading={setLoading} />}
            />
            <Route index element={<Otherpage setLoading={setLoading} />} />
            <Route
              path="/setuserprofile"
              element={<Userprofile setLoading={setLoading} />}
            />
            <Route
              path="/p/:blogId/edit"
              element={<Newstory setLoading={setLoading} />}
            />
            <Route
              path="/post/:status"
              element={<Yourpost setLoading={setLoading} />}
            />
             <Route
              path="/help"
              element={<Help setLoading={setLoading} />}
            />
            <Route
              path="/r/:username/:blogcontent"
              element={<Readblog setLoading={setLoading} />}
            />
            <Route
              path="/terms" element={<Terms setLoading={setLoading} />}
              />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
             <Route path="/Settings" element={<Settings />} />

            <Route path="/searchresult/:searchparam" element={<Searchpage />} />
            <Route
              path="/search/profile/:username"
              element={<Publicprofile />}
            />
            <Route path="/manageprofile" element={<Yourprofile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </BlogContextProvider>
      </ThemeProvider>   
  );
}

export default App;
