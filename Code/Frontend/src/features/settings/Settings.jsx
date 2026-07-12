import { useState } from 'react';
import { PageShell } from '../../layouts/PageShell';
import { Panel } from '../../components/Panel';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { useNotify } from '../../components/NotificationCenter';
import { useRole } from '../../context/RBACContext';
import { ROLES, ROLE_LIST, RBAC_MATRIX } from '../../constants/roles';

const MODULES = ['Fleet', 'Drivers', 'Trips', 'Fuel/Exp', 'Analytics'];

export default function Settings() {
  const { role } = useRole();
  const isAdmin = role === ROLES.FLEET_MANAGER;
  const notify = useNotify();
  const [depot, setDepot] = useState('Gandhinagar Depot');
  const [currency, setCurrency] = useState('INR');
  const [unit, setUnit] = useState('km');

  function handleSave(e) {
    e.preventDefault();
    notify('success', 'Settings saved successfully.');
  }

  return (
    <PageShell title="Settings & RBAC">
      <Panel title="General">
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Input label="Depot Name" value={depot} onChange={(e) => setDepot(e.target.value)} />
          <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={['INR', 'USD']} />
          <Select label="Distance Unit" value={unit} onChange={(e) => setUnit(e.target.value)} options={['km', 'mi']} />
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Panel>

      <Panel title="Role-Based Access (RBAC)">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-mono text-[12px] min-w-[560px]">
            <thead>
              <tr className="bg-paper-dim border-b border-line">
                <th className="px-3 py-2 text-left micro-label !font-mono">Role</th>
                {MODULES.map((m) => (
                  <th key={m} className="px-3 py-2 text-center micro-label !font-mono">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_LIST.map((r) => (
                <tr key={r} className="border-b border-line">
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{r}</td>
                  {MODULES.map((m) => {
                    const mark = RBAC_MATRIX[r][m];
                    const color = mark === '✓' ? 'text-status-available' : mark === 'view' ? 'text-status-warn' : 'text-ink-soft';
                    return (
                      <td key={m} className={`px-3 py-2.5 text-center ${color}`}>
                        {mark}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isAdmin && (
          <p className="text-[11px] text-ink-soft font-mono mt-3 pt-3 border-t border-line">
            Read-only for your role. Sign in as Fleet Manager to edit the access matrix.
          </p>
        )}
      </Panel>
    </PageShell>
  );
}
