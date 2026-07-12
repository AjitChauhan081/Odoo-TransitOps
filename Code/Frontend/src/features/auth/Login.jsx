import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid2x2 } from 'lucide-react';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import { RuleCallout } from '../../components/RuleCallout';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LIST, ROLE_DESCRIPTIONS } from '../../constants/roles';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password || !role) {
      setError('Enter email, password and select a role to continue.');
      return;
    }
    // Simulated invalid-credentials / lockout demo: any password under 4 chars "fails"
    if (password.length < 4) {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 5
          ? 'Account locked after 5 failed attempts. Contact your Fleet Manager to reset access.'
          : `Invalid credentials. Attempt ${next} of 5 before lockout.`
      );
      return;
    }
    login(email, role);
    navigate('/');
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-mono">
      <div className="bg-ink text-paper p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grid2x2 size={22} strokeWidth={1.5} className="text-accent" />
            <span className="font-serif text-[22px]">TransitOps</span>
          </div>
          <p className="text-[11px] text-white/50 uppercase tracking-wide">Smart Transport Operations Platform</p>
        </div>

        <div className="my-10">
          <p className="micro-label !text-white/50 mb-4">One login, four roles</p>
          <ul className="flex flex-col gap-4">
            {ROLE_LIST.map((r) => (
              <li key={r} className="border-l-2 border-accent pl-3">
                <div className="text-[13px] font-medium">{r}</div>
                <div className="text-[11px] text-white/50">{ROLE_DESCRIPTIONS[r]}</div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] text-white/30">© 2026 TransitOps · Internal Fleet Operations System</p>
      </div>

      <div className="bg-paper p-8 lg:p-12 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <div>
            <h1 className="font-serif text-[22px] mb-1">Sign in</h1>
            <p className="text-[12px] text-ink-soft">Access your operations dashboard.</p>
          </div>

          {error && <RuleCallout>{error}</RuleCallout>}

          <Input label="Email" type="email" required placeholder="you@transitops.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select
            label="Role (RBAC)"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_LIST}
            placeholder="Select role..."
          />

          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" />
            <a href="#" className="text-[11px] text-ink-soft hover:text-ink underline">Forgot password</a>
          </div>

          <Button type="submit" variant="primary" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
