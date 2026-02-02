import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import ConfirmationModal from '../components/ConfirmationModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
	MAGADI_VILLAGES,
	MAGADI_HOBLIS,
	formatLocation,
	extractVillageName,
	extractHobliName,
	getVillageName,
	getHobliName,
	localizeLocation
} from '../data/villagesData';

const IssueDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t, language } = useLanguage();
	const { session } = useAuth();

	const [issue, setIssue] = useState(null);
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);

	const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	// Comments State
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [isPostingComment, setIsPostingComment] = useState(false);

	// Edit Mode State
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		title: '',
		description: '',
		location: ''
	});
	const [selectedVillage, setSelectedVillage] = useState('');
	const [selectedHobli, setSelectedHobli] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	// Modal State handling
	const [modalType, setModalType] = useState(null); // 'DELETE_ATTACHMENT' or null
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
				setEditForm({
					title: data.title,
					description: data.description,
					location: data.location
				});
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

		async function fetchComments() {
			try {
				const { data, error } = await supabase
					.from('comments')
					.select('*')
					.eq('issue_id', id)
					.order('created_at', { ascending: true });

				if (error) throw error;
				setComments(data || []);
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		}

		if (id) {
			fetchIssueDetails();
			fetchAttachments();
			fetchComments();
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
			let uploadFile = file;

			// Compress if image
			if (file.type.match(/image\/.*/)) {
				const options = {
					maxSizeMB: 1,
					maxWidthOrHeight: 1920,
					useWebWorker: true
				};
				try {
					console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
					uploadFile = await imageCompression(file, options);
					console.log(
						`Compressed size: ${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`
					);
				} catch (error) {
					console.error('Compression failed, using original file:', error);
				}
			}

			const fileExt = file.name.split('.').pop();
			const fileName = `${Date.now()}_${Math.random()
				.toString(36)
				.substring(7)}.${fileExt}`;
			const filePath = `${id}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('issue-attachments')
				.upload(filePath, uploadFile);

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

	// --- Edit Handlers ---
	const handleEditChange = (e) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value });
	};

	// Handle village selection in edit mode
	const handleEditVillageChange = (e) => {
		const inputValue = e.target.value;
		setSelectedVillage(inputValue);

		// Find village match (en or kn)
		const villageMatch = MAGADI_VILLAGES.find(
			(v) => v.en.toLowerCase() === inputValue.toLowerCase() || v.kn === inputValue
		);

		if (villageMatch) {
			const displayVillage = getVillageName(villageMatch, language);

			// Resolve Hobli
			let displayHobli = '';
			if (selectedHobli) {
				const hobliMatch = MAGADI_HOBLIS.find(
					(h) => h.en === selectedHobli || h.kn === selectedHobli
				);
				if (hobliMatch) {
					displayHobli = getHobliName(hobliMatch, language);
				}
			}

			setEditForm({
				...editForm,
				location: formatLocation(displayVillage, displayHobli, language)
			});
		} else {
			setEditForm({ ...editForm, location: inputValue });
		}
	};

	// Handle hobli selection in edit mode
	const handleEditHobliChange = (e) => {
		const inputValue = e.target.value;
		setSelectedHobli(inputValue);

		if (selectedVillage) {
			const villageMatch = MAGADI_VILLAGES.find(
				(v) =>
					v.en.toLowerCase() === selectedVillage.toLowerCase() ||
					v.kn === selectedVillage
			);
			const displayVillage = villageMatch
				? getVillageName(villageMatch, language)
				: selectedVillage;

			const hobliMatch = MAGADI_HOBLIS.find(
				(h) => h.en === inputValue || h.kn === inputValue
			);
			const displayHobli = hobliMatch
				? getHobliName(hobliMatch, language)
				: inputValue;

			setEditForm({
				...editForm,
				location: formatLocation(displayVillage, displayHobli, language)
			});
		}
	};

	const saveEdit = async () => {
		setIsSaving(true);
		try {
			const { error } = await supabase
				.from('issues')
				.update({
					title: editForm.title,
					description: editForm.description,
					location: editForm.location
				})
				.eq('id', id);

			if (error) throw error;

			setIssue({ ...issue, ...editForm });
			setIsEditing(false);
			alert(t('updateSuccess'));
		} catch (error) {
			alert('Error updating issue: ' + error.message);
		} finally {
			setIsSaving(false);
		}
	};

	// --- Status Update Handler ---
	const updateIssueStatus = async (newStatus) => {
		setIsUpdatingStatus(true);
		try {
			const { error } = await supabase
				.from('issues')
				.update({ status: newStatus })
				.eq('id', id);

			if (error) throw error;

			setIssue({ ...issue, status: newStatus });
			alert(t('statusUpdated') || 'Status updated successfully!');
		} catch (error) {
			alert('Error updating status: ' + error.message);
			console.error(error);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const initiateDeleteAttachment = (file) => {
		setAttachmentToDelete(file);
		setModalType('DELETE_ATTACHMENT');
	};

	const handleConfirmAction = async () => {
		if (modalType === 'DELETE_ATTACHMENT') {
			await deleteAttachment();
		}
		setModalType(null);
		setAttachmentToDelete(null);
	};

	const deleteAttachment = async () => {
		if (!attachmentToDelete) return;

		setIsDeletingAttachment(true);
		try {
			const urlParts = attachmentToDelete.file_url.split('/issue-attachments/');
			if (urlParts.length < 2) throw new Error('Invalid file URL format');

			const storagePath = urlParts[1];

			const { error: storageError } = await supabase.storage
				.from('issue-attachments')
				.remove([storagePath]);

			if (storageError) throw storageError;

			const { error: dbError } = await supabase
				.from('attachments')
				.delete()
				.eq('id', attachmentToDelete.id);

			if (dbError) throw dbError;

			setAttachments((prev) => prev.filter((a) => a.id !== attachmentToDelete.id));
		} catch (error) {
			alert('Error deleting document: ' + error.message);
			console.error(error);
		} finally {
			setIsDeletingAttachment(false);
		}
	};

	// --- Comment Handlers ---
	const handlePostComment = async (e) => {
		e.preventDefault();
		if (!newComment.trim()) return;
		if (!session) return;

		setIsPostingComment(true);
		try {
			const { data, error } = await supabase
				.from('comments')
				.insert([
					{
						issue_id: id,
						user_email: session.user.email,
						content: newComment.trim()
					}
				])
				.select()
				.single();

			if (error) throw error;

			setComments([...comments, data]);
			setNewComment('');
		} catch (error) {
			alert('Error posting comment: ' + error.message);
		} finally {
			setIsPostingComment(false);
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
		// DELETE_ATTACHMENT
		return {
			title: t('deleteAttachmentTitle'),
			message: t('deleteAttachmentMessage'),
			confirmText: t('deleteAttachmentConfirm'),
			isDangerous: true
		};
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

				<div style={{ display: 'flex', gap: '1rem' }}>
					{/* Edit Button */}
					{session && !isEditing && (
						<button onClick={() => setIsEditing(true)} className="secondary-btn">
							✎ {t('editIssue')}
						</button>
					)}

					{/* Status Transition Buttons */}
					{session && !isEditing && (
						<>
							{issue.status === 'Open' && (
								<button
									onClick={() => updateIssueStatus('In Progress')}
									disabled={isUpdatingStatus}
									style={{
										background: '#fef3c7',
										color: '#b45309',
										border: '1px solid #fcd34d',
										padding: '0.5rem 1rem',
										borderRadius: 'var(--radius-sm)',
										fontWeight: '600',
										cursor: 'pointer'
									}}
								>
									{isUpdatingStatus
										? t('updating') || 'Updating...'
										: t('moveToProgress') || 'Move to In Progress'}
								</button>
							)}
							{issue.status === 'In Progress' && (
								<button
									onClick={() => updateIssueStatus('Resolved')}
									disabled={isUpdatingStatus}
									style={{
										background: '#d1fae5',
										color: '#047857',
										border: '1px solid #6ee7b7',
										padding: '0.5rem 1rem',
										borderRadius: 'var(--radius-sm)',
										fontWeight: '600',
										cursor: 'pointer'
									}}
								>
									{isUpdatingStatus
										? t('updating') || 'Updating...'
										: t('markResolved') || 'Mark as Resolved'}
								</button>
							)}
							{issue.status === 'Resolved' && (
								<button
									onClick={() => updateIssueStatus('Open')}
									disabled={isUpdatingStatus}
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
									{isUpdatingStatus
										? t('updating') || 'Updating...'
										: t('reopenIssue') || 'Reopen Issue'}
								</button>
							)}
						</>
					)}

					{/* Editing Controls */}
					{isEditing && (
						<div style={{ display: 'flex', gap: '0.5rem' }}>
							<button
								onClick={() => setIsEditing(false)}
								className="secondary-btn"
								disabled={isSaving}
							>
								{t('cancel')}
							</button>
							<button
								onClick={saveEdit}
								className="primary-btn"
								disabled={isSaving}
								style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
							>
								{isSaving ? t('submitting') : t('saveChanges')}
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="glass-panel issue-details-container">
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
					{isEditing ? (
						<input
							type="text"
							name="title"
							value={editForm.title}
							onChange={handleEditChange}
							className="issue-title"
							style={{
								flex: 1,
								padding: '0.5rem',
								borderRadius: '4px',
								border: '1px solid #ccc'
							}}
						/>
					) : (
						<h1 className="issue-title" style={{ flex: 1 }}>
							{issue.title}
						</h1>
					)}

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
						{/* ... Description ... */}
						<section className="detail-section">
							<h3 className="section-title">{t('description')}</h3>
							{isEditing ? (
								<textarea
									name="description"
									value={editForm.description}
									onChange={handleEditChange}
									rows={5}
									style={{
										width: '100%',
										padding: '0.5rem',
										borderRadius: '4px',
										border: '1px solid #ccc',
										fontSize: '1rem',
										fontFamily: 'inherit'
									}}
								/>
							) : (
								<p className="section-content">
									{issue.description || 'No description provided.'}
								</p>
							)}
						</section>

						<section className="detail-section">
							<h3 className="section-title">{t('location')}</h3>
							{isEditing ? (
								<div>
									<div style={{ marginBottom: '1rem' }}>
										<label style={{ display: 'block', marginBottom: '0.5rem' }}>
											{t('selectVillage')}
										</label>
										<input
											type="text"
											value={extractVillageName(editForm.location) || selectedVillage}
											onChange={handleEditVillageChange}
											list="villages-list-edit"
											placeholder={t('searchVillage')}
											autoComplete="off"
											style={{
												width: '100%',
												padding: '0.5rem',
												borderRadius: '4px',
												border: '1px solid #ccc',
												fontSize: '1rem'
											}}
										/>
										<datalist id="villages-list-edit">
											{MAGADI_VILLAGES.map((village) => {
												const val = getVillageName(village, language);
												return <option key={village.en} value={val} />;
											})}
										</datalist>
									</div>
									<div style={{ marginBottom: '0.5rem' }}>
										<label style={{ display: 'block', marginBottom: '0.5rem' }}>
											{t('selectHobli')}
										</label>
										<select
											value={extractHobliName(editForm.location) || selectedHobli}
											onChange={handleEditHobliChange}
											style={{
												width: '100%',
												padding: '0.5rem',
												borderRadius: '4px',
												border: '1px solid #ccc',
												fontSize: '1rem'
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
									{editForm.location && (
										<small style={{ color: 'hsl(var(--color-text-muted))' }}>
											{editForm.location}
										</small>
									)}
								</div>
							) : (
								<p className="section-content">
									{localizeLocation(issue.location, language) || t('unknown')}
								</p>
							)}
						</section>

						<section className="detail-section">
							<div className="documents-header">
								<h3 className="section-title" style={{ marginBottom: 0 }}>
									{t('documents')}
								</h3>
								{session && !isEditing && (
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
											{session && !isEditing && (
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

						{/* Comments Section */}
						<section className="detail-section">
							<h3 className="section-title">{t('comments') || 'Comments'}</h3>

							<div
								className="comments-list"
								style={{
									marginBottom: '1.5rem',
									display: 'flex',
									flexDirection: 'column',
									gap: '1rem'
								}}
							>
								{comments.length === 0 && (
									<div className="empty-state">
										{t('noComments') || 'No comments yet.'}
									</div>
								)}
								{comments.map((comment) => (
									<div
										key={comment.id}
										className="comment-item"
										style={{
											padding: '1rem',
											background: 'rgba(255, 255, 255, 0.5)',
											borderRadius: 'var(--radius-sm)',
											border: '1px solid var(--border-color)'
										}}
									>
										<div
											className="comment-header"
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												marginBottom: '0.5rem',
												fontSize: '0.9rem',
												color: '#666'
											}}
										>
											<span className="comment-author" style={{ fontWeight: '600' }}>
												{comment.user_email?.split('@')[0] || 'User'}
											</span>
											<span className="comment-date">
												{new Date(comment.created_at).toLocaleString()}
											</span>
										</div>
										<p
											className="comment-content"
											style={{ margin: 0, whiteSpace: 'pre-wrap' }}
										>
											{comment.content}
										</p>
									</div>
								))}
							</div>

							{session ? (
								<form onSubmit={handlePostComment} className="comment-form">
									<textarea
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										placeholder={t('writeComment') || 'Write a comment...'}
										rows={3}
										style={{
											width: '100%',
											padding: '0.75rem',
											borderRadius: 'var(--radius-sm)',
											border: '1px solid var(--border-color)',
											marginBottom: '0.5rem',
											fontFamily: 'inherit'
										}}
									/>
									<button
										type="submit"
										className="primary-btn"
										disabled={isPostingComment || !newComment.trim()}
										style={{
											padding: '0.5rem 1rem',
											fontSize: '0.9rem'
										}}
									>
										{isPostingComment
											? t('posting') || 'Posting...'
											: t('postComment') || 'Post Comment'}
									</button>
								</form>
							) : (
								<div
									className="login-prompt"
									style={{
										padding: '1rem',
										background: '#f3f4f6',
										borderRadius: 'var(--radius-sm)',
										textAlign: 'center',
										fontSize: '0.9rem',
										color: '#666'
									}}
								>
									Please{' '}
									<Link to="/login" style={{ color: 'var(--color-primary)' }}>
										login
									</Link>{' '}
									to post comments.
								</div>
							)}
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
