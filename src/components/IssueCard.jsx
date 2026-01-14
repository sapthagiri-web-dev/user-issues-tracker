import React from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';
import { useLanguage } from '../context/LanguageContext';

const Avatar = ({ name, role }) => {
	const initials = name
		? name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: '?';

	return (
		<div className={`avatar avatar-${role}`} title={`${name} (${role})`}>
			{initials}
		</div>
	);
};

const IssueCard = ({
	id,
	title,
	affectedUser,
	creator,
	status = 'Open',
	dateReported
}) => {
	const { t } = useLanguage();

	// Calculate Days Pending

	const calculateDaysPending = (dateString) => {
		if (!dateString) return 0;
		const reported = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - reported);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const daysPending = calculateDaysPending(dateReported);
	const formattedDate = dateReported
		? new Date(dateReported).toLocaleDateString()
		: t('unknown');

	// Status Translation Helper
	const getStatusLabel = (s) => {
		if (s === 'Open') return t('statusOpen');
		if (s === 'In Progress') return t('statusInProgress');
		if (s === 'Resolved') return t('statusResolved');
		return s;
	};

	return (
		<div className="glass-panel issue-card">
			<div className="card-header">
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						width: '100%'
					}}
				>
					<div className="status-badge" data-status={status}>
						{getStatusLabel(status)}
					</div>
					{status === 'Open' && (
						<span className="pending-badge" title="Days since reported">
							⏱ {daysPending} {t('daysAgo')}
						</span>
					)}
				</div>
				<h3 className="issue-title" style={{ marginTop: '0.75rem' }}>
					{title}
				</h3>
				<div
					className="issue-date"
					style={{
						fontSize: '0.85rem',
						color: 'hsl(var(--color-text-muted))',
						marginTop: '0.25rem'
					}}
				>
					{t('reportedOn')}: {formattedDate}
				</div>
			</div>

			<div className="card-body">
				<div className="user-row">
					<span className="label">{t('residentLabel')}:</span>
					<div className="user-info">
						<Avatar name={affectedUser} role="affected" />
						<span className="user-name">{affectedUser || t('unknown')}</span>
					</div>
				</div>

				<div className="user-row">
					<span className="label">{t('officialLabel')}:</span>
					<div className="user-info">
						<Avatar name={creator} role="creator" />
						<span className="user-name">{creator || t('unknown')}</span>
					</div>
				</div>
			</div>

			<div className="card-footer">
				<Link
					to={`/issue/${id}`}
					className="action-btn"
					style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
				>
					{t('viewDetails')}
				</Link>
			</div>
		</div>
	);
};

export default IssueCard;
