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
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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