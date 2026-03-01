import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { authUrl } from "../utils/globalurl";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${authUrl}/forgot-password`, { email });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(2);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${authUrl}/verify-otp`, { email, otp });
      if (res.data.success) {
        toast.success(res.data.message);
        setStep(3);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${authUrl}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="masthead">
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-8 align-self-end mb-4 page-title">
              <h3 className="text-white">Forgot Password</h3>
              <hr className="divider my-4" />
              <div className="col-md-12 mb-2 justify-content-center"></div>
            </div>
          </div>
        </div>
      </header>
      <div className="container mt-3 pt-2">
        <div className="col-lg-12">
          <div className="card mb-4">
            <div className="card-body">
              <div className="row justify-content-center">
                <div className="container-fluid col-lg-6 col-md-8 col-sm-10">
                  {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                      <div className="form-group mb-3">
                        <label className="control-label mb-1">
                          Enter your registered email address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="example@site.com"
                        />
                      </div>
                      {error && <div className="text-danger mb-3">{error}</div>}
                      <button
                        type="submit"
                        className="btn btn-info btn-block w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : null}
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                      <div className="form-group mb-3">
                        <label className="control-label mb-1">Enter OTP</label>
                        <input
                          type="text"
                          className="form-control"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          placeholder="6-digit OTP"
                        />
                      </div>
                      {error && <div className="text-danger mb-3">{error}</div>}
                      <button
                        type="submit"
                        className="btn btn-info btn-block w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : null}
                        {isLoading ? "Verifying OTP..." : "Verify OTP"}
                      </button>
                    </form>
                  )}

                  {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                      <div className="form-group mb-3 position-relative">
                        <label className="control-label mb-1">
                          New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control pe-5"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "15px",
                            top: "40px",
                            cursor: "pointer",
                            color: "#6c757d",
                          }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                      <div className="form-group mb-3 position-relative">
                        <label className="control-label mb-1">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control pe-5"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {error && <div className="text-danger mb-3">{error}</div>}
                      <button
                        type="submit"
                        className="btn btn-info btn-block w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : null}
                        {isLoading ? "Resetting Password..." : "Reset Password"}
                      </button>
                    </form>
                  )}

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Remember your password?{" "}
                      <Link to="/login">Login here</Link>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
