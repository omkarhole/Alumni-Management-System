import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";
import { authUrl, oauthUrl } from "../utils/globalurl";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.action === "navtologin") {
      toast.info("Please Login Now");
    }
    return () => {
      // cleanup
    };
  }, [location.state]);

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    window.location.href = `${oauthUrl}/google`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${authUrl}/login`, values, { withCredentials: true })
      .then((res) => {
        if (res.data.loginStatus) {
          localStorage.setItem("user_id", res.data.userId);
          localStorage.setItem("user_type", res.data.userType);
          localStorage.setItem("user_name", res.data.userName);
          localStorage.setItem("alumnus_id", res.data.alumnus_id);
          login(res.data.userType);
          navigate("/", { state: { action: "homelogin" } });
        } else {
          setErrors(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <header className="masthead">
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-8 align-self-end mb-4 page-title">
              <h3 className="text-white">Login Account</h3>
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
                  <form onSubmit={handleSubmit} id="login-frm">
                    <div className="form-group">
                      <label htmlFor="email" className="control-label">
                        Email
                      </label>
                      <input
                        onChange={(e) =>
                          setValues({ ...values, email: e.target.value })
                        }
                        type="email"
                        id="email"
                        name="username"
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password" className="control-label">
                        Password
                      </label>
                      <div className="position-relative">
                        <input
                          onChange={(e) =>
                            setValues({ ...values, password: e.target.value })
                          }
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          required
                          className="form-control pe-5"
                        />

                        {/* Eye Icon */}
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                          }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                      <div className="text-danger mt-2">{errors && errors}</div>
                      <small className="mt-2 text-muted ">
                        Don't have an account?{" "}
                        <Link to="/signup">Sign up here</Link>
                      </small>
                    </div>
                    <hr className="divider" />
                    <div className="row justify-content-center">
                      <div className="col-md-6 text-center">
                        <button
                          type="submit"
                          className="btn btn-info btn-block w-100 mb-3"
                        >
                          Login
                        </button>

                        <div className="d-flex justify-content-center">
                          <button
                            onClick={handleGoogleAuth}
                            className="btn btn-outline-dark btn-block w-100 d-flex align-items-center justify-content-center gap-2"
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-google"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                            </svg>
                            Login with Google
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
