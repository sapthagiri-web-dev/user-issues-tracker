import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ReportIssue.css';

const ReportIssue = () => {
	const navigate = useNavigate();
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

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
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
				← Back to Dashboard
			</Link>

			<div className="glass-panel form-container">
				<h1 style={{ marginBottom: '1.5rem' }}>Report New Issue</h1>
				<p style={{ marginBottom: '2rem', color: 'hsl(var(--color-text-muted))' }}>
					Fill in the details below to open a new ticket for the village.
				</p>

				{error && <div className="error-banner">{error}</div>}

				<form onSubmit={handleSubmit} className="issue-form">
					<div className="form-group">
						<label htmlFor="title">Issue Title *</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="e.g. Broken water pipe in Ward 2"
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">Description</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows="4"
							placeholder="Describe the problem in detail..."
						/>
					</div>

					<div className="form-group">
						<label htmlFor="location">Location</label>
						<input
							type="text"
							id="location"
							name="location"
							value={formData.location}
							onChange={handleChange}
							placeholder="e.g. Near Govt School"
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="affected_user">Resident / Grama Vasi *</label>
							<input
								type="text"
								id="affected_user"
								name="affected_user"
								value={formData.affected_user}
								onChange={handleChange}
								placeholder="Name of affected person"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="creator">Reported By (Official) *</label>
							<input
								type="text"
								id="creator"
								name="creator"
								value={formData.creator}
								onChange={handleChange}
								placeholder="Your name"
								required
							/>
						</div>
					</div>

					<button
						type="submit"
						className="primary-btn submit-btn"
						disabled={loading}
					>
						{loading ? 'Submitting...' : 'Submit Report'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ReportIssue;
