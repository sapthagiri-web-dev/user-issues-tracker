import React from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';
import { useLanguage } from '../context/LanguageContext';
import { localizeLocation } from '../data/villagesData';

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
	location,
	status = 'Open',
	dateReported,
	isExpanded,
	onToggle
}) => {
	const { t, language } = useLanguage();

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
		<div
			className={`glass-panel issue-card ${isExpanded ? 'expanded' : ''}`}
			onClick={onToggle}
			data-status={status}
			style={{ cursor: 'pointer' }} // Visual cue
		>
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
					{status !== 'Resolved' && (
						<span className="pending-badge" title="Days since reported">
							⏱ {daysPending} {t('daysAgo')}
						</span>
					)}
				</div>
				{location && (
					<div
						style={{
							marginTop: '0.75rem',
							display: 'inline-flex',
							alignItems: 'center',
							gap: '0.35rem',
							background: 'white',
							border: '1px solid #e5e7eb',
							color: '#374151',
							padding: '0.25rem 0.75rem',
							borderRadius: '9999px',
							fontSize: '0.85rem',
							fontWeight: '500',
							width: 'fit-content',
							boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
						}}
					>
						<span style={{ fontSize: '1rem', lineHeight: 1 }}>📍</span>
						<span>{localizeLocation(location, language) || t('unknown')}</span>
					</div>
				)}
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

				{/* Mobile Toggle Button */}
				<button
					className="mobile-expand-btn"
					onClick={(e) => {
						e.stopPropagation();
						onToggle();
					}}
					aria-label={isExpanded ? 'Collapse' : 'Expand'}
				>
					{isExpanded ? '▲' : '▼'}
				</button>
			</div>

			<div className="card-content-wrapper">
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

				<div className="card-footer" onClick={(e) => e.stopPropagation()}>
					<Link
						to={`/issue/${id}`}
						className="action-btn"
						style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
					>
						{t('viewDetails')}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default IssueCard;
