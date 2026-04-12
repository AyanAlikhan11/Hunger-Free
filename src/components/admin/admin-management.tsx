'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


type AdminTab = 'users' | 'donations' | 'requests' | 'logs';

export default function AdminManagement() {
  const { authToken } = useAppStore();
  const [tab, setTab] = useState<AdminTab>('users');

  const [users, setUsers] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [assignPick, setAssignPick] = useState<Record<string, string>>({});
  

  // ✅ FIX: always a stable object type (not union)
  const authHeaders = useMemo(() => {
  // return undefined when no token (fetch accepts undefined headers)
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
}, [authToken]);

const jsonHeaders = useMemo(() => {
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}, [authToken]);

  async function loadUsers(role?: string) {
    const url = role ? `/api/admin/users?role=${encodeURIComponent(role)}` : '/api/admin/users';
    const res = await fetch(url, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load users');
    return data.users || [];
  }

  async function loadDonations() {
    const res = await fetch('/api/admin/donations?limit=50', { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load donations');
    setDonations(data.donations || []);
  }

  async function loadRequests() {
    const res = await fetch('/api/admin/requests?limit=50', { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load requests');
    setRequests(data.requests || []);
  }

  async function loadLogs() {
    const res = await fetch('/api/admin/audit?limit=50', { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load logs');
    setLogs(data.logs || []);
  }

  useEffect(() => {
    if (!authToken) return;

    (async () => {
      try {
        if (tab === 'users') {
          setUsers(await loadUsers());
        }
        if (tab === 'donations') {
          await loadDonations();
        }
        if (tab === 'requests') {
          await loadRequests();
          setVolunteers(await loadUsers('volunteer'));
        }
        if (tab === 'logs') {
          await loadLogs();
        }
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load admin data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authToken]);

  const updateUser = async (targetUserId: string, updates: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ targetUserId, updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Update failed');
    toast.success('User updated');
    setUsers(await loadUsers());
  };

  const updateDonation = async (id: string, updates: any) => {
    const res = await fetch('/api/admin/donations', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Update failed');
    toast.success('Donation updated');
    await loadDonations();
  };

  const deleteDonation = async (id: string) => {
    const res = await fetch(`/api/admin/donations?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Delete failed');
    toast.success('Donation deleted');
    await loadDonations();
  };

  const updateRequest = async (id: string, updates: any) => {
    const res = await fetch('/api/admin/requests', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Update failed');
    toast.success('Request updated');
    await loadRequests();
  };

  const assignVolunteer = async (requestId: string) => {
    const volunteerId = assignPick[requestId];
    if (!volunteerId) {
      toast.error('Select a volunteer first');
      return;
    }
    await updateRequest(requestId, { volunteerId, status: 'accepted' });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>Admin Management</CardTitle>

        <div className="flex flex-wrap gap-2">
          <Button variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')}>
            Users
          </Button>
          <Button variant={tab === 'donations' ? 'default' : 'outline'} onClick={() => setTab('donations')}>
            Donations
          </Button>
          <Button variant={tab === 'requests' ? 'default' : 'outline'} onClick={() => setTab('requests')}>
            Requests
          </Button>
          <Button variant={tab === 'logs' ? 'default' : 'outline'} onClick={() => setTab('logs')}>
            Audit Logs
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {tab === 'users' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                    >
                      {['donor', 'ngo', 'volunteer', 'farmer', 'admin'].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.isActive === false
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }
                    >
                      {u.isActive === false ? 'Disabled' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => updateUser(u.id, { isActive: u.isActive === false })}
                    >
                      {u.isActive === false ? 'Enable' : 'Disable'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 'donations' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-medium">{d.foodName}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.quantity} {d.unit} • {d.category} • mode: {d.deliveryMode || 'ngo'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={d.status}
                      onChange={(e) => updateDonation(d.id, { status: e.target.value })}
                    >
                      {['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>{d.donorName}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="outline" onClick={() => updateDonation(d.id, { status: 'cancelled' })}>
                      Cancel
                    </Button>
                    <Button variant="outline" className="text-red-600" onClick={() => deleteDonation(d.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 'requests' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donation</TableHead>
                <TableHead>NGO</TableHead>
                <TableHead>Dropoff</TableHead>
                <TableHead>Volunteer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.donation?.foodName || r.donationId}</TableCell>
                  <TableCell>{r.ngoName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.dropoffType === 'recipient' ? 'Recipient' : 'NGO'} • {r.dropoffAddress || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.volunteerName || '-'}</div>
                    <div className="mt-2 flex gap-2">
                      <select
                        className="border rounded-md px-2 py-1 text-sm w-[180px]"
                        value={assignPick[r.id] || ''}
                        onChange={(e) => setAssignPick((p) => ({ ...p, [r.id]: e.target.value }))}
                      >
                        <option value="">Select volunteer</option>
                        {volunteers.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.email})
                          </option>
                        ))}
                      </select>

                      <Button variant="outline" onClick={() => assignVolunteer(r.id)}>
                        Assign
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={r.status}
                      onChange={(e) => updateRequest(r.id, { status: e.target.value })}
                    >
                      {['pending', 'accepted', 'in_transit', 'delivered', 'cancelled'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" onClick={() => updateRequest(r.id, { status: 'cancelled' })}>
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 'logs' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-sm text-muted-foreground">No logs yet.</div>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="rounded-lg border p-3">
                  <div className="text-sm font-medium">{l.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.entityType} • {l.entityId} • {l.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}