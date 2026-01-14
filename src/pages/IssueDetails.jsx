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

	const [isDeletingIssue, setIsDeletingIssue] = useState(false);
	const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);

	// Modal State handling
	const [modalType, setModalType] = useState(null); // 'RESOLVE' or 'DELETE_ATTACHMENT'
	const [attachmentToDelete, setAttachmentToDelete] = useState(null);

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
			const filePath = `${id}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('issue-attachments')
				.upload(filePath, file);

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl }
			} = supabase.storage.from('issue-attachments').getPublicUrl(filePath);

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

			setAttachments((prev) => [...prev, dbData]);
		} catch (error) {
			alert('Error uploading file: ' + error.message);
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	// --- Deletion Handlers ---

	const initiateResolve = () => {
		setModalType('RESOLVE');
	};

	const initiateDeleteAttachment = (file) => {
		setAttachmentToDelete(file);
		setModalType('DELETE_ATTACHMENT');
	};

	const handleConfirmAction = async () => {
		if (modalType === 'RESOLVE') {
			await resolveIssue();
		} else if (modalType === 'DELETE_ATTACHMENT') {
			await deleteAttachment();
		}
		setModalType(null);
		setAttachmentToDelete(null);
	};

	const resolveIssue = async () => {
		setIsDeletingIssue(true);
		try {
			const { data: files, error: listError } = await supabase.storage
				.from('issue-attachments')
				.list(`${id}/`);

			if (listError) console.warn('Error listing files:', listError);

			if (files && files.length > 0) {
				const filesToRemove = files.map((x) => `${id}/${x.name}`);
				const { error: removeError } = await supabase.storage
					.from('issue-attachments')
					.remove(filesToRemove);
				if (removeError) throw removeError;
			}

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
			setIsDeletingIssue(false);
		}
	};

	const deleteAttachment = async () => {
		if (!attachmentToDelete) return;

		setIsDeletingAttachment(true);
		try {
			// 1. Delete from Storage
			// Extract filename from URL or just use stored name if consistent
			// The structure we used was IssueID/Filename.
			// But our DB has file_url. We need to reconstruct the path or name.
			// Actually, we uploaded as `${id}/${fileName}`.
			// Wait, 'file_name' in DB is original name?
			// In handleFileUpload: `filePath = ${id}/${fileName}`
			// We stored `file.name` in DB as `file_name`. The unique name was `fileName`.
			// CRITICAL FIX: We need the actual storage path to delete.
			// Option A: Parse it from publicUrl if possible.
			// Option B: Store storage_path in DB.

			// Let's rely on listing method or parsing URL.
			// publicUrl format: .../issue-attachments/issueId/filename
			const urlParts = attachmentToDelete.file_url.split('/issue-attachments/');
			if (urlParts.length < 2) throw new Error('Invalid file URL format');

			const storagePath = urlParts[1];

			const { error: storageError } = await supabase.storage
				.from('issue-attachments')
				.remove([storagePath]);

			if (storageError) throw storageError;

			// 2. Delete from DB
			const { error: dbError } = await supabase
				.from('attachments')
				.delete()
				.eq('id', attachmentToDelete.id);

			if (dbError) throw dbError;

			// 3. Update UI
			setAttachments((prev) => prev.filter((a) => a.id !== attachmentToDelete.id));
		} catch (error) {
			alert('Error deleting document: ' + error.message);
			console.error(error);
		} finally {
			setIsDeletingAttachment(false);
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

	// Determine Modal Props based on type
	const getModalProps = () => {
		if (modalType === 'RESOLVE') {
			return {
				title: t('modalTitle'),
				message: t('modalMessage'),
				confirmText: t('modalConfirm'),
				isDangerous: true
			};
		} else {
			// DELETE_ATTACHMENT
			return {
				title: t('deleteAttachmentTitle'),
				message: t('deleteAttachmentMessage'),
				confirmText: t('deleteAttachmentConfirm'),
				isDangerous: true
			};
		}
	};

	const modalProps = getModalProps();

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
						onClick={initiateResolve}
						disabled={isDeletingIssue}
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
						{isDeletingIssue ? t('closing') : t('markResolved')}
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
						{/* ... Description Description ... */}
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
										<div
											className="file-actions"
											style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
										>
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
											{session && (
												<button
													onClick={() => initiateDeleteAttachment(file)}
													className="delete-btn"
													title="Delete"
													disabled={isDeletingAttachment}
													style={{
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#ef4444',
														fontSize: '1.1rem',
														padding: '4px'
													}}
												>
													🗑
												</button>
											)}
										</div>
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
						{/* ... other sidebar items ... */}
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
				isOpen={!!modalType}
				title={modalProps.title}
				message={modalProps.message}
				confirmText={modalProps.confirmText}
				isDangerous={modalProps.isDangerous}
				onConfirm={handleConfirmAction}
				onCancel={() => {
					setModalType(null);
					setAttachmentToDelete(null);
				}}
			/>
		</div>
	);
};

export default IssueDetails;
