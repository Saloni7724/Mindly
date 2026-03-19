import React, { useState } from "react";
import "../Styles/Help.css";

export default function Help() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      question: "How do I create a blog?",
      answer:
        "Click on the 'Write' button in the top navigation bar and start writing your blog. Once finished, click Publish.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Go to your profile page and click on the Edit Profile button to update your information.",
    },
    {
      question: "How can I save a blog?",
      answer:
        "Click the bookmark icon below any blog post to save it to your saved collection.",
    },
    {
      question: "Why can't I see trending blogs?",
      answer:
        "Trending blogs only show published posts. Make sure your blog status is set to 'Publish'.",
    },
    {
      question: "How do I switch to dark mode?",
      answer:
        "You can enable dark mode from your Settings page.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="help-container">
      <div className="help-card">
        <h1 className="help-title">Help Center</h1>

        <input
          type="text"
          placeholder="Search help topics..."
          className="help-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="faq-section">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${
                  activeIndex === index ? "active" : ""
                }`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span>
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </div>

                {activeIndex === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-results">
              No help topics found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}