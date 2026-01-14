import React from 'react';

const ConfirmationModal = ({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = 'Confirm',
	isDangerous = false
}) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content glass-panel">
				<h3 className="modal-title">{title}</h3>
				<p className="modal-message">{message}</p>

				<div className="modal-actions">
					<button className="secondary-btn" onClick={onCancel}>
						Cancel
					</button>
					<button
						className={`primary-btn ${isDangerous ? 'danger-btn' : ''}`}
						onClick={onConfirm}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
