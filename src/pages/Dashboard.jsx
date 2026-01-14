import React from 'react';
import IssueCard from '../components/IssueCard';

const MOCK_ISSUES = [
	{
		id: 1,
		title: 'Borewell motor repair needed in Ward 4',
		affectedUser: 'Ramesh Farmer',
		creator: 'Panchayat Officer',
		status: 'Critical'
	},
	{
		id: 2,
		title: 'Streetlights not working on Main Temple Road',
		affectedUser: 'Lakshmi Devi',
		creator: 'Line Man',
		status: 'Open'
	},
	{
		id: 3,
		title: 'Ration card distribution delay inquiry',
		affectedUser: 'Basavaraj',
		creator: 'Volunteer Group',
		status: 'In Progress'
	},
	{
		id: 4,
		title: 'School waal compound collapsed due to rain',
		affectedUser: 'Headmaster Ravi',
		creator: 'AE Engineer',
		status: 'Open'
	},
	{
		id: 5,
		title: 'Drinking water pipeline leak near bus stand',
		affectedUser: 'Shop owners',
		creator: 'Water Board',
		status: 'Review'
	}
];

const Dashboard = () => {
	return (
		<div className="container app-main">
			<div
				className="header-actions"
				style={{
					marginBottom: '2rem',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<div>
					<h2
						className="text-gradient"
						style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
					>
						Grama Samasya
					</h2>
					<p style={{ color: 'hsl(var(--color-text-muted))' }}>
						Reporting issues for our village development
					</p>
				</div>
				<button className="primary-btn">+ Report Issue</button>
			</div>

			<div className="issues-grid">
				{MOCK_ISSUES.map((issue) => (
					<IssueCard
						key={issue.id}
						id={issue.id}
						title={issue.title}
						affectedUser={issue.affectedUser}
						creator={issue.creator}
						status={issue.status}
					/>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
