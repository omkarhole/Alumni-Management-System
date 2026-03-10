import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import '../styles/reunion-committee.css';

const ReunionCommittee = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [reunion, setReunion] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('committee');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('other');

  useEffect(() => {
    fetchReunionData();
  }, [id]);

  const fetchReunionData = async () => {
    try {
      setLoading(true);
      const [reunionRes, contributionsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/reunions/${id}`, {
          credentials: 'include'
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/reunions/${id}/contributions`, {
          credentials: 'include'
        })
      ]);

      if (!reunionRes.ok || !contributionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const reunionData = await reunionRes.json();
      const contributionsData = await contributionsRes.json();

      setReunion(reunionData);
      setContributions(contributionsData.contributions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load committee data');
    } finally {
      setLoading(false);
    }
  };

  const isCoordinator = reunion?.organizers?.some(
    org => org.user._id === user?.id && org.role === 'coordinator'
  );

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!newMemberEmail) {
      toast.error('Please enter email address');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/${id}/organizers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newMemberEmail,
            role: newMemberRole
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to add member');

      toast.success('Committee member added!');
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMember(false);
      fetchReunionData();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add committee member');
    }
  };

  const handleRemoveMember = async (organizerId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reunions/${id}/organizers/${organizerId}`,
          {
            method: 'DELETE',
            credentials: 'include'
          }
        );

        if (!response.ok) throw new Error('Failed to remove member');

        toast.success('Member removed');
        fetchReunionData();
      } catch (error) {
        console.error('Error removing member:', error);
        toast.error('Failed to remove member');
      }
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reunions/${id}/contributions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(contributionAmount),
            paymentMethod
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to add contribution');

      toast.success('Thank you for contributing!');
      setContributionAmount('');
      setPaymentMethod('other');
      setShowContributeForm(false);
      fetchReunionData();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  if (loading) return <div className="loading">Loading committee data...</div>;
  if (!reunion) return <div className="error">Reunion not found</div>;

  const budgetPercentage = reunion.budget?.total
    ? (reunion.budget?.collected / reunion.budget?.total) * 100
    : 0;

  return (
    <div className="reunion-committee-container">
      <h1>{reunion.title} - Committee & Budget</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'committee' ? 'active' : ''}`}
          onClick={() => setActiveTab('committee')}
        >
          👥 Committee
        </button>
        <button
          className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          💰 Budget & Contributions
        </button>
      </div>

      {activeTab === 'committee' && (
        <div className="committee-tab">
          <div className="committee-header">
            <h2>Reunion Committee</h2>
            {isCoordinator && (
              <button
                className="add-member-btn"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                {showAddMember ? '✕ Cancel' : '+ Add Member'}
              </button>
            )}
          </div>

          {showAddMember && (
            <form className="add-member-form" onSubmit={handleAddMember}>
              <input
                type="email"
                placeholder="Member email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="treasurer">Treasurer</option>
                <option value="coordinator">Coordinator</option>
              </select>
              <button type="submit">Add Member</button>
            </form>
          )}

          <div className="committee-grid">
            {reunion.organizers?.map((organizer) => (
              <div key={organizer._id} className="committee-card">
                {organizer.user?.avatar && (
                  <img
                    src={organizer.user.avatar}
                    alt={organizer.user?.name}
                    className="avatar"
                  />
                )}
                <h3>{organizer.user?.name}</h3>
                <p className="role">{organizer.role}</p>
                <p className="email">{organizer.user?.email}</p>

                {isCoordinator && organizer.user._id !== user?.id && (
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveMember(organizer._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="budget-tab">
          <div className="budget-summary">
            <h2>Budget Overview</h2>
            <div className="budget-stats">
              <div className="stat-card">
                <h3>Total Budget</h3>
                <p className="amount">₹{reunion.budget?.total || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Collected</h3>
                <p className="amount highlight">₹{reunion.budget?.collected || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Remaining</h3>
                <p className="amount">
                  ₹{(reunion.budget?.total || 0) - (reunion.budget?.collected || 0)}
                </p>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              <p className="progress-text">{budgetPercentage.toFixed(1)}% of target</p>
            </div>
          </div>

          <div className="contributions-section">
            <div className="contributions-header">
              <h2>Contributions</h2>
              <button
                className="contribute-btn"
                onClick={() => setShowContributeForm(!showContributeForm)}
              >
                {showContributeForm ? '✕ Cancel' : '💳 Add Contribution'}
              </button>
            </div>

            {showContributeForm && (
              <form className="contribute-form" onSubmit={handleContribute}>
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  step="0.01"
                  required
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
                <button type="submit">Contribute</button>
              </form>
            )}

            <div className="contributions-list">
              {contributions.length === 0 ? (
                <p className="empty-message">No contributions yet</p>
              ) : (
                contributions.map((contrib) => (
                  <div key={contrib._id} className="contribution-item">
                    <div className="contributor-info">
                      {contrib.contributor?.avatar && (
                        <img
                          src={contrib.contributor.avatar}
                          alt={contrib.contributor?.name}
                          className="avatar"
                        />
                      )}
                      <div className="info">
                        <h4>{contrib.contributor?.name}</h4>
                        <p className="date">
                          {new Date(contrib.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="contribution-amount">
                      <p className="amount">₹{contrib.amount}</p>
                      <p className={`status ${contrib.status}`}>{contrib.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReunionCommittee;
