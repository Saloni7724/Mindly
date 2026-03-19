import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Outlet, useNavigate, useOutlet } from "react-router-dom";
import { auth } from "../Backend/firebase-init";

export default function Dashboard() {
  const navigate = useNavigate();
  const outlet = useOutlet();
  useEffect(() => {
    document.title = "Mindly";
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/homepage");
      }
    });
    return () => unsubscribe();
  }, []);

  return outlet ? (
    <Outlet />
  ) : (
    <>
      {/*<Header/>
      <Lefthomepagepart searchparam='Following'/>*/}
    </>
  );
}
