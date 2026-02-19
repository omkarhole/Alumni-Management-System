import { useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

const Newsletter = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${baseUrl}/api/news/newsletter/subscribe`, { email });
            toast.success(response.data.message || 'Subscribed successfully!');
            setEmail('');
        } catch (error) {
            console.error('Error subscribing:', error);
            toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={`page-section newsletter-shell ${theme === 'light' ? 'newsletter-theme-light' : 'newsletter-theme-dark'}`} id="newsletter">
            <ToastContainer hideProgressBar="true" position="top-center" pauseOnHover="false" pauseOnFocusLoss="false" />
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center">
                        <div className="newsletter-section newsletter-card p-4 rounded shadow-sm">
                            <h3 className="text-white mb-3">
                                <FaEnvelope className="me-2" />
                                Subscribe to Our Newsletter
                            </h3>
                            <p className="text-white-75 mb-4">
                                Stay updated with the latest news, events, and achievements from our alumni community.
                            </p>
                            
                            <form onSubmit={handleSubmit} className="row g-3 justify-content-center">
                                <div className="col-md-8">
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white border-0">
                                            <FaEnvelope className="text-primary" />
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control border-0"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-light btn-lg w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <FaPaperPlane className="me-2" />
                                        )}
                                        Subscribe
                                    </button>
                                </div>
                            </form>
                            
                            <p className="text-white-50 mt-3 mb-0 small">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
