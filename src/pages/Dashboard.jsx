import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
// Import the initialized client
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
	const { t } = useLanguage();
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchIssues();
	}, []);

	async function fetchIssues() {
		try {
			setLoading(true);

			const { data, error } = await supabase
				.from('issues')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setIssues(data);
		} catch (error) {
			console.error('Error fetching issues:', error);
			setError(true); // Just set flag, allow render to handle translation
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container app-main">
			<div
				className="header-actions"
				style={{
					marginBottom: '2rem',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<div>
					<h2
						className="text-gradient"
						style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
					>
						{t('dashboardTitle')}
					</h2>
					<p style={{ color: 'hsl(var(--color-text-muted))' }}>
						{t('dashboardSubtitle')}
					</p>
				</div>
				<Link
					to="/report"
					className="primary-btn"
					style={{ textDecoration: 'none' }}
				>
					{t('reportIssueBtn')}
				</Link>
			</div>

			{loading && (
				<div
					style={{
						textAlign: 'center',
						padding: '2rem',
						color: 'hsl(var(--color-text-muted))'
					}}
				>
					{t('loading')}
				</div>
			)}

			{error && (
				<div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
					{t('errorLoading')}
				</div>
			)}

			{!loading && !error && issues.length === 0 && (
				<div className="empty-state">{t('noIssues')}</div>
			)}

			<div className="issues-grid">
				{issues.map((issue) => (
					<IssueCard
						key={issue.id}
						id={issue.id}
						title={issue.title}
						// Mapping DB columns to props (snake_case to camelCase likely needed if DB is snake_case)
						// Based on schema: affected_user, creator
						affectedUser={issue.affected_user}
						creator={issue.creator}
						status={issue.status}
						dateReported={issue.date_reported || issue.created_at}
					/>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
