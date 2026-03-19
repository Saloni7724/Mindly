import React, { useState } from "react";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function Avatar({ name = "User", photoUrl = "", size = 100 }) {
  const [imgError, setImgError] = useState(false);

  const showImage = photoUrl && !imgError;

  return (
    <div className="avatarBox" style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={photoUrl}
          alt="profile"
          className="avatarImg"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="avatarInitials">{getInitials(name)}</div>
      )}
    </div>
  );
}
