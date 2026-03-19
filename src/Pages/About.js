import React from "react";
import "../Styles/About.css";
import { FaBrain, FaUsers, FaRocket, FaShieldAlt } from "react-icons/fa";

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About Mindly</h1>
        <p>
          Mindly is a smart blogging platform designed to empower writers,
          thinkers, and readers with an interactive and intelligent environment.
        </p>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-text">
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a platform where ideas flow freely, content
            is easy to manage, and users experience blogging in a smarter and
            more engaging way using modern technologies like React and Firebase.
          </p>
        </div>
        <div className="mission-image">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
            alt="mission"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <h2>Why Mindly is Different?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <FaBrain className="feature-icon" />
            <h3>Mindly</h3>
<p>Turn your voice into powerful stories with smart writing and voice typing.</p>
</div>
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>User Friendly</h3>
            <p>Clean and interactive UI for better user experience.</p>
          </div>

          <div className="feature-card">
            <FaRocket className="feature-icon" />
            <h3>Fast & Reliable</h3>
            <p>Powered by Firebase for real-time performance and speed.</p>
          </div>

          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure Platform</h3>
            <p>Authentication and database security with Firebase.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2>Built With Modern Technologies</h2>
        <p>
          Mindly is developed using ReactJS for frontend and Firebase for
          backend, providing a seamless full-stack experience.
        </p>
      </section>
    </div>
  );
};

export default About;
