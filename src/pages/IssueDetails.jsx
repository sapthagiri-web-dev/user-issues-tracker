import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const MOCK_ISSUES = [
	{
		id: 1,
		title: 'Borewell motor repair needed in Ward 4',
		affectedUser: 'Ramesh Farmer',
		creator: 'Panchayat Officer',
		status: 'Critical',
		description:
			'The main borewell supplying water to Ward 4 has been non-functional for 3 days. Crops are drying up and drinking water is scarce. We need immediate repair of the submersible pump.',
		location: 'Ward 4, Near Govt School',
		date: '2023-10-24',
		initialAttachments: [
			{ name: 'Complaint_Letter_Ward4.pdf', size: '1.2 MB' },
			{ name: 'Motor_Condition_Photo.jpg', size: '2.4 MB' }
		]
	},
	{
		id: 2,
		title: 'Streetlights not working on Main Temple Road',
		affectedUser: 'Lakshmi Devi',
		creator: 'Line Man',
		status: 'Open',
		description:
			'Three streetlights near the Anjaneya temple are noticeably dim or completely off, causing safety concerns for women returning home in the evening.',
		location: 'Temple Road',
		date: '2023-10-25',
		initialAttachments: []
	},
	{
		id: 3,
		title: 'Ration card distribution delay inquiry',
		affectedUser: 'Basavaraj',
		creator: 'Volunteer Group',
		status: 'In Progress',
		description:
			'Many BPL families have not received their monthly rice quota. The shop owner claims server issues. We need clarification.',
		location: 'Market Street',
		date: '2023-10-22',
		initialAttachments: [{ name: 'Beneficiary_List.xlsx', size: '15 KB' }]
	},
	{
		id: 4,
		title: 'School waal compound collapsed due to rain',
		affectedUser: 'Headmaster Ravi',
		creator: 'AE Engineer',
		status: 'Open',
		description:
			'Heavy rains last night caused the compound wall of the primary school to collapse. It is a hazard for children playing nearby.',
		location: 'Govt Primary School',
		date: '2023-10-26',
		initialAttachments: [{ name: 'Damage_Report.docx', size: '450 KB' }]
	},
	{
		id: 5,
		title: 'Drinking water pipeline leak near bus stand',
		affectedUser: 'Shop owners',
		creator: 'Water Board',
		status: 'Review',
		description:
			'Clean drinking water is being wasted due to a pipe burst near the main bus stand circle. It is also creating a slushy mess.',
		location: 'Bus Stand Circle',
		date: '2023-10-23',
		initialAttachments: []
	}
];

const IssueDetails = () => {
	const { id } = useParams();
	const issue = MOCK_ISSUES.find((i) => i.id === parseInt(id));

	// State for attachments (initialized from mock data or empty)
	const [attachments, setAttachments] = useState(
		issue ? issue.initialAttachments || [] : []
	);
	const [isUploading, setIsUploading] = useState(false);

	if (!issue) {
		return (
			<div className="container app-main" style={{ textAlign: 'center' }}>
				<h2>Issue not found</h2>
				<Link
					to="/"
					className="primary-btn"
					style={{ display: 'inline-block', marginTop: '1rem' }}
				>
					Back to Dashboard
				</Link>
			</div>
		);
	}

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setIsUploading(true);
			// Simulate network delay
			setTimeout(() => {
				setAttachments((prev) => [...prev, { name: file.name, size: '1.5 MB' }]); // Dummy size
				setIsUploading(false);
			}, 1000);
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
							<p className="section-content">{issue.description}</p>
						</section>

						<section className="detail-section">
							<h3 className="section-title">Location</h3>
							<p className="section-content">{issue.location}</p>
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
								{attachments.map((file, index) => (
									<div key={index} className="attachment-item">
										<div className="file-icon">📄</div>
										<div className="file-info">
											<div className="file-name">{file.name}</div>
											<div className="file-size">{file.size}</div>
										</div>
										<button className="download-btn">⬇</button>
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
							<div className="value">{issue.date}</div>
						</div>
						<div className="sidebar-group">
							<label className="label">Resident Affected</label>
							<div className="user-card">
								<div className="avatar avatar-affected">
									{issue.affectedUser.charAt(0)}
								</div>
								<span className="name">{issue.affectedUser}</span>
							</div>
						</div>
						<div className="sidebar-group">
							<label className="label">Reported By</label>
							<div className="user-card">
								<div className="avatar avatar-creator">{issue.creator.charAt(0)}</div>
								<span className="name">{issue.creator}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IssueDetails;
