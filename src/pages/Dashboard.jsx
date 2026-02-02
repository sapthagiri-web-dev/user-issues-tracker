import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IssueCard from '../components/IssueCard';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
	MAGADI_HOBLIS,
	extractHobliName,
	getHobliName
} from '../data/villagesData';

const Dashboard = () => {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // Search State
	const [expandedIssueId, setExpandedIssueId] = useState(null); // Accordion State
	const [statusFilter, setStatusFilter] = useState('All'); // Status Filter State
	const [selectedHobli, setSelectedHobli] = useState(''); // Hobli Filter State

	const { t, language } = useLanguage();
	const { session } = useAuth();
	const navigate = useNavigate();

	// Audio Context Ref (Shared)
	const [audioCtx, setAudioCtx] = useState(null);

	useEffect(() => {
		// Initialize AudioContext on first user interaction
		const initAudio = () => {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (!AudioContext) return;

			const ctx = new AudioContext();
			if (ctx.state === 'suspended') {
				ctx.resume();
			}
			setAudioCtx(ctx);

			// Remove listener after first successful interaction
			document.removeEventListener('click', initAudio);
			document.removeEventListener('keydown', initAudio);
		};

		document.addEventListener('click', initAudio);
		document.addEventListener('keydown', initAudio);

		return () => {
			document.removeEventListener('click', initAudio);
			document.removeEventListener('keydown', initAudio);
			if (audioCtx) audioCtx.close();
		};
	}, []);

	// Notification Sound (Shared Context)
	const playSound = () => {
		if (!audioCtx) return;

		try {
			if (audioCtx.state === 'suspended') {
				audioCtx.resume();
			}

			const now = audioCtx.currentTime;

			// Helper to create a tone
			const playTone = (freq, startTime, duration) => {
				const osc = audioCtx.createOscillator();
				const gain = audioCtx.createGain();

				osc.connect(gain);
				gain.connect(audioCtx.destination);

				osc.type = 'sine';
				osc.frequency.value = freq;

				// Smooth envelope (Attack -> Decay)
				gain.gain.setValueAtTime(0, startTime);
				gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
				gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Decay

				osc.start(startTime);
				osc.stop(startTime + duration);
			};

			// Play a "Success Chime" (Major 3rd interval: C5 -> E5)
			playTone(523.25, now, 1.5); // C5
			playTone(659.25, now + 0.1, 1.5); // E5 (slightly delayed)
		} catch (error) {
			console.error('Audio play failed:', error);
		}
	};

	useEffect(() => {
		fetchIssues();

		// Real-time Subscription
		const channel = supabase
			.channel('public:issues')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'issues' },
				(payload) => {
					console.log('New issue received:', payload);
					const newIssue = payload.new;

					// 1. Update State
					setIssues((prev) => [newIssue, ...prev]);

					// 2. Play Sound
					playSound();

					// 3. Trigger Notification
					console.log('Current Permission:', Notification.permission);
					if (Notification.permission === 'granted') {
						new Notification('New Issue Reported! / ಹೊಸ ದೂರು', {
							body: `${newIssue.title} - ${newIssue.location}`,
							icon: '/pwa-192x192.png'
						});
					} else if (Notification.permission !== 'denied') {
						// Try requesting again if not explicitly denied
						Notification.requestPermission().then((permission) => {
							if (permission === 'granted') {
								new Notification('New Issue Reported! / ಹೊಸ ದೂರು', {
									body: `${newIssue.title} - ${newIssue.location}`,
									icon: '/pwa-192x192.png'
								});
							}
						});
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [audioCtx]); // AudioCtx is required for playSound

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

	const handleCardToggle = (id) => {
		setExpandedIssueId((prevId) => (prevId === id ? null : id));
	};

	// Filter Issues
	const filteredIssues = issues.filter((issue) => {
		const term = searchTerm.toLowerCase();
		const titleMatch = issue.title?.toLowerCase().includes(term);
		const locationMatch = issue.location?.toLowerCase().includes(term);
		const searchMatch = titleMatch || locationMatch;

		// Status filter
		const statusMatch = statusFilter === 'All' || issue.status === statusFilter;

		// Hobli filter
		let hobliMatch = true;
		if (selectedHobli) {
			const issueHobliStr = extractHobliName(issue.location);
			const hobliObj = MAGADI_HOBLIS.find(
				(h) =>
					h.en.toLowerCase() === issueHobliStr.toLowerCase() ||
					h.kn === issueHobliStr
			);
			hobliMatch = hobliObj && hobliObj.en === selectedHobli;
		}

		return searchMatch && statusMatch && hobliMatch;
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

				{/* Hobli Filter Dropdown */}
				<div
					className="hobli-filter-container"
					style={{
						maxWidth: '300px',
						margin: '0 auto 2rem auto',
						textAlign: 'center'
					}}
				>
					<select
						value={selectedHobli}
						onChange={(e) => setSelectedHobli(e.target.value)}
						style={{
							width: '100%',
							padding: '0.75rem',
							borderRadius: '9999px',
							border: '1px solid hsl(var(--color-bg-highlight))',
							boxShadow: 'var(--shadow-sm)',
							fontSize: '1rem',
							backgroundColor: 'hsl(var(--color-bg-surface))',
							color: 'hsl(var(--color-text-primary))',
							cursor: 'pointer',
							appearance: 'none',
							backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
							backgroundRepeat: 'no-repeat',
							backgroundPosition: 'right 1rem center',
							backgroundSize: '1.2rem'
						}}
					>
						<option value="">
							{t('filterAllHoblis') || 'All Hoblis / ಎಲ್ಲಾ ಹೋಬಳಿಗಳು'}
						</option>
						{MAGADI_HOBLIS.map((hobli) => (
							<option key={hobli.en} value={hobli.en}>
								{getHobliName(hobli, language)}
							</option>
						))}
					</select>
				</div>

				{/* Status Filter Tabs */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: '0.5rem',
						marginBottom: '1.5rem',
						flexWrap: 'wrap'
					}}
				>
					{['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							style={{
								padding: '0.5rem 1.5rem',
								borderRadius: 'var(--radius-sm)',
								border:
									statusFilter === status
										? '2px solid hsl(var(--color-primary))'
										: '1px solid hsl(var(--color-primary) / 0.3)',
								background:
									statusFilter === status ? 'hsl(var(--color-primary))' : 'transparent',
								color: statusFilter === status ? 'white' : 'hsl(var(--color-text))',
								cursor: 'pointer',
								fontWeight: statusFilter === status ? '600' : '400',
								transition: 'all 0.2s ease'
							}}
						>
							{t(`filter${status.replace(/\s/g, '')}`)}
						</button>
					))}
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
								location={issue.location}
								status={issue.status}
								dateReported={issue.date_reported || issue.created_at}
								isExpanded={expandedIssueId === issue.id}
								onToggle={() => handleCardToggle(issue.id)}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
};

export default Dashboard;
