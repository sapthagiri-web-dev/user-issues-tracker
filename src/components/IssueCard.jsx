import React from 'react';
import './IssueCard.css';

const Avatar = ({ name, role }) => {
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className={`avatar avatar-${role}`} title={`${name} (${role})`}>
			{initials}
		</div>
	);
};

// Renamed props internally to context but mapped from passed props
const IssueCard = ({ title, affectedUser, creator, status = 'Open' }) => {
	return (
		<div className="glass-panel issue-card">
			<div className="card-header">
				<div className="status-badge" data-status={status}>
					{status}
				</div>
				<h3 className="issue-title">{title}</h3>
			</div>

			<div className="card-body">
				<div className="user-row">
					<span className="label">Resident / Grama Vasi:</span>
					<div className="user-info">
						<Avatar name={affectedUser} role="affected" />
						<span className="user-name">{affectedUser}</span>
					</div>
				</div>

				<div className="user-row">
					<span className="label">Official / Karyakarta:</span>
					<div className="user-info">
						<Avatar name={creator} role="creator" />
						<span className="user-name">{creator}</span>
					</div>
				</div>
			</div>

			<div className="card-footer">
				<button className="action-btn">View Details</button>
			</div>
		</div>
	);
};

export default IssueCard;
