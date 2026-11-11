
import { useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const questions = [
  {
    question: "What products do you sell?",
    answer:
      "We offer products across maternity, baby care, and children's categories.",
  },
  {
    question: "How can I place an order?",
    answer:
      "Browse our shop, select your preferred products, add them to your cart, and proceed to checkout.",
  },
  {
    question: "Do you deliver across Nigeria?",
    answer:
      "Delivery coverage and fees depend on your location. Please contact us to confirm availability.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order has been placed, visit the My Orders page to view its current status.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Available payment options will be displayed during checkout. Actual payment methods depend on the payment provider connected to the store.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Please contact our customer support team for assistance with returns or exchanges and to confirm the applicable policy.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Click Register, enter your details, and submit the registration form to create an account.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "Visit our Contact page and send us a message. We will assist you with your enquiry.",
  },
];

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="am-faq-page">
      <div className="am-faq-header">
        <span>HELP CENTRE</span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers to common questions about shopping with
          Angels & Mummies.
        </p>
      </div>

      <div className="am-faq-list">
        {questions.map((item, index) => (
          <div className="am-faq-item" key={index}>
            <button
              type="button"
              className="am-faq-question"
              onClick={() => toggleQuestion(index)}
              aria-expanded={activeIndex === index}
            >
              <span>{item.question}</span>
              <span className="am-faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>

            {activeIndex === index && (
              <div className="am-faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="am-faq-contact">
        <h2>Still Have Questions?</h2>
        <p>Our team is happy to help you.</p>
        <Link to="/contact">Contact Us</Link>
      </div>
    </section>
  );
}

export default FAQ;
