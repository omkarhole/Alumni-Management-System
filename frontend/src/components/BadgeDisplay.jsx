import React from 'react';
import { FaMedal, FaAward } from 'react-icons/fa';

const BadgeDisplay = ({ badges = [], size = 'md', showName = true, maxDisplay = 10 }) => {
    const getSizeClass = () => {
        switch (size) {
            case 'sm':
                return 'badge-sm';
            case 'lg':
                return 'badge-lg';
            default:
                return 'badge-md';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return '1rem';
            case 'lg':
                return '2rem';
            default:
                return '1.5rem';
        }
    };

    if (!badges || badges.length === 0) {
        return null;
    }

    const displayBadges = badges.slice(0, maxDisplay);
    const remainingCount = badges.length - maxDisplay;

    return (
        <div className="badge-display">
            <div className="d-flex flex-wrap gap-2">
                {displayBadges.map((userBadge, index) => {
                    const badge = userBadge.badge || userBadge;
                    return (
                        <div
                            key={index}
                            className={`badge-item ${getSizeClass()}`}
                            style={{ cursor: 'pointer' }}
                            title={`${badge.name}: ${badge.description}`}
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                        >
                            <div
                                className="badge-icon-wrapper"
                                style={{
                                    backgroundColor: badge.color || '#6c757d',
                                    width: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '32px',
                                    height: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: getIconSize()
                                }}
                            >
                                {badge.icon ? (
                                    <i className={`fas ${badge.icon}`}></i>
                                ) : (
                                    <FaAward />
                                )}
                            </div>
                            {showName && (
                                <span className="badge-name ms-1">{badge.name}</span>
                            )}
                        </div>
                    );
                })}
                {remainingCount > 0 && (
                    <div
                        className="badge-more"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '32px',
                            height: size === 'sm' ? '24px' : size === 'lg' ? '48px' : '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e9ecef',
                            color: '#6c757d',
                            fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '1rem' : '0.8rem',
                            fontWeight: 'bold'
                        }}
                        title={`+${remainingCount} more badges`}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>
        </div>
    );
};

// Badge Card Component for displaying in lists
export const BadgeCard = ({ badge, onEdit, onDelete }) => {
    return (
        <div className="card badge-card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div
                        className="badge-icon me-3"
                        style={{
                            backgroundColor: badge.color || '#6c757d',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1.5rem'
                        }}
                    >
                        {badge.icon ? (
                            <i className={`fas ${badge.icon}`}></i>
                        ) : (
                            <FaAward />
                        )}
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-1">{badge.name}</h5>
                        <p className="text-muted mb-1 small">{badge.description}</p>
                        <div className="d-flex gap-2">
                            <span className="badge bg-secondary">{badge.category}</span>
                            <span className="badge bg-primary">{badge.points} points</span>
                        </div>
                    </div>
                    {(onEdit || onDelete) && (
                        <div className="ms-auto">
                            {onEdit && (
                                <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => onEdit(badge)}
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => onDelete(badge)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// User Badge Card with earned date
export const UserBadgeCard = ({ userBadge, onRemove }) => {
    const badge = userBadge.badge || {};
    const earnedAt = userBadge.earnedAt ? new Date(userBadge.earnedAt).toLocaleDateString() : '';

    return (
        <div className="card user-badge-card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div
                        className="badge-icon me-3"
                        style={{
                            backgroundColor: badge.color || '#6c757d',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '1.75rem'
                        }}
                    >
                        {badge.icon ? (
                            <i className={`fas ${badge.icon}`}></i>
                        ) : (
                            <FaAward />
                        )}
                    </div>
                    <div className="flex-grow-1">
                        <h5 className="mb-1">{badge.name}</h5>
                        <p className="text-muted mb-1 small">{badge.description}</p>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">{badge.points} points</span>
                            {earnedAt && (
                                <small className="text-muted">Earned: {earnedAt}</small>
                            )}
                        </div>
                    </div>
                    {onRemove && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onRemove(userBadge)}
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BadgeDisplay;
