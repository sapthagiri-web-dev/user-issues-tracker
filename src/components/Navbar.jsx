import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
	const { t, language, toggleLanguage } = useLanguage();

	return (
		<nav className="navbar glass-panel">
			<div className="container navbar-content">
				<div className="logo-section">
					{/* Replaced gradient logo with a solid one fitting the theme */}
					<div className="logo-icon"></div>
					<h1 className="logo-text">{t('appTitle')}</h1>
				</div>
				<div className="nav-actions" style={{ display: 'flex', gap: '1rem' }}>
					<button
						onClick={toggleLanguage}
						className="lang-toggle-btn"
						style={{
							background: 'white',
							border: '1px solid hsl(var(--color-bg-highlight))',
							padding: '0.4rem 0.8rem',
							borderRadius: 'var(--radius-sm)',
							cursor: 'pointer',
							fontWeight: '700',
							color: 'hsl(var(--color-primary))',
							minWidth: '40px'
						}}
					>
						{language === 'en' ? 'KN' : 'EN'}
					</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
