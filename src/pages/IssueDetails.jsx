import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const IssueDetails = () => {
	const { id } = useParams();

	const [issue, setIssue] = useState(null);
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		fetchIssueDetails();
		fetchAttachments();
	}, [id]);

	async function fetchIssueDetails() {
		try {
			const { data, error } = await supabase
				.from('issues')
				.select('*')
				.eq('id', id)
				.single();

			if (error) throw error;
			setIssue(data);
		} catch (error) {
			console.error('Error fetching issue:', error);
		} finally {
			// We will keep loading true until both finish, or handle fine-grained
			// For simplicity, just letting this run separate
			setLoading(false);
		}
	}

	async function fetchAttachments() {
		try {
			const { data, error } = await supabase
				.from('attachments')
				.select('*')
				.eq('issue_id', id);
			if (error) throw error;
			setAttachments(data || []);
		} catch (error) {
			console.error('Error fetching attachments:', error);
		}
	}

	// File Upload Handling
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const fileExt = file.name.split('.').pop();
			const fileName = `${Date.now()}_${Math.random()
				.toString(36)
				.substring(7)}.${fileExt}`;
			const filePath = `${id}/${fileName}`; // Folder structure: IssueID/Filename

			// 1. Upload to Supabase Storage
			const { error: uploadError } = await supabase.storage
				.from('issue-attachments')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			// 2. Get Public URL (optional, if bucket is public)
			const {
				data: { publicUrl }
			} = supabase.storage.from('issue-attachments').getPublicUrl(filePath);

			// 3. Save metadata to DB
			const { data: dbData, error: dbError } = await supabase
				.from('attachments')
				.insert([
					{
						issue_id: id,
						file_name: file.name,
						file_size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
						file_url: publicUrl
					}
				])
				.select()
				.single();

			if (dbError) throw dbError;

			// 4. Update UI
			setAttachments((prev) => [...prev, dbData]);
		} catch (error) {
			alert('Error uploading file: ' + error.message);
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	if (loading)
		return <div className="container app-main">Loading details...</div>;

	if (!issue) {
		return (
			<div className="container app-main" style={{ textAlign: 'center' }}>
				<h2>Issue not found</h2>
				<Link
					to="/"
					className="primary-btn"
					style={{
						display: 'inline-block',
						marginTop: '1rem',
						textDecoration: 'none'
					}}
				>
					Back to Dashboard
				</Link>
			</div>
		);
	}

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

			<div
				className="glass-panel issue-details-container"
				style={{ padding: '2rem' }}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						marginBottom: '1.5rem',
						flexWrap: 'wrap',
						gap: '1rem'
					}}
				>
					<h1 style={{ fontSize: '2rem', flex: 1 }}>{issue.title}</h1>
					<span
						className="status-badge"
						data-status={issue.status}
						style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
					>
						{issue.status}
					</span>
				</div>

				<div className="details-layout">
					<div className="details-main">
						<section className="detail-section">
							<h3 className="section-title">Description</h3>
							<p className="section-content">
								{issue.description || 'No description provided.'}
							</p>
						</section>

						<section className="detail-section">
							<h3 className="section-title">Location</h3>
							<p className="section-content">{issue.location || 'Unknown'}</p>
						</section>

						<section className="detail-section">
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									marginBottom: '1rem'
								}}
							>
								<h3 className="section-title" style={{ marginBottom: 0 }}>
									Documents / Dakhale
								</h3>
								<label className="upload-btn">
									+ Add Document
									<input
										type="file"
										onChange={handleFileUpload}
										style={{ display: 'none' }}
									/>
								</label>
							</div>

							<div className="attachments-list">
								{attachments.length === 0 && (
									<div className="empty-state">No documents attached yet.</div>
								)}
								{attachments.map((file) => (
									<div key={file.id} className="attachment-item">
										<div className="file-icon">📄</div>
										<div className="file-info">
											<div className="file-name">{file.file_name}</div>
											<div className="file-size">{file.file_size}</div>
										</div>
										{file.file_url && (
											<a
												href={file.file_url}
												target="_blank"
												rel="noreferrer"
												className="download-btn"
												title="Download"
											>
												⬇
											</a>
										)}
									</div>
								))}
								{isUploading && (
									<div className="attachment-item uploading">
										<span className="spinner"></span> Uploading...
									</div>
								)}
							</div>
						</section>
					</div>

					<div className="details-sidebar">
						<div className="sidebar-group">
							<label className="label">Date Reported</label>
							<div className="value">
								{issue.date_reported || issue.created_at?.slice(0, 10)}
							</div>
						</div>
						<div className="sidebar-group">
							<label className="label">Resident Affected</label>
							<div className="user-card">
								<div className="avatar avatar-affected">
									{(issue.affected_user || '?').charAt(0)}
								</div>
								<span className="name">{issue.affected_user || 'Unknown'}</span>
							</div>
						</div>
						<div className="sidebar-group">
							<label className="label">Reported By</label>
							<div className="user-card">
								<div className="avatar avatar-creator">
									{(issue.creator || '?').charAt(0)}
								</div>
								<span className="name">{issue.creator || 'Unknown'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IssueDetails;
