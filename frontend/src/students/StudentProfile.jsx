import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import { FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: null,
    student_bio: {
      gender: '',
      enrollment_year: '',
      current_year: '',
      roll_number: '',
      course: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/student/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email,
        password: '',
        student_bio: {
          gender: res.data.student_bio?.gender || '',
          enrollment_year: res.data.student_bio?.enrollment_year || '',
          current_year: res.data.student_bio?.current_year || '',
          roll_number: res.data.student_bio?.roll_number || '',
          course: res.data.student_bio?.course?._id || res.data.student_bio?.course || ''
        }
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('student_bio.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        student_bio: {
          ...prev.student_bio,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('student_bio', JSON.stringify(formData.student_bio));
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }

      const res = await axios.put(`${studentUrl}/profile`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form data to current profile
    setFormData({
      name: profile.name,
      email: profile.email,
      password: '',
      avatar: null,
      student_bio: {
        gender: profile.student_bio?.gender || '',
        enrollment_year: profile.student_bio?.enrollment_year || '',
        current_year: profile.student_bio?.current_year || '',
        roll_number: profile.student_bio?.roll_number || '',
        course: profile.student_bio?.course?._id || profile.student_bio?.course || ''
      }
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              <FaUser className="me-2" />
              My Profile
            </h3>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn btn-primary">
                <FaEdit className="me-1" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-body">
              {!editMode ? (
                // View Mode
                <div>
                  <div className="row mb-4 align-items-center">
                    <div className="col-12 text-center mb-3">
                      {profile?.student_bio?.avatar ? (
                        <img
                          src={profile.student_bio.avatar}
                          alt="Profile Avatar"
                          className="rounded-circle img-thumbnail"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto text-white"
                          style={{ width: '150px', height: '150px', fontSize: '64px' }}
                        >
                          <FaUser />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Name:</strong></div>
                    <div className="col-md-8">{profile?.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Email:</strong></div>
                    <div className="col-md-8">{profile?.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Roll Number:</strong></div>
                    <div className="col-md-8">{profile?.student_bio?.roll_number}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Gender:</strong></div>
                    <div className="col-md-8 text-capitalize">{profile?.student_bio?.gender}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Enrollment Year:</strong></div>
                    <div className="col-md-8">{profile?.student_bio?.enrollment_year}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Current Year:</strong></div>
                    <div className="col-md-8">{profile?.student_bio?.current_year || 'Not Set'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Course:</strong></div>
                    <div className="col-md-8">{profile?.student_bio?.course?.course || 'Not Set'}</div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Profile Avatar</label>
                    <input
                      type="file"
                      name="avatar"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      name="student_bio.roll_number"
                      className="form-control"
                      value={formData.student_bio.roll_number}
                      onChange={handleChange}
                      disabled
                    />
                    <small className="text-muted">Roll number cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      name="student_bio.gender"
                      className="form-control"
                      value={formData.student_bio.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Current Year</label>
                    <select
                      name="student_bio.current_year"
                      className="form-control"
                      value={formData.student_bio.current_year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      <FaSave className="me-1" /> Save Changes
                    </button>
                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                      <FaTimes className="me-1" /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
