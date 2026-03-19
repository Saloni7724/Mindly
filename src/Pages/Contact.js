import React, { useState } from "react";
import "../Styles/Contact.css";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setError("All fields are required!");
      return;
    }

    setError("");
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        <div className="contact-left">
          <h1>Contact Mindly</h1>
          <p>
            Have questions, feedback, or ideas? We'd love to hear from you.
            Reach out to us and we’ll respond as soon as possible.
          </p>

          <div className="contact-details">
            <div className="detail">
              <span>📧</span>
              <p>support@mindly.com</p>
            </div>
            <div className="detail">
              <span>📍</span>
              <p>India</p>
            </div>
            <div className="detail">
              <span>⏰</span>
              <p>Mon - Fri, 9AM - 6PM</p>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form onSubmit={handleSubmit}>
            <h2>Send us a Message</h2>

            {error && <div className="error">{error}</div>}

            <div className="input-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="input-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group">
              <label>Your Message</label>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
              />
            </div>

            <button type="submit" className="send-btn">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
