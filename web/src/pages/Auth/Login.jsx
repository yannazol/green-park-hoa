import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getLoginStyles from '../../styles/LoginStyles';

export default function Login() {
  const { colors } = useTheme();
  const s = getLoginStyles(colors);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      if (loggedIn.role === 'resident') {
        logout();
        setError('Resident accounts use the mobile app. This web portal is for HOA staff and admins.');
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.brand}>
          <img
            src="/brand/full-hoa-seal.png"
            alt="Green Park Village Homeowners' Association seal"
            style={s.brandLogo}
          />
          <h1 style={s.brandName}>Green Park Village HOA</h1>
          <p style={s.brandTagline}>Management and Community Services</p>
        </div>

        <Card title="Sign in" subtitle="Use your HOA account">
          <form style={s.form} onSubmit={handleSubmit}>
            {error && <div style={s.errorBox}>{error}</div>}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={s.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {showPassword ? (
                      <>
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                        <path d="M9.88 5.08A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a16.02 16.02 0 0 1-4.47 5.3" />
                        <path d="M6.61 6.61A15.77 15.77 0 0 0 2 12s3.5 7 10 7a11.09 11.09 0 0 0 5.39-1.61" />
                      </>
                    )}
                  </svg>
                </button>
              }
            />

            <Button type="submit" fullWidth loading={submitting}>
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}