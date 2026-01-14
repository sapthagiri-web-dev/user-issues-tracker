import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IssueDetails from './pages/IssueDetails';
import ReportIssue from './pages/ReportIssue';
import './App.css';

function App() {
	return (
		<Router>
			<div className="app">
				<Navbar />
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/issue/:id" element={<IssueDetails />} />
					<Route path="/report" element={<ReportIssue />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
