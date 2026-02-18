import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl } from "../utils/globalurl";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.length < 10)
      newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post(`${baseUrl}/api/contact`, formData);
      toast.success("Message sent successfully 🎉");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Masthead */}
      <header className="masthead">
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-8 align-self-end mb-4 page-title">
              <h1 className="text-white">Contact Us</h1>
              <hr className="divider my-4" />
              <p className="text-white-75">
                We'd love to hear from you. Send us your queries or feedback.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contact Form Card */}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h3 className="text-center mb-4">Get in Touch</h3>
                <form onSubmit={handleSubmit} noValidate>
                  {["name", "email", "subject"].map(field => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        className={`form-control ${errors[field] ? "is-invalid" : ""}`}
                        placeholder={`Enter your ${field}`}
                        value={formData[field]}
                        onChange={handleChange}
                      />
                      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      name="message"
                      rows="6"
                      maxLength={500}
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      placeholder="Write your message..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                    <small className="text-muted d-block mb-1">{formData.message.length}/500 characters</small>
                    {errors.message && <div className="invalid-feedback d-block">{errors.message}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
