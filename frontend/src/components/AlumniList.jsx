import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaFilter,
} from "react-icons/fa";
import defaultavatar from "../assets/uploads/defaultavatar.jpg";
import { baseUrl } from "../utils/globalurl";

const AlumniList = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get(`${baseUrl}/alumni`)
      .then((res) => setAlumniList(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const filteredAlumni = useMemo(() => {
    if (!searchQuery) return alumniList;

    return alumniList.filter(
      (list) =>
        list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.alumnus_bio?.course?.course
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        list.alumnus_bio?.batch?.toString().includes(searchQuery),
    );
  }, [searchQuery, alumniList]);

  const totalAlumni = alumniList.length;
  const verifiedCount = alumniList.filter(
    (a) => a.alumnus_bio?.status === 1,
  ).length;
  const unverifiedCount = alumniList.filter(
    (a) => a.alumnus_bio?.status === 0,
  ).length;
  const resultCount = filteredAlumni.length;

  return (
    <>
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
            <form onSubmit={handleSearch}>
              <div className="row justify-content-center align-items-center">
                <div className="col-lg-7 col-md-8">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, course, or batch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-primary px-4" type="submit">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ================= ALUMNI GRID ================= */}
        <div className="container">
          {filteredAlumni.length > 0 ? (
            <div className="row justify-content-center g-5">
              {filteredAlumni.slice(0, 8).map((a, index) => (
                <div
                  className="col-12 col-sm-6 col-md-6 col-lg-3 d-flex justify-content-center"
                  key={index}
                >
                  <div className="card alumni-card border-0 shadow-sm">
                    <div className="text-center pt-4">
                      <img
                        src={
                          a.alumnus_bio?.avatar
                            ? `${baseUrl}/${a.alumnus_bio.avatar}`
                            : defaultavatar
                        }
                        alt="avatar"
                        className="alumni-avatar"
                      />
                    </div>

                    <div className="card-body text-center">
                      <h6 className="fw-semibold mb-2">{a.name}</h6>

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
                          <strong>Email:</strong> {a.email}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h5>No alumni found</h5>
            </div>
          )}
        </div>
      </div>

      {/* ================= STYLING ================= */}
      <style jsx>{`
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
          background:
            linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)),
            url("/your-background-image.jpg");
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
      `}</style>
    </>
  );
};

export default AlumniList;
