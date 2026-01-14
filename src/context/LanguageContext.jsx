import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
	en: {
		appTitle: 'KRS Grama Seva',
		dashboardTitle: 'Grama Samasya',
		dashboardSubtitle: 'Reporting issues for our village development',
		reportIssueBtn: '+ Report Issue',
		loading: 'Loading issues...',
		errorLoading: 'Failed to load issues. Please try again.',
		noIssues: 'No issues found. Be the first to report one!',

		// Issue Card
		statusOpen: 'Open',
		statusInProgress: 'In Progress',
		statusResolved: 'Resolved',
		daysAgo: 'days ago',
		reportedOn: 'Reported on',
		residentLabel: 'Resident / Grama Vasi',
		officialLabel: 'Official / Karyakarta',
		viewDetails: 'View Details',
		unknown: 'Unknown',

		// Issue Details
		backToDashboard: 'Back to Dashboard',
		notFound: 'Issue not found',
		description: 'Description',
		location: 'Location',
		documents: 'Documents / Dakhale',
		addDocument: '+ Add Document',
		noDocuments: 'No documents attached yet.',
		uploading: 'Uploading...',
		dateReported: 'Date Reported',
		residentAffected: 'Resident Affected',
		reportedBy: 'Reported By',
		markResolved: '✓ Mark Resolved',
		closing: 'Closing...',

		// Report Page
		reportNewIssue: 'Report New Issue',
		fillDetails:
			'Fill in the details below to open a new ticket for the village.',
		issueTitle: 'Issue Title *',
		issueDesc: 'Description',
		issueLocation: 'Location',
		residentName: 'Resident / Grama Vasi *',
		reporterName: 'Reported By (Official) *',
		submitReport: 'Submit Report',
		submitting: 'Submitting...',

		// Modal
		modalTitle: 'Resolve Issue?',
		modalMessage:
			'Are you sure you want to mark this as resolved? This will permanently delete the issue and all attached documents. This action cannot be undone.',
		modalConfirm: 'Yes, Resolve & Delete',
		modalCancel: 'Cancel',

		// Attachment Delete
		deleteAttachmentTitle: 'Delete Document?',
		deleteAttachmentMessage:
			'Are you sure you want to delete this document? This cannot be undone.',
		deleteAttachmentConfirm: 'Delete',

		// Search & Edit
		searchPlaceholder: 'Search issues...',
		editIssue: 'Edit Issue',
		saveChanges: 'Save Changes',
		cancel: 'Cancel',
		updateSuccess: 'Issue updated successfully!'
	},
	kn: {
		appTitle: 'ಕೆ.ಆರ್.ಎಸ್ ಗ್ರಾಮ ಸೇವೆ',
		dashboardTitle: 'ಗ್ರಾಮ ಸಮಸ್ಯೆ',
		dashboardSubtitle: 'ನಮ್ಮ ಗ್ರಾಮದ ಅಭಿವೃದ್ಧಿಗಾಗಿ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ',
		reportIssueBtn: '+ ದೂರು ನೀಡಿ',
		loading: 'ಸಮಸ್ಯೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
		errorLoading:
			'ಸಮಸ್ಯೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
		noIssues: 'ಯಾವುದೇ ಸಮಸ್ಯೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮೊದಲಿಗರಾಗಿ ವರದಿ ಮಾಡಿ!',

		// Issue Card
		statusOpen: 'ತೆರೆದಿದೆ',
		statusInProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
		statusResolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
		daysAgo: 'ದಿನಗಳ ಹಿಂದೆ',
		reportedOn: 'ವರದಿಯಾದ ದಿನಾಂಕ',
		residentLabel: 'ನಿವಾಸಿ / ಗ್ರಾಮವಾಸಿ',
		officialLabel: 'ಅಧಿಕಾರಿ / ಕಾರ್ಯಕರ್ತ',
		viewDetails: 'ವಿವರಗಳನ್ನು ನೋಡಿ',
		unknown: 'ಗೊತ್ತಿಲ್ಲ',

		// Issue Details
		backToDashboard: 'ಹಿಂದಕ್ಕೆ ಹೋಗಿ',
		notFound: 'ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿಲ್ಲ',
		description: 'ವಿವರಣೆ',
		location: 'ಸ್ಥಳ',
		documents: 'ದಾಖಲೆಗಳು',
		addDocument: '+ ದಾಖಲೆ ಸೇರಿಸಿ',
		noDocuments: 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿಲ್ಲ.',
		uploading: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
		dateReported: 'ವರದಿಯಾದ ದಿನಾಂಕ',
		residentAffected: 'ಬಾಧಿತ ನಿವಾಸಿ',
		reportedBy: 'ವರದಿ ಮಾಡಿದವರು',
		markResolved: '✓ ಪರಿಹರಿಸಲಾಗಿದೆ',
		closing: 'ಮುಚ್ಚಲಾಗುತ್ತಿದೆ...',

		// Report Page
		reportNewIssue: 'ಹೊಸ ದೂರು ನೀಡಿ',
		fillDetails: 'ಗ್ರಾಮದ ಹೊಸ ದೂರು ದಾಖಲಿಸಲು ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.',
		issueTitle: 'ಸಮಸ್ಯೆಯ ಶೀರ್ಷಿಕೆ *',
		issueDesc: 'ವಿವರಣೆ',
		issueLocation: 'ಸ್ಥಳ',
		residentName: 'ನಿವಾಸಿ / ಗ್ರಾಮವಾಸಿ *',
		reporterName: 'ವರದಿಗಾರ (ಅಧಿಕಾರಿ) *',
		submitReport: 'ದೂರು ಸಲ್ಲಿಸಿ',
		submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',

		// Modal
		modalTitle: 'ಸಮಸ್ಯೆ ಪರಿಹರಿಸಲಾಯಿತೇ?',
		modalMessage:
			'ಈ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ? ಇದು ಸಮಸ್ಯೆ ಮತ್ತು ಎಲ್ಲಾ ಲಗತ್ತಿಸಿದ ದಾಖಲೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ. ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.',
		modalConfirm: 'ಹೌದು, ಪರಿಹರಿಸಿ ಮತ್ತು ಅಳಿಸಿ',
		modalCancel: 'ರದ್ದುಮಾಡಿ',

		// Attachment Delete
		deleteAttachmentTitle: 'ದಾಖಲೆ ಅಳಿಸುವುದೇ?',
		deleteAttachmentMessage:
			'ಈ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ? ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.',
		deleteAttachmentConfirm: 'ಅಳಿಸಿ',

		// Search & Edit
		searchPlaceholder: 'ಹುಡುಕಿ...',
		editIssue: 'ದೂರು ತಿದ್ದುಪಡಿ',
		saveChanges: 'ಉಳಿಸಿ',
		cancel: 'ರದ್ದುಮಾಡಿ',
		updateSuccess: 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!'
	}
};

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(() => {
		return localStorage.getItem('language') || 'en';
	});

	const toggleLanguage = () => {
		setLanguage((prev) => {
			const newLang = prev === 'en' ? 'kn' : 'en';
			localStorage.setItem('language', newLang);
			return newLang;
		});
	};

	const t = (key) => {
		return translations[language][key] || key;
	};

	return (
		<LanguageContext.Provider value={{ language, toggleLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => useContext(LanguageContext);
