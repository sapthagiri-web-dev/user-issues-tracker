import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ConfirmationModal = ({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText,
	isDangerous = false
}) => {
	const { t } = useLanguage();

	if (!isOpen) return null;

	// Use passed prop OR translation default
	const effectiveConfirmText = confirmText || t('modalConfirm');
	const cancelText = t('modalCancel');

	return (
		<div className="modal-overlay">
			<div className="modal-content glass-panel">
				<h3 className="modal-title">{title}</h3>
				<p className="modal-message">{message}</p>

				<div className="modal-actions">
					<button className="secondary-btn" onClick={onCancel}>
						{cancelText}
					</button>
					<button
						className={`primary-btn ${isDangerous ? 'danger-btn' : ''}`}
						onClick={onConfirm}
					>
						{effectiveConfirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
