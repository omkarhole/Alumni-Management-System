import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaFilter,
  FaThumbsUp,
} from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import defaultavatar from "../assets/uploads/defaultavatar.jpg";
import { baseUrl, toPublicUrl, skillsUrl } from "../utils/globalurl";
import SmartSearchBar from "./SmartSearchBar";
import SmartFilterDropdown from "./SmartFilterDropdown";
import { useAuth } from "../AuthContext";

const AlumniList = () => {
  const { isLoggedIn } = useAuth();
  const [alumniList, setAlumniList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [skillFilter, setSkillFilter] = useState("all");
  const [skillEndorsements, setSkillEndorsements] = useState({});
  const [endorsingUser, setEndorsingUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);

    axios
      .get(`${baseUrl}/alumni`)
      .then((res) => {
        const safeAlumni = Array.isArray(res.data)
          ? res.data.filter((item) => item && typeof item === "object")
          : [];
        setAlumniList(safeAlumni);
        
        const alumniIds = safeAlumni.map(a => a._id);
        if (alumniIds.length > 0) {
          fetchEndorsementsForAlumni(alumniIds);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchEndorsementsForAlumni = async (alumniIds) => {
    try {
      const endorsementMap = {};
      await Promise.all(
        alumniIds.map(async (userId) => {
          try {
            const response = await axios.get(`${skillsUrl}/endorsements/${userId}`);
            endorsementMap[userId] = response.data;
          } catch (err) {
            endorsementMap[userId] = [];
          }
        })
      );
      setSkillEndorsements(endorsementMap);
    } catch (err) {
      console.log(err);
    }
  };

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set();
    alumniList.forEach((list) => {
      const course = (list?.alumnus_bio?.course?.course || "").trim();
      if (course) uniqueCourses.add(course);
    });
    return Array.from(uniqueCourses).sort((a, b) => a.localeCompare(b));
  }, [alumniList]);

  const skillOptions = useMemo(() => {
    const uniqueSkills = new Set();
    alumniList.forEach((list) => {
      const skills = list?.alumnus_bio?.skills || [];
      skills.forEach(skill => {
        if (skill) uniqueSkills.add(skill);
      });
    });
    return Array.from(uniqueSkills).sort((a, b) => a.localeCompare(b));
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let results = alumniList.filter((list) => {
      if (!query) return true;
      return (
        list?.name?.toLowerCase().includes(query) ||
        list?.email?.toLowerCase().includes(query) ||
        list?.alumnus_bio?.course?.course?.toLowerCase().includes(query) ||
        list?.alumnus_bio?.batch?.toString().includes(query) ||
        list?.alumnus_bio?.connected_to?.toLowerCase().includes(query)
      );
    });

    if (statusFilter === "verified") {
      results = results.filter((list) => list?.alumnus_bio?.status === 1);
    } else if (statusFilter === "unverified") {
      results = results.filter((list) => list?.alumnus_bio?.status === 0);
    }

    if (courseFilter !== "all") {
      results = results.filter(
        (list) => (list?.alumnus_bio?.course?.course || "").trim() === courseFilter,
      );
    }

    if (skillFilter !== "all") {
      results = results.filter((list) => {
        const skills = list?.alumnus_bio?.skills || [];
        return skills.some(s => s.toLowerCase() === skillFilter.toLowerCase());
      });
    }

    if (sortBy === "name-desc") {
      results = [...results].sort((a, b) =>
        (b?.name || "").localeCompare(a?.name || ""),
      );
    } else if (sortBy === "batch-desc") {
      results = [...results].sort(
        (a, b) => Number(b?.alumnus_bio?.batch || 0) - Number(a?.alumnus_bio?.batch || 0),
      );
    } else if (sortBy === "batch-asc") {
      results = [...results].sort(
        (a, b) => Number(a?.alumnus_bio?.batch || 0) - Number(b?.alumnus_bio?.batch || 0),
      );
    } else {
      results = [...results].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || ""),
      );
    }

    return results;
  }, [alumniList, courseFilter, searchQuery, sortBy, statusFilter, skillFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCourseFilter("all");
    setSkillFilter("all");
    setSortBy("name-asc");
  };

  const handleEndorse = async (userId, skill) => {
    if (!currentUserId) {
      toast.error("Please login to endorse");
      return;
    }
    if (userId === currentUserId) {
      toast.error("You cannot endorse yourself");
      return;
    }

    setEndorsingUser({ userId, skill });
    try {
      const response = await axios.post(
        `${skillsUrl}/endorse`,
        { endorseeId: userId, skill },
        { withCredentials: true }
      );
      toast.success(response.data.message || "Endorsed successfully!");
      fetchEndorsementsForAlumni(alumniList.map(a => a._id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to endorse");
    } finally {
      setEndorsingUser(null);
    }
  };

  const getSkillEndorsements = (userId) => {
    return skillEndorsements[userId] || [];
  };

  const totalAlumni = alumniList.length;
  const verifiedCount = alumniList.filter(
    (a) => a?.alumnus_bio?.status === 1,
  ).length;
  const unverifiedCount = alumniList.filter(
    (a) => a?.alumnus_bio?.status === 0,
  ).length;
  const resultCount = filteredAlumni.length;

  return (
    <>
      <ToastContainer position="top-center" />
      <header className="alumni-hero">
        <div className="container text-center hero-content">
          <h1 className="display-5 fw-bold mb-3">Alumni Directory</h1>

          <p className="lead mb-4">
            Connect with graduates, explore careers, and grow your professional
            network.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="#alumni-section" className="btn btn-primary btn-lg px-4">
              Explore Alumni
            </a>

            <button className="btn btn-outline-light btn-lg px-4">
              Join Network
            </button>
          </div>
        </div>
      </header>

      <div className="container my-5">
        {/* ================= 4 SUMMARY CARDS ================= */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card stat-card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <FaUsers size={28} className="text-primary mb-2" />
                <h6>Total Alumni</h6>
                <h4 className="fw-bold">{totalAlumni}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <FaUserCheck size={28} className="text-success mb-2" />
                <h6>Verified</h6>
                <h4 className="fw-bold">{verifiedCount}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <FaUserTimes size={28} className="text-danger mb-2" />
                <h6>Unverified</h6>
                <h4 className="fw-bold">{unverifiedCount}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <FaFilter size={28} className="text-warning mb-2" />
                <h6>Search Results</h6>
                <h4 className="fw-bold">{resultCount}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* ================= IMPROVED SEARCH BOX ================= */}
        <div className="card shadow-sm border-0 mb-5 search-wrapper">
          <div className="card-body">
            <SmartSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, course, batch, or workplace..."
              inputId="alumni-filter"
              buttonId="alumni-search"
              entityLabel="alumni"
              resultsCount={filteredAlumni.length}
              totalCount={alumniList.length}
            >
              <SmartFilterDropdown
                label="Course"
                value={courseFilter}
                onChange={setCourseFilter}
                options={[
                  { value: "all", label: "All" },
                  ...courseOptions.map((course) => ({ value: course, label: course })),
                ]}
              />
              <SmartFilterDropdown
                label="Skill"
                value={skillFilter}
                onChange={setSkillFilter}
                options={[
                  { value: "all", label: "All" },
                  ...skillOptions.map((skill) => ({ value: skill, label: skill })),
                ]}
              />
              <SmartFilterDropdown
                label="Sort"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "name-asc", label: "Name A-Z" },
                  { value: "name-desc", label: "Name Z-A" },
                  { value: "batch-desc", label: "Newest Batch" },
                  { value: "batch-asc", label: "Oldest Batch" },
                ]}
              />
              <div className="smart-chip-group" role="group" aria-label="Verification filter">
                {[
                  { label: "All", value: "all" },
                  { label: "Verified", value: "verified" },
                  { label: "Unverified", value: "unverified" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`smart-filter-chip ${statusFilter === option.value ? "active" : ""}`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm smart-filter-reset" onClick={resetFilters}>
                Reset
              </button>
            </SmartSearchBar>
          </div>
        </div>

        {/* ================= ALUMNI GRID ================= */}
        <div className="container">
          {filteredAlumni.length > 0 ? (
            <div className="row justify-content-center g-5">
              {filteredAlumni.slice(0, 8).map((a, index) => (
                <div
                  className="col-12 col-sm-6 col-md-6 col-lg-3 d-flex justify-content-center"
                  key={a._id || a.id || index}
                >
                  <div className="card alumni-card border-0 shadow-sm">
                    <div className="text-center pt-4">
                      <img
                        src={toPublicUrl(a.alumnus_bio?.avatar) || defaultavatar}
                        alt="avatar"
                        className="alumni-avatar"
                      />
                    </div>

                      <div className="card-body text-center">
                        <h6 className="fw-semibold mb-2">{a.name || "Unnamed Alumni"}</h6>

                        <span
                          className={`badge px-3 py-2 mb-3 ${
                            a.alumnus_bio?.status === 1
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {a.alumnus_bio?.status === 1
                            ? "Verified"
                            : "Unverified"}
                        </span>

                        <div className="text-start small mt-3">
                          <p>
                            <strong>Email:</strong> {a.email || "N/A"}
                          </p>
                          <p>
                            <strong>Course:</strong>{" "}
                            {a.alumnus_bio?.course?.course || "N/A"}
                          </p>
                          <p>
                            <strong>Batch:</strong>{" "}
                            {a.alumnus_bio?.batch || "N/A"}
                          </p>
                          <p className="mb-0">
                            <strong>Working:</strong>{" "}
                            {a.alumnus_bio?.connected_to || "N/A"}
                          </p>
                        </div>

                        {/* Skills Section with Endorsements */}
                        {(a.alumnus_bio?.skills || []).length > 0 && (
                          <div className="mt-3">
                            <div className="d-flex flex-wrap justify-content-center gap-1">
                              {(a.alumnus_bio?.skills || []).slice(0, 3).map((skill, skillIdx) => {
                                const endorsementData = endorsements.find(e => e.skill.toLowerCase() === skill.toLowerCase());
                                const endorsementCount = endorsementData?.count || 0;
                                return (
                                  <span 
                                    key={skillIdx} 
                                    className="badge bg-light text-dark skill-badge"
                                  >
                                    {skill}
                                    {endorsementCount > 0 && (
                                      <span className="endorsement-count">
                                        {endorsementCount}
                                      </span>
                                    )}
                                    {currentUserId && currentUserId !== a._id && (
                                      <button
                                        className="endorse-btn"
                                        onClick={() => handleEndorse(a._id, skill)}
                                        disabled={endorsingUser?.userId === a._id && endorsingUser?.skill === skill}
                                        title="Endorse this skill"
                                      >
                                        <FaThumbsUp />
                                      </button>
                                    )}
                                  </span>
                                );
                              })}
                              {(a.alumnus_bio?.skills || []).length > 3 && (
                                <span className="badge bg-secondary">
                                  +{(a.alumnus_bio?.skills || []).length - 3}
                                </span>
                              )}
                            </div>
                          </div>
)}
                      </div>
                    </div>
                  </div>
                ),
              )})
            </div>
          ) : (
            <div className="text-center py-5">
              <h5>No alumni found</h5>
            </div>
          )}
        </div>
      </div>

      {/* ================= STYLING ================= */}
      <style>{`
        .alumni-card {
          width: 100%;
          max-width: 280px;
          border-radius: 16px;
          transition: 0.25s ease;
          padding-bottom: 10px;
        }

        .alumni-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
        }

        .alumni-avatar {
          width: 95px;
          height: 95px;
          border-radius: 50%;
          object-fit: cover;
        }

        .alumni-card p {
          margin-bottom: 8px;
        }

        .stat-card {
          border-radius: 14px;
          transition: 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .search-wrapper {
          border-radius: 16px;
        }
        .alumni-hero {
          height: 60vh;
          min-height: 400px;
          background: linear-gradient(135deg, #0b2a47 0%, #174b7f 52%, #1f65a9 100%);
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .hero-content {
          max-width: 700px;
        }

        .alumni-hero h1 {
          letter-spacing: 1px;
        }
        .skill-badge {
          font-size: 0.7rem;
          padding: 4px 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .endorsement-count {
          background: #28a745;
          color: white;
          border-radius: 10px;
          padding: 1px 5px;
          font-size: 0.65rem;
          margin-left: 3px;
        }
        .endorse-btn {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          padding: 0 2px;
          font-size: 0.7rem;
          margin-left: 2px;
        }
        .endorse-btn:hover {
          color: #0056b3;
        }
        .endorse-btn:disabled {
          color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default AlumniList;
