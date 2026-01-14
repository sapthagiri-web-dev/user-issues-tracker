import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IssueDetails from './pages/IssueDetails';
import ReportIssue from './pages/ReportIssue';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
	return (
		<LanguageProvider>
			<Router>
				<div className="app-container">
					<Navbar />
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/issue/:id" element={<IssueDetails />} />
						<Route path="/report" element={<ReportIssue />} />
					</Routes>
				</div>
			</Router>
		</LanguageProvider>
	);
}

export default App;
