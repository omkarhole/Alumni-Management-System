import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authUrl, baseUrl } from '../utils/globalurl';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        userType: "",
        course_id: "",
        enrollment_year: new Date().getFullYear(),
        current_year: 1,
        roll_number: "",
        gender: "male",
        batch: ""
    });
    const [courses, setCourses] = useState([]);


    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(values);
        axios.post(`${authUrl}/signup`, values)
            .then((res) => {
                if (res.data.email) {
                    return toast.warning("Email Already Exists");
                }
                if (res.data.signupStatus) {
                    toast.success(res.data.message);
                    setTimeout(() => {
                        navigate("/login", { state: { action: "navtologin" } })
                    }, 2000)
                } else {
                    toast.error("An error occurred");
                }
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        axios.get(`${baseUrl}/courses`)
            .then((res) => {
                setCourses(res.data);
            })
            .catch(err => console.log(err))
    }, [])


    return (
        <>
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Create Account</h3>
                            <hr className="divider my-4" />
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
                                    <form onSubmit={handleSubmit} id="create_account">
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label">Name</label>
                                            <input onChange={(e) => setValues({ ...values, name: e.target.value })} type="text" className="form-control" id="name" name="name" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email" className="control-label">Email</label>
                                            <input onChange={(e) => setValues({ ...values, email: e.target.value })} type="email" className="form-control" id="email" name="email" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="control-label">Password</label>
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
                                                        color: "#6c757d"
                                                    }}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="userType" className="control-label">User Type</label>
                                            <select onChange={(e) => setValues({ ...values, userType: e.target.value })} className="custom-select" id="userType" name="userType" required defaultValue="">
                                                <option value="" disabled>Please select</option>
                                                <option value="alumnus">Alumnus</option>
                                                <option value="admin">Admin</option>
                                                <option value="student">Student</option>
                                            </select>
                                        </div>
                                        {values.userType === "alumnus" &&
                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="course_id" className="control-label">Course</label>
                                                    <select onChange={(e) => setValues({ ...values, course_id: e.target.value })} className="form-control select2" name="course_id" required value={values.course_id}>
                                                        <option disabled value="">Select course</option>
                                                        {courses.map(c => (
                                                            <option key={c._id || c.id} value={c._id || c.id}>{c.course}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="gender" className="control-label">Gender</label>
                                                    <select onChange={(e) => setValues({ ...values, gender: e.target.value })} className="form-control" name="gender" required value={values.gender}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="batch" className="control-label">Batch Year</label>
                                                    <input type="number" className="form-control" name="batch" value={values.batch} onChange={(e) => setValues({ ...values, batch: e.target.value })} required />
                                                </div>
                                            </div>
                                        }
                                        {values.userType === "student" &&
                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="course_id" className="control-label">Course</label>
                                                    <select onChange={(e) => setValues({ ...values, course_id: e.target.value })} className="form-control select2" name="course_id" required value={values.course_id}>
                                                        <option disabled value="">Select course</option>
                                                        {courses.map(c => (
                                                            <option key={c._id || c.id} value={c._id || c.id}>{c.course}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="gender" className="control-label">Gender</label>
                                                    <select onChange={(e) => setValues({ ...values, gender: e.target.value })} className="form-control" name="gender" required value={values.gender}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className='flex items-center gap-4 w-full'>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="enrollment_year" className="control-label">Enrollment Year</label>
                                                        <input type="number" className="form-control" name="enrollment_year" value={values.enrollment_year} onChange={(e) => setValues({ ...values, enrollment_year: parseInt(e.target.value) })} required />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label htmlFor="current_year" className="control-label">Current Year</label>
                                                        <select className="form-control" name="current_year" value={values.current_year} onChange={(e) => setValues({ ...values, current_year: parseInt(e.target.value) })} required>
                                                            <option value={1}>1st Year</option>
                                                            <option value={2}>2nd Year</option>
                                                            <option value={3}>3rd Year</option>
                                                            <option value={4}>4th Year</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="roll_number" className="control-label">Roll Number (Optional)</label>
                                                    <input type="text" className="form-control" name="roll_number" value={values.roll_number} onChange={(e) => setValues({ ...values, roll_number: e.target.value })} />
                                                </div>
                                            </div>
                                        }
                                        <hr className="divider" />
                                        <div className="row justify-content-center">
                                            <div className="col-md-6 text-center">
                                                <button type="submit" className="btn btn-info btn-block">Create Account</button>
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
    )
}

export default Signup

