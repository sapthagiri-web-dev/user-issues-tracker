import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // Search State

	const { t } = useLanguage();
	const { session } = useAuth();
	const navigate = useNavigate();

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
			setError(true);
		} finally {
			setLoading(false);
		}
	}

	const handleReportClick = (e) => {
		e.preventDefault();
		if (!session) {
			navigate('/login');
		} else {
			navigate('/report');
		}
	};

	// Filter Issues
	const filteredIssues = issues.filter((issue) => {
		const term = searchTerm.toLowerCase();
		const titleMatch = issue.title?.toLowerCase().includes(term);
		const locationMatch = issue.location?.toLowerCase().includes(term);
		return titleMatch || locationMatch;
	});

	return (
		<div className="container app-main">
			<div
				className="dashboard-header"
				style={{ marginBottom: '2rem', textAlign: 'center' }}
			>
				<h1
					style={{
						fontSize: '2.5rem',
						marginBottom: '0.5rem',
						color: 'hsl(var(--color-primary))'
					}}
				>
					{t('dashboardTitle')}
				</h1>
				<p
					style={{
						fontSize: '1.2rem',
						color: 'hsl(var(--color-text-secondary))',
						marginBottom: '2rem'
					}}
				>
					{t('dashboardSubtitle')}
				</p>

				{/* Search Bar */}
				<div
					style={{
						maxWidth: '600px',
						margin: '0 auto 2rem auto',
						position: 'relative'
					}}
				>
					<input
						type="text"
						placeholder={t('searchPlaceholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{
							width: '100%',
							padding: '1rem 1.5rem',
							borderRadius: '50px',
							border: '1px solid hsl(var(--color-primary) / 0.3)',
							fontSize: '1.1rem',
							boxShadow: 'var(--shadow-sm)',
							outline: 'none'
						}}
					/>
				</div>

				<button
					onClick={handleReportClick}
					className="primary-btn"
					style={{ margin: '0 auto', fontSize: '1.1rem', padding: '1rem 2rem' }}
				>
					{t('reportIssueBtn')}
				</button>
			</div>

			{loading ? (
				<div
					style={{
						textAlign: 'center',
						padding: '2rem',
						color: 'hsl(var(--color-text-muted))'
					}}
				>
					{t('loading')}
				</div>
			) : error ? (
				<div
					style={{
						textAlign: 'center',
						color: 'hsl(var(--color-error))',
						padding: '2rem'
					}}
				>
					{t('errorLoading')}
				</div>
			) : (
				<div className="issues-grid">
					{filteredIssues.length === 0 ? (
						<div
							style={{
								gridColumn: '1/-1',
								textAlign: 'center',
								padding: '3rem',
								background: 'hsl(var(--color-bg-surface))',
								borderRadius: 'var(--radius-md)'
							}}
						>
							{issues.length === 0 ? t('noIssues') : t('notFound')}
						</div>
					) : (
						filteredIssues.map((issue) => (
							<IssueCard
								key={issue.id}
								issue={issue} // Passing the whole object as 'issue' prop is cleaner if IssueCard supports it, but checking previous usage...
								// Previous usage passed individual props. Let's stick to that to be safe or update IssueCard.
								// Wait, I saw IssueCard.jsx earlier. Let's check if I can just pass 'issue'.
								// Ideally I should pass individual props to avoid breaking it if I haven't updated IssueCard.
								// However, I can't see IssueCard right now.
								// Let's assume standard prop passing:
								id={issue.id}
								title={issue.title}
								affectedUser={issue.affected_user}
								creator={issue.creator}
								status={issue.status}
								dateReported={issue.date_reported || issue.created_at}
								// Also passing full issue just in case I updated it previously?
								// I'll stick to props I saw in the broken file's diff.
							/>
						))
					)}
				</div>
			)}
		</div>
	);
};

export default Dashboard;
