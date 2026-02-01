import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ReportIssue.css';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
	MAGADI_VILLAGES,
	MAGADI_HOBLIS,
	formatLocation,
	extractVillageName,
	extractHobliName,
	getVillageName,
	getHobliName
} from '../data/villagesData';

const ReportIssue = () => {
	const navigate = useNavigate();
	const { t, language } = useLanguage();
	const { session, loading: authLoading } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		location: '',
		affected_user: '', // Resident Name
		creator: '', // Reported By
		status: 'Open'
	});

	// Separate state for village and hobli selection
	const [selectedVillage, setSelectedVillage] = useState('');
	const [selectedHobli, setSelectedHobli] = useState('');

	useEffect(() => {
		if (!authLoading && !session) {
			navigate('/login');
		}
	}, [session, authLoading, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	// Handle village selection and format location
	const handleVillageChange = (e) => {
		const inputValue = e.target.value;
		setSelectedVillage(inputValue);

		// Find village in either language
		const villageMatch = MAGADI_VILLAGES.find(
			(v) => v.en.toLowerCase() === inputValue.toLowerCase() || v.kn === inputValue
		);

		if (villageMatch) {
			const displayVillage = getVillageName(villageMatch, language);

			// If we have a selected hobli, find its localized name
			let displayHobli = '';
			if (selectedHobli) {
				const hobliMatch = MAGADI_HOBLIS.find(
					(h) => h.en === selectedHobli || h.kn === selectedHobli
				);
				if (hobliMatch) {
					displayHobli = getHobliName(hobliMatch, language);
				}
			}

			setFormData({
				...formData,
				location: formatLocation(displayVillage, displayHobli, language)
			});
		} else {
			// Custom input or partial match - keep as is
			setFormData({
				...formData,
				location: inputValue
			});
		}
	};

	// Handle hobli selection and update location
	const handleHobliChange = (e) => {
		const inputValue = e.target.value;
		setSelectedHobli(inputValue);

		if (selectedVillage) {
			// Resolve Village Name (localized)
			const villageMatch = MAGADI_VILLAGES.find(
				(v) =>
					v.en.toLowerCase() === selectedVillage.toLowerCase() ||
					v.kn === selectedVillage
			);
			const displayVillage = villageMatch
				? getVillageName(villageMatch, language)
				: selectedVillage;

			// Resolve Hobli Name (localized)
			const hobliMatch = MAGADI_HOBLIS.find(
				(h) => h.en === inputValue || h.kn === inputValue
			);
			const displayHobli = hobliMatch
				? getHobliName(hobliMatch, language)
				: inputValue;

			setFormData({
				...formData,
				location: formatLocation(displayVillage, displayHobli, language)
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Basic validation
			if (!formData.title || !formData.affected_user) {
				throw new Error('Title and Resident Name are required.');
			}

			const { error: dbError } = await supabase.from('issues').insert([formData]);

			if (dbError) throw dbError;

			// Success!
			navigate('/');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (authLoading) return null; // Or a spinner

	return (
		<div className="container app-main">
			<Link
				to="/"
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '0.5rem',
					marginBottom: '2rem',
					color: 'hsl(var(--color-primary))',
					textDecoration: 'none'
				}}
			>
				← {t('backToDashboard')}
			</Link>

			<div className="glass-panel form-container">
				<h1 style={{ marginBottom: '1.5rem' }}>{t('reportNewIssue')}</h1>
				<p style={{ marginBottom: '2rem', color: 'hsl(var(--color-text-muted))' }}>
					{t('fillDetails')}
				</p>

				{error && <div className="error-banner">{error}</div>}

				<form onSubmit={handleSubmit} className="issue-form">
					<div className="form-group">
						<label htmlFor="title">{t('issueTitle')}</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder={t('issueTitle').replace('*', '')}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">{t('issueDesc')}</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows="4"
							placeholder={t('issueDesc')}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="location">{t('selectVillage')}</label>
						<input
							type="text"
							id="location"
							name="location"
							value={extractVillageName(formData.location) || formData.location}
							onChange={handleVillageChange}
							list="villages-list"
							placeholder={t('searchVillage')}
							required
							autoComplete="off"
						/>
						<datalist id="villages-list">
							{MAGADI_VILLAGES.map((village) => {
								const val = getVillageName(village, language);
								return <option key={village.en} value={val} />;
							})}
						</datalist>
						{formData.location && (
							<small
								style={{
									color: 'hsl(var(--color-text-muted))',
									marginTop: '0.5rem',
									display: 'block'
								}}
							>
								{formData.location}
							</small>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="hobli">{t('selectHobli')}</label>
						<select
							id="hobli"
							name="hobli"
							value={selectedHobli}
							onChange={handleHobliChange}
							required
							style={{
								width: '100%',
								padding: '0.75rem',
								borderRadius: 'var(--radius-sm)',
								border: '1px solid hsl(var(--color-primary) / 0.3)',
								fontSize: '1rem',
								background: 'hsl(var(--color-bg-secondary))',
								color: 'hsl(var(--color-text))'
							}}
						>
							<option value="">{t('selectHobli')}</option>
							{MAGADI_HOBLIS.map((hobli) => {
								const val = getHobliName(hobli, language);
								return (
									<option key={hobli.en} value={val}>
										{val}
									</option>
								);
							})}
						</select>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="affected_user">{t('residentName')}</label>
							<input
								type="text"
								id="affected_user"
								name="affected_user"
								value={formData.affected_user}
								onChange={handleChange}
								placeholder={t('residentName').replace('*', '')}
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="creator">{t('reporterName')}</label>
							<input
								type="text"
								id="creator"
								name="creator"
								value={formData.creator}
								onChange={handleChange}
								placeholder={t('reporterName').replace('*', '')}
								required
							/>
						</div>
					</div>

					<button
						type="submit"
						className="primary-btn submit-btn"
						disabled={loading}
					>
						{loading ? t('submitting') : t('submitReport')}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ReportIssue;
