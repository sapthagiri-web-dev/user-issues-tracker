import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IssueDetails from './pages/IssueDetails';
import ReportIssue from './pages/ReportIssue';
import Login from './pages/Login';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
	useEffect(() => {
		// Request notification permission on load
		if ('Notification' in window) {
			Notification.requestPermission();
		}
	}, []);

	return (
		<AuthProvider>
			<LanguageProvider>
				<Router>
					<div className="app-container">
						<Navbar />
						<Routes>
							<Route path="/" element={<Dashboard />} />
							<Route path="/issue/:id" element={<IssueDetails />} />
							<Route path="/report" element={<ReportIssue />} />
							<Route path="/login" element={<Login />} />
						</Routes>
					</div>
				</Router>
			</LanguageProvider>
		</AuthProvider>
	);
}

export default App;
