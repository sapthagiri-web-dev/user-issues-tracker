import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import IssueDetails from './pages/IssueDetails';
import './App.css';

function App() {
	return (
		<Router>
			<div className="app">
				<Navbar />
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/issue/:id" element={<IssueDetails />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
