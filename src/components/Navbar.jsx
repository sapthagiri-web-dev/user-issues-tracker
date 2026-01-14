import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
	const { t, language, toggleLanguage } = useLanguage();
	const { session, logout } = useAuth();

	return (
		<nav className="navbar glass-panel">
			<div className="container navbar-content">
				<Link
					to="/"
					className="logo-section"
					style={{ textDecoration: 'none', color: 'inherit' }}
				>
					<div className="logo-icon"></div>
					<h1 className="logo-text">{t('appTitle')}</h1>
				</Link>
				<div
					className="nav-actions"
					style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
				>
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

					{session ? (
						<button
							onClick={logout}
							style={{
								background: 'transparent',
								border: 'none',
								color: 'hsl(var(--color-text-secondary))',
								cursor: 'pointer',
								fontWeight: 600,
								fontSize: '0.9rem'
							}}
						>
							Logout
						</button>
					) : (
						// Optionally show Login link, though user asked not to see it explicitly initially.
						// But usually a way to login is good. We'll keep it subtle.
						<Link
							to="/login"
							style={{
								color: 'hsl(var(--color-text-muted))',
								textDecoration: 'none',
								fontSize: '0.85rem'
							}}
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
