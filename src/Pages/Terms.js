import React from "react";
import "../Styles/Terms.css";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <div className="terms-card">
        <h1 className="terms-title">Terms & Conditions</h1>
        <p className="terms-updated">Last Updated: February 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Mindly, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and password and for restricting access to your device.
          </p>
        </section>

        <section>
          <h2>3. Content Responsibility</h2>
          <p>
            Users are responsible for the content they publish. Mindly does
            not take responsibility for user-generated content.
          </p>
        </section>

        <section>
          <h2>4. Prohibited Activities</h2>
          <ul>
            <li>Posting harmful or illegal content</li>
            <li>Spamming or harassment</li>
            <li>Attempting to hack or misuse the platform</li>
          </ul>
        </section>

        <section>
          <h2>5. Termination</h2>
          <p>
            We reserve the right to terminate accounts that violate our
            policies without prior notice.
          </p>
        </section>

        <section>
          <h2>6. Changes to Terms</h2>
          <p>
            Mindly may update these Terms from time to time. Continued use
            of the platform means you accept the updated terms.
          </p>
        </section>

        <div className="terms-footer">
          <button
            className="terms-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}