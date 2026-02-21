import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaComments } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../AuthContext';
import { baseUrl } from '../../utils/globalurl';

const ViewTopic = () => {
    const { isLoggedIn, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [topic, setTopic] = useState(null);
    const [comments, setComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (location.state && location.state.action === "view") {
            setTopic(location.state.data);
        }
    }, [location.state]);

    useEffect(() => {
        if (topic) {
            const topicId = topic._id || topic.id;
            axios.get(`${baseUrl}/forums/${topicId}/comments`, { withCredentials: true })
                .then(response => {
                    setComments(response.data);
                    console.log(response.data);
                })
                .catch(err => console.log(err));
        }
    }, [topic]);

    const handleEdit = (id, comment) => {
        setEditingCommentId(id);
        setNewComment(comment);
    };

    const handleSave = async (id) => {
        try {
            const response = await axios.put(`${baseUrl}/forums/comments/${id}`, {
                comment: newComment
            }, { withCredentials: true });
            toast.success("Comment updated successfully");
            setComments(prevComments => {
                return prevComments.map(comment => {
                    if ((comment._id || comment.id) === id) {
                        return { ...comment, comment: newComment };
                    }
                    return comment;
                });
            });
            setEditingCommentId(null);
            setNewComment('');
        } catch (error) {
            console.error('Error:', error);
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/forums/comments/${id}`, { withCredentials: true });
            toast.success("Comment Deleted Successfully");
            setComments(comments.filter(c => (c._id || c.id) !== id));
        } catch (error) {
            console.error('Error:', error);
            toast.error("An error occurred");
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        const userid = localStorage.getItem("user_id");
        const username = localStorage.getItem("user_name");
        const topicId = topic._id || topic.id;
        try {
            const response = await axios.post(`${baseUrl}/forums/${topicId}/comments`, {
                comment: newComment,
                user_id: userid,
                topic_id: topicId
            }, { withCredentials: true });
            toast.success("Comment Added Successfully");
            console.log(response);
            const newCom = { 
                _id: response.data._id || response.data.id, 
                comment: newComment, 
                name: username, 
                user_id: userid, 
                topic_id: topicId, 
                user: { name: username } 
            };
            setComments([...comments, newCom]);
            setNewComment('');
            document.getElementById("newc").innerText = "";
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred');
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            {topic && (<h3 className="text-white">
                                {topic.title}
                            </h3>)}
                            <hr className="divider text-center  my-4" />
                            {topic && (<div className="row col-md-12 mb-2 justify-content-center">
                                <span className="badge badge-primary px-3 pt-1 pb-1">
                                    <b><i>Topic Created by: {topic.user?.name || 'Unknown'}</i></b>
                                </span>
                            </div>)}
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mt-3 pt-2">
                {topic && (
                    <div className="card mb-4">
                        <div dangerouslySetInnerHTML={{ __html: topic.description }} className="card-body">
                        </div>
                            <hr className="divider" />
                    </div>
                )}

                <div className="card mb-4">
                    <div className="card-body">
                        <div className="col-lg-12">
                            <div className="row">
                                <h3><b><FaComments />{comments.length} Comments</b></h3>
                            </div>
                            <hr className="divider" style={{ maxWidth: '100%' }} />
                            {comments.map((c, index) => {
                                const commentId = c._id || c.id;
                                return (
                                <div className="form-group comment" key={index}>
                                    {editingCommentId === commentId ? (
                                        <textarea
                                            className="form-control"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows="3"
                                        />
                                    ) : (
                                        <>
                                            {isLoggedIn && (c.user_id == localStorage.getItem("user_id") || isAdmin) && (
                                                <div className="dropdown float-right">
                                                    <button
                                                        className="btn btn-info  dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    ></button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <a
                                                                className="dropdown-item link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                                                                onClick={() => handleEdit(commentId, c.comment)}
                                                            >
                                                                Edit
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <hr className="dropdown-divider" />
                                                        </li>
                                                        <li>
                                                            <a
                                                                onClick={() => handleDelete(commentId)}
                                                                className="dropdown-item link-danger link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
                                                            >
                                                                Delete
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}

                                            <p className="mb-0">
                                                <strong>
                                                    {c.user?.name}
                                                </strong>
                                            </p>
                                            {/* <br /> */}
                                            {c.comment}
                                            <hr />
                                        </>
                                    )}
                                    {editingCommentId === commentId && (<>
                                        <button
                                            className="btn btn-primary mr-2 mt-2 "
                                            onClick={() => handleSave(commentId)}
                                        >
                                            Update
                                        </button>
                                        <button className="btn btn-danger mt-2 " onClick={() => {
                                            setEditingCommentId(null);
                                            setNewComment('');
                                        }} >Cancel</button>
                                    </> )}
                                </div>
                            )})}
                        </div>
                        {comments.length == 0 ? "" : (<hr className="divider" style={{ maxWidth: '100%' }} />)}
                        {isLoggedIn ? <div className="col-lg-12">
                            {editingCommentId ? "" : (<form onSubmit={handleCommentSubmit}>
                                <div className="form-group">
                                    <textarea
                                        className="form-control"
                                        id='newc'
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="3"
                                        placeholder="New Comment"
                                    ></textarea>
                                </div>
                                <button className="btn btn-primary">Save Comment</button>
                            </form>)}
                        </div> : (
                            <div className="text-center">
                                <span className="text-danger ">Please Login to add your Comment.</span>
                                <br />
                                <button className="btn btn-primary mt-2" onClick={() => navigate("/login")}>Login</button>
                            </div>)}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewTopic;
