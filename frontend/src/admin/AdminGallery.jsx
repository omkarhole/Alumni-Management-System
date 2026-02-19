import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl, toPublicUrl } from '../utils/globalurl';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [file, setFile] = useState(null);
  const [about, setAbout] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get(`${baseUrl}/gallery`, { withCredentials: true })
      .then((res) => {
        const safeGallery = Array.isArray(res.data)
          ? res.data.filter((item) => item && typeof item === 'object')
          : [];
        setGallery(safeGallery);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAboutChange = (event) => {
    setAbout(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please choose an image first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('about', about);

      const response = await axios.post(`${baseUrl}/gallery`, formData, {
        withCredentials: true
      });

      toast.success(response.data.message || 'Image uploaded successfully');
      setGallery((prev) => [response.data, ...prev]);
      setFile(null);
      setAbout('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/gallery/${id}`, { withCredentials: true });
      setGallery((prev) => prev.filter(item => (item._id || item.id) !== id));
      toast.success(response.data.message)
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const shortenAboutText = (text, maxLength) => {
    const safeText = text || '';
    if (safeText.length > maxLength) {
      return safeText.substring(0, maxLength) + '...';
    }
    return safeText;
  };

  const handleCancel = () => {
    setFile(null);
    setAbout('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <div className="row">
        <div className="col-lg-4 col-md-12">
          <form onSubmit={handleSubmit} id="manage-gallery">
            <div className="card">
              <div className="card-header">
                Upload
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="image" className="control-label">Image</label>
                  <input ref={fileInputRef} type="file" className="form-control" id="image" name="image" onChange={handleFileChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="about" className="control-label">Short Description</label>
                  <textarea className="form-control" id="about" name='about' value={about} onChange={handleAboutChange}></textarea>
                </div>
              </div>
              <div className="card-footer">
                <div className="row">
                  <div className="col-md-6">
                    <button type="submit" className="btn  btn-sm btn-primary btn-block">Save</button>
                  </div>
                  <div className="col-md-6">
                    <button className="btn  btn-sm btn-default btn-block" type="button" onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="col-lg-8 col-md-12">
          <div className="card">
            <div className="card-header">
              <b>Gallery List</b>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-center">Image</th>
                      <th className="text-center">About</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gallery && gallery.map((g, index) => (
                      <tr key={g._id || g.id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <img src={toPublicUrl(g.image_path)} className="gimg" alt="img" />
                        </td>
                        <td>
                          {shortenAboutText(g.about, 30)}
                        </td>
                        <td style={{ verticalAlign: "middle" }} className="text-center ">
                          <div className='d-flex  '>
                            {/* <button onClick={() => handleEdit(g.image_path, g.about, g.id)} className="btn btn-sm btn-primary mr-2 edit_gallery" type="button">Edit</button> */}
                            <button onClick={() => handleDelete(g._id || g.id)} className="btn btn-sm btn-danger delete_gallery" type="button">Delete</button>
                          </div></td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGallery;
