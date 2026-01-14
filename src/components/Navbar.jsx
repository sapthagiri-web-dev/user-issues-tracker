import React from 'react';

const Navbar = () => {
	return (
		<nav className="navbar glass-panel">
			<div className="container navbar-content">
				<div className="logo-section">
					{/* Replaced gradient logo with a solid one fitting the theme */}
					<div className="logo-icon"></div>
					<h1 className="logo-text">KRS Grama Seva</h1>
				</div>
				<div className="nav-actions">
					{/* Placeholder for future nav items or user profile */}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
