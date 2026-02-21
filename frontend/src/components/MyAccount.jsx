import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';
import { useAuth } from '../AuthContext';
const MyAccount = () => {
    const { isAlumnus } = useAuth();
    const [acc, setAcc] = useState({
        name: '',
        connected_to: "",
        course_id: "",
        email: "",
        gender: "",
        password: "",
        batch: "",
    });
    const [file, setFile] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const alumnus_id = localStorage.getItem("alumnus_id");
        const fetchData = async () => {
            try {
                const [alumnusDetailsRes, coursesRes] = await Promise.all([
                    axios.get(`${baseUrl}/alumni/${alumnus_id}`, { withCredentials: true }),
                    axios.get(`${baseUrl}/courses`)
                ]);

                if (alumnusDetailsRes.data) {
                    const data = alumnusDetailsRes.data;
                    // Map nested structure to flat form state
                    setAcc({
                        name: data.name || '',
                        email: data.email || '',
                        gender: data.alumnus_bio?.gender || '',
                        batch: data.alumnus_bio?.batch || '',
                        course_id: data.alumnus_bio?.course?._id || data.alumnus_bio?.course || '',
                        connected_to: data.alumnus_bio?.connected_to || '',
                        password: ''
                    });
                }
                if (coursesRes.data) setCourses(coursesRes.data);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error("Failed to load account data");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setAcc({ ...acc, [e.target.name]: e.target.value });
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const alumnus_id = localStorage.getItem("alumnus_id");
        const user_id = localStorage.getItem("user_id");
        const pswrd = document.getElementById("pswrd")?.value || "";

        try {
            const formData = new FormData();
            if (file) formData.append('avatar', file);
            formData.append('name', acc.name);
            formData.append('connected_to', acc.connected_to);
            formData.append('course_id', acc.course_id);
            formData.append('email', acc.email);
            formData.append('gender', acc.gender);
            formData.append('password', pswrd);
            formData.append('batch', acc.batch);
            formData.append('alumnus_id', alumnus_id);
            formData.append('user_id', user_id);

            const response = await axios.put(`${baseUrl}/alumni/account`, formData, { withCredentials: true });
            toast.success(response.data.message);
            setFile(null);
        } catch (error) {
            toast.error('An error occurred while updating account');
            console.error('Error:', error);
        }
    };

    return (
        <>
<header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Manage Account</h3>
                            <FaStar className='text-white ' />
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>
            <section className="page-section bg-dark text-white mb-0" id="about">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <form onSubmit={handleSubmit} className="form-horizontal">
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Name</label>
                                    <div className="col-sm-10">
                                        <input 
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            placeholder="Enter your name"
                                            required
                                            value={acc?.name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Gender</label>
                                    <div className="col-sm-4">
                                        <select
                                            className="form-control"
                                            name="gender"
                                            required
                                            value={acc?.gender || ''}
                                            onChange={handleChange}
                                        >
                                            <option disabled value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                    <label className="col-sm-2 col-form-label">Batch</label>
                    <div className="col-sm-4">
                        <input
                            type="number"
                            className="form-control"
                            name="batch"
                            required
                            value={acc?.batch || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Course Graduated</label>
                                    <div className="col-sm-10">
                                        <select
                                            className="form-control select2"
                                            name="course_id"
                                            required
                                            value={acc?.course_id || ''}
                                            onChange={handleChange}
                                        >
                                            <option disabled value="">Select course</option>
                                            {courses.map(c => (
                                                <option key={c._id || c.id} value={c._id || c.id}>{c.course}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Currently Connected To</label>
                                    <div className="col-sm-10">
                                        <textarea
                                            name="connected_to"
                                            className="form-control"
                                            rows="3"
                                            placeholder="Enter your current connection"
                                            value={acc?.connected_to || ''}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>

                                { isAlumnus && <div className="form-group row">
                                    <label htmlFor="avatar" className="col-sm-2 col-form-label">Image</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            name="avatar"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>}

                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Email</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            required
                                            value={acc?.email || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label">Password</label>
                                    <div className="col-sm-10">
                                        <input
                                            id="pswrd"
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="Enter your password"
                                            onChange={handleChange}
                                        />
                                        <small className="form-text text-info fst-italic">
                                            Leave blank if you don't want to change your password
                                        </small>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="col-sm-12 text-center">
                                        <button type="submit" className="btn btn-secondary">Update Account</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default MyAccount;

