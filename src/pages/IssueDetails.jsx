import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ConfirmationModal from '../components/ConfirmationModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const IssueDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const { session } = useAuth();

	const [issue, setIssue] = useState(null);
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
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

		if (id) {
			fetchIssueDetails();
			fetchAttachments();
		}
	}, [id]);

	// File Upload Handling
	const handleFileUpload = async (e) => {
		// Optional: Also check session here if uploads should be restricted
		if (!session) {
			alert('Please login to upload documents');
			return;
		}

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

	const handleResolveClick = () => {
		setIsModalOpen(true);
	};

	const handleConfirmResolve = async () => {
		setIsModalOpen(false);
		setIsDeleting(true);
		try {
			// 1. List files in the issue's folder
			const { data: files, error: listError } = await supabase.storage
				.from('issue-attachments')
				.list(`${id}/`);

			if (listError)
				console.warn('Error listing files (might be empty):', listError);

			// 2. Delete files from storage if any exist
			if (files && files.length > 0) {
				const filesToRemove = files.map((x) => `${id}/${x.name}`);
				const { error: removeError } = await supabase.storage
					.from('issue-attachments')
					.remove(filesToRemove);

				if (removeError) throw removeError;
			}

			// 3. Delete Issue
			const { error: deleteError } = await supabase
				.from('issues')
				.delete()
				.eq('id', id);

			if (deleteError) throw deleteError;

			navigate('/');
		} catch (error) {
			alert('Error deleting issue: ' + error.message);
			console.error(error);
		} finally {
			setIsDeleting(false);
		}
	};

	// Status Translation Helper
	const getStatusLabel = (s) => {
		if (s === 'Open') return t('statusOpen');
		if (s === 'In Progress') return t('statusInProgress');
		if (s === 'Resolved') return t('statusResolved');
		return s;
	};

	if (loading) return <div className="container app-main">{t('loading')}</div>;

	if (!issue) {
		return (
			<div className="container app-main" style={{ textAlign: 'center' }}>
				<h2>{t('notFound')}</h2>
				<Link
					to="/"
					className="primary-btn"
					style={{
						display: 'inline-block',
						marginTop: '1rem',
						textDecoration: 'none'
					}}
				>
					{t('backToDashboard')}
				</Link>
			</div>
		);
	}

	return (
		<div className="container app-main">
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '2rem'
				}}
			>
				<Link
					to="/"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '0.5rem',
						color: 'hsl(var(--color-primary))',
						textDecoration: 'none'
					}}
				>
					← {t('backToDashboard')}
				</Link>

				{session && (
					<button
						onClick={handleResolveClick}
						disabled={isDeleting}
						style={{
							background: '#fee2e2',
							color: '#b91c1c',
							border: '1px solid #fca5a5',
							padding: '0.5rem 1rem',
							borderRadius: 'var(--radius-sm)',
							fontWeight: '600',
							cursor: 'pointer'
						}}
					>
						{isDeleting ? t('closing') : t('markResolved')}
					</button>
				)}
			</div>

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
						{getStatusLabel(issue.status)}
					</span>
				</div>

				<div className="details-layout">
					<div className="details-main">
						<section className="detail-section">
							<h3 className="section-title">{t('description')}</h3>
							<p className="section-content">
								{issue.description || 'No description provided.'}
							</p>
						</section>

						<section className="detail-section">
							<h3 className="section-title">{t('location')}</h3>
							<p className="section-content">{issue.location || t('unknown')}</p>
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
									{t('documents')}
								</h3>
								{session && (
									<label className="upload-btn">
										{t('addDocument')}
										<input
											type="file"
											onChange={handleFileUpload}
											style={{ display: 'none' }}
										/>
									</label>
								)}
							</div>

							<div className="attachments-list">
								{attachments.length === 0 && (
									<div className="empty-state">{t('noDocuments')}</div>
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
										<span className="spinner"></span> {t('uploading')}
									</div>
								)}
							</div>
						</section>
					</div>

					<div className="details-sidebar">
						<div className="sidebar-group">
							<label className="label">{t('dateReported')}</label>
							<div className="value">
								{issue.date_reported || issue.created_at?.slice(0, 10)}
							</div>
						</div>
						<div className="sidebar-group">
							<label className="label">{t('residentAffected')}</label>
							<div className="user-card">
								<div className="avatar avatar-affected">
									{(issue.affected_user || '?').charAt(0)}
								</div>
								<span className="name">{issue.affected_user || t('unknown')}</span>
							</div>
						</div>
						<div className="sidebar-group">
							<label className="label">{t('reportedBy')}</label>
							<div className="user-card">
								<div className="avatar avatar-creator">
									{(issue.creator || '?').charAt(0)}
								</div>
								<span className="name">{issue.creator || t('unknown')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ConfirmationModal
				isOpen={isModalOpen}
				title={t('modalTitle')}
				message={t('modalMessage')}
				confirmText={t('modalConfirm')}
				isDangerous={true}
				onConfirm={handleConfirmResolve}
				onCancel={() => setIsModalOpen(false)}
			/>
		</div>
	);
};

export default IssueDetails;
