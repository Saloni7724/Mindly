import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../Backend/firebase-init";
import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);


useEffect(() => {
  const q = query(
    collection(db, "Notifications"),
    where("receiverId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotifications(data);
  });

  return () => unsubscribe();
}, []);
  useEffect(() => {
    const fetchNotifications = async () => {
      const q = query(
        collection(db, "Notifications"),
        where("receiverId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((n) => (
        <p key={n.id}>{n.message}</p>
      ))}
    </div>
  );
};

export default Notifications;