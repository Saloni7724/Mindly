import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { auth, db } from "../Backend/firebase-init";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

import { followpage } from "../Utils/Followpage";
import "../Styles/Notification.css";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const lastNotificationId = useRef(null);

  // 🔊 play sound (controlled from settings)
  const playSound = () => {
    if (isMuted) return;

    const audio = new Audio("/notifications.wav");
    audio.play().catch(() => {});
  };

  // ✅ listen user mute setting
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      setIsMuted(snap.data()?.muteNotifications || false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ notifications listener
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "Notifications"),
      where("receiverId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docItem) => {
          const notif = { id: docItem.id, ...docItem.data() };

          if (notif.senderId) {
            const userRef = doc(db, "users", notif.senderId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              notif.senderData = userSnap.data();
            }
          }

          return notif;
        })
      );

      // 🔊 play sound only for NEW notification
      if (data.length > 0) {
        const latest = data[0];

        if (latest.id !== lastNotificationId.current) {
          playSound();
          lastNotificationId.current = latest.id;
        }
      }

      setNotifications(data);
    });

    return () => unsubscribe();
  }, [isMuted]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "Notifications", id), {
      isRead: true,
    });
  };

  const handleFollowBack = async (senderId) => {
    await followpage(auth.currentUser.uid, senderId);
  };

  const clearAll = async () => {
    const promises = notifications.map((n) =>
      deleteDoc(doc(db, "Notifications", n.id))
    );
    await Promise.all(promises);
  };

  return (
    <div className="notification-wrapper">
      {/* 🔔 Bell */}
      <div className="bell-icon" onClick={() => setOpen(!open)}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {/* 📥 Dropdown */}
      {open && (
        <div className="notification-dropdown fade-in">
          <div className="notification-header">
            <h4>Notifications</h4>
            {notifications.length > 0 && (
              <button className="clear-btn" onClick={clearAll}>
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="no-notification">No notifications</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`notification-item ${
                  item.isRead ? "read" : "unread"
                }`}
                onClick={() => markAsRead(item.id)}
              >
                {item.senderData?.profile_pic_url ? (
                  <img
                    src={item.senderData.profile_pic_url}
                    alt=""
                    className="notif-avatar"
                  />
                ) : (
                  <div className="notif-avatar-fallback">
                    {item.senderData?.user_name?.charAt(0) || "U"}
                  </div>
                )}

                <div className="notif-content">
                  <p>{item.message}</p>

                  {item.type === "follow" && (
                    <button
                      className="follow-back-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowBack(item.senderId);
                      }}
                    >
                      Follow Back
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}