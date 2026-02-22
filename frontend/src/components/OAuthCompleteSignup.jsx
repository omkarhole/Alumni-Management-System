import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import { baseUrl, oauthUrl } from '../utils/globalurl';

const OAuthCompleteSignup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [courses, setCourses] = useState([]);
    const [values, setValues] = useState({
        userType: "",
        course_id: "",
        gender: "male",
        batch: new Date().getFullYear(),
        enrollment_year: new Date().getFullYear(),
        current_year: 1,
        roll_number: ""
    });

    const searchParams = new URLSearchParams(location.search);

    const tempToken = searchParams.get('tempToken') || location.state?.tempToken;
    const name = searchParams.get('name') || location.state?.name;
    const email = searchParams.get('email') || location.state?.email;

    useEffect(() => {
        if (!tempToken) {
            toast.error("Invalid session. Please login again.");
            navigate('/login');
            return;
        }

        // Fetch courses for the dropdown
        axios.get(`${baseUrl}/courses`)
            .then(res => setCourses(res.data))
            .catch(err => console.error(err));
    }, [tempToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${oauthUrl}/google/complete-signup`, {
                ...values,
                tempToken
            });

            if (res.data.signupStatus && res.data.loginStatus) {
                // Set local storage and login context like regular login
                localStorage.setItem("user_id", res.data.userId);
                localStorage.setItem("user_type", res.data.userType);
                localStorage.setItem("user_name", res.data.userName);
                if (res.data.userType === 'alumnus') {
                    localStorage.setItem("alumnus_id", res.data.userId);
                }

                login(res.data.userType);
                toast.success("Account created and logged in successfully!");
                navigate("/", { state: { action: "homelogin" } });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to complete signup");
        }
    };

    if (!tempToken) return null;

    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Complete Google Signup</h3>
                            <hr className="divider my-4" />
                            <p className="text-white-75 mb-5">Welcome {name}! We just need a few more details.</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mt-3 pt-2">
                <div className="col-lg-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <div className="container col-lg-6 col-md-8 col-sm-10">
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group mb-3">
                                            <label className="control-label">Email</label>
                                            <input type="text" className="form-control" value={email} disabled />
                                        </div>

                                        <div className="form-group mb-3">
                                            <label htmlFor="userType" className="control-label">I am a</label>
                                            <select
                                                onChange={(e) => setValues({ ...values, userType: e.target.value })}
                                                className="custom-select form-control"
                                                id="userType"
                                                required
                                                value={values.userType}
                                            >
                                                <option value="" disabled>Please select role</option>
                                                <option value="alumnus">Alumnus</option>
                                                <option value="student">Student</option>
                                            </select>
                                        </div>

                                        {values.userType === "alumnus" &&
                                            <div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="course_id" className="control-label">Course</label>
                                                    <select onChange={(e) => setValues({ ...values, course_id: e.target.value })} className="form-control" required value={values.course_id}>
                                                        <option disabled value="">Select course</option>
                                                        {courses.map(c => (
                                                            <option key={c._id || c.id} value={c._id || c.id}>{c.course}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="gender" className="control-label">Gender</label>
                                                    <select onChange={(e) => setValues({ ...values, gender: e.target.value })} className="form-control" required value={values.gender}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="batch" className="control-label">Batch Year</label>
                                                    <input type="number" className="form-control" value={values.batch} onChange={(e) => setValues({ ...values, batch: e.target.value })} required />
                                                </div>
                                            </div>
                                        }

                                        {values.userType === "student" &&
                                            <div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="course_id" className="control-label">Course</label>
                                                    <select onChange={(e) => setValues({ ...values, course_id: e.target.value })} className="form-control" required value={values.course_id}>
                                                        <option disabled value="">Select course</option>
                                                        {courses.map(c => (
                                                            <option key={c._id || c.id} value={c._id || c.id}>{c.course}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="gender" className="control-label">Gender</label>
                                                    <select onChange={(e) => setValues({ ...values, gender: e.target.value })} className="form-control" required value={values.gender}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className='row mb-3'>
                                                    <div className="col-md-6 mb-3 mb-md-0">
                                                        <label htmlFor="enrollment_year" className="control-label">Enrollment Year</label>
                                                        <input type="number" className="form-control" value={values.enrollment_year} onChange={(e) => setValues({ ...values, enrollment_year: parseInt(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label htmlFor="current_year" className="control-label">Current Year</label>
                                                        <select className="form-control" value={values.current_year} onChange={(e) => setValues({ ...values, current_year: parseInt(e.target.value) })} required>
                                                            <option value={1}>1st Year</option>
                                                            <option value={2}>2nd Year</option>
                                                            <option value={3}>3rd Year</option>
                                                            <option value={4}>4th Year</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="roll_number" className="control-label">Roll Number (Optional)</label>
                                                    <input type="text" className="form-control" value={values.roll_number} onChange={(e) => setValues({ ...values, roll_number: e.target.value })} />
                                                </div>
                                            </div>
                                        }

                                        <hr className="divider my-4" />
                                        <div className="row justify-content-center">
                                            <div className="col-md-6 text-center">
                                                <button type="submit" className="btn btn-info btn-block w-100">Finish Signup</button>
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

export default OAuthCompleteSignup;
