import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';
import defaultavatar from "../assets/uploads/defaultavatar.jpg"
import { baseUrl, toPublicUrl } from '../utils/globalurl';


const AdminAlumni = () => {
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/alumni`, { withCredentials: true })
      .then((res) => {
        const safeAlumni = Array.isArray(res.data)
          ? res.data.filter((item) => item && typeof item === 'object')
          : [];
        setAlumni(safeAlumni);
        // console.log(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const navigate = useNavigate();

  const delAlumni = (id) => {
    axios.delete(`${baseUrl}/alumni/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        setAlumni(alumni.filter((e) => e.id !== id))
      })
      .catch((err) => console.log(err))
  }


  return (
    <>
<div className="container-fluid">

        <div className="col-lg-12">
          <div className="row mb-4 mt-4">
            <div className="col-md-12">

            </div>
          </div>
          <div className="row">

            <div className="col-md-12 col-sm-8  ">
              <div className="card">
                <div className="card-header">
                  <b>List of Alumni ({alumni.length})</b>
                  {/* <span className="float:right"><Link className="btn btn-primary btn-block btn-sm col-sm-2 float-right" id="new_alumni">
                    <FaPlus /> New Entry
                  </Link></span> */}
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-responsive-sm table-condensed table-bordered table-hover">

                      {/* <colgroup>
								<col width="5%"/>
								<col width="10%"/>
								<col width="15%"/>
								<col width="15%"/>
								<col width="30%"/>
								<col width="15%"/>
							</colgroup> */}
                      <thead>
                        <tr >
                          <th className="text-center">#</th>
                          <th className="">Avatar</th>
                          <th className="">Name</th>
                          <th className="">Course Graduated</th>
                          <th className="">Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumni.length > 0 ? <>
                          {/* $alumni = $conn->query("SELECT a.*,c.course,Concat(a.lastname,', ',a.firstname,' ',a.middlename) as name from alumnus_bio a inner join courses c on c.id = a.course_id order by Concat(a.lastname,', ',a.firstname,' ',a.middlename) asc"); */}
                          {alumni.map((a, index) => (

                            <tr key={a._id || a.id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td className="text-center">
                                <div className="avatar">
                                  <img
                                    src={toPublicUrl(a.alumnus_bio?.avatar) || defaultavatar}
                                    className="gimg"
                                    alt="avatar"
                                  />
                                </div>
                              </td>
                              <td className="">
                                <p> <b>{a.name || 'N/A'}</b></p>
                              </td>
                              <td className="">
                                <p> <b>{a.alumnus_bio?.course?.course || a.alumnus_bio?.course?.name || 'N/A'}</b></p>
                              </td>
                              <td className="text-center">
                                {a.alumnus_bio?.status === 1 && <span className="badge badge-primary">Verified</span>}
                                {a.alumnus_bio?.status === 0 && <span className="badge badge-secondary">Not Verified</span>}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center">
                                  <button onClick={() => navigate("/dashboard/alumni/view", { state: { status: "view", data: a } })} className="btn btn-sm btn-outline-primary view_alumni" type="button" >View</button>
                                  <button onClick={() => delAlumni(a.id)} className="btn btn-sm btn-outline-danger delete_alumni ms-1" type="button" >Delete</button>
                                </div>
                              </td>
                            </tr>))}</> : <>
                          <tr>
                            <td colSpan={6} className="text-center">No Alumni Available</td>
                          </tr>
                        </>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default AdminAlumni

