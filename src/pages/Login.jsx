import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const { t } = useLanguage();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			await login(email, password);
			// Success! Redirect to dashboard or previous page
			// For now, simpler to just go to Report if that was the intent, or Dashboard
			navigate('/');
		} catch (err) {
			setError('Invalid login credentials.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container app-main">
			<div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '2rem' }}>
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
					← {t('backToDashboard')}
				</Link>

				<div className="glass-panel" style={{ padding: '2rem' }}>
					<h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
						Official Login
					</h2>

					{error && (
						<div
							style={{
								background: '#fee2e2',
								color: '#b91c1c',
								padding: '0.75rem',
								borderRadius: '4px',
								marginBottom: '1rem',
								fontSize: '0.9rem'
							}}
						>
							{error}
						</div>
					)}

					<form
						onSubmit={handleLogin}
						style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
					>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<label
								style={{
									fontSize: '0.9rem',
									fontWeight: '600',
									color: 'hsl(var(--color-text-secondary))'
								}}
							>
								Email
							</label>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								style={{
									padding: '0.75rem',
									borderRadius: '4px',
									border: '1px solid #ccc'
								}}
							/>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<label
								style={{
									fontSize: '0.9rem',
									fontWeight: '600',
									color: 'hsl(var(--color-text-secondary))'
								}}
							>
								Password
							</label>
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								style={{
									padding: '0.75rem',
									borderRadius: '4px',
									border: '1px solid #ccc'
								}}
							/>
						</div>

						<button
							type="submit"
							className="primary-btn"
							disabled={loading}
							style={{ justifyContent: 'center', marginTop: '1rem' }}
						>
							{loading ? 'Signing in...' : 'Sign In'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
