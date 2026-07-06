import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LogOut, CheckCircle, XCircle, Loader2, Download, ArrowLeft, Clock, Mail } from 'lucide-react';

type Status = 'pending' | 'approved' | 'rejected';

interface VisaRequest {
  id: string;
  created_at: string;
  full_name: string;
  passport_number: string;
  passport_issuing_country: string;
  date_of_birth: string;
  nationality: string;
  job_title: string;
  email: string;
  phone: string;
  ticket_order_number: string | null;
  notes: string | null;
  status: Status;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reject_reason: string | null;
  letter_path: string | null;
  letter_sent_at: string | null;
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.5rem 0.9rem',
  borderRadius: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
};

export default function AdminVisa() {
  const { user, signOut } = useAuth();
  const [filter, setFilter] = useState<Status>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<{ id: string; msg: string } | null>(null);
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['visa_requests', filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requests')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as VisaRequest[];
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('approve-visa-request', {
        body: { request_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visa_requests'] }),
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('visa_requests')
        .update({
          status: 'rejected',
          reject_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email ?? 'admin',
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visa_requests'] }),
  });

  const downloadLetter = async (r: VisaRequest) => {
    if (!r.letter_path) return;
    const { data, error } = await supabase.storage.from('visa-letters').createSignedUrl(r.letter_path, 60);
    if (error || !data?.signedUrl) {
      alert('Could not generate download link.');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleApprove = async (r: VisaRequest) => {
    setBusyId(r.id);
    setErrorId(null);
    try {
      await approve.mutateAsync(r.id);
    } catch (e: any) {
      setErrorId({ id: r.id, msg: e?.message || 'Approve failed' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (r: VisaRequest) => {
    const reason = prompt(`Reject request from ${r.full_name}?\n\nOptional reason (shown internally only):`);
    if (reason === null) return;
    setBusyId(r.id);
    setErrorId(null);
    try {
      await reject.mutateAsync({ id: r.id, reason });
    } catch (e: any) {
      setErrorId({ id: r.id, msg: e?.message || 'Reject failed' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', color: '#fff' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        background: 'rgb(10, 10, 15)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/admin" style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgb(149, 149, 176)', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Admin
          </a>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>Visa Requests</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)' }}>{user?.email}</span>
          <button onClick={signOut} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgb(149, 149, 176)' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Status filter */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {(['pending', 'approved', 'rejected'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              ...btnStyle,
              background: filter === s ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === s ? '#06B6D4' : 'rgb(149,149,176)',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgb(149,149,176)' }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
            Loading…
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgb(149,149,176)' }}>
            No {filter} requests.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map(r => (
              <div key={r.id} style={{
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                      {r.full_name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgb(149,149,176)', marginTop: '0.15rem' }}>
                      {r.nationality} · {r.job_title} · Submitted {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {filter === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(r)}
                          disabled={busyId === r.id}
                          style={{ ...btnStyle, background: '#10B981', color: '#fff' }}
                        >
                          {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Approve & send
                        </button>
                        <button
                          onClick={() => handleReject(r)}
                          disabled={busyId === r.id}
                          style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {filter === 'approved' && r.letter_path && (
                      <button onClick={() => downloadLetter(r)} style={{ ...btnStyle, background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>
                        <Download size={14} /> Download letter
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem 1.5rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                }}>
                  <Field label="Passport #" value={r.passport_number} />
                  <Field label="Passport country" value={r.passport_issuing_country} />
                  <Field label="Date of birth" value={r.date_of_birth} />
                  <Field label="Email" value={r.email} link={`mailto:${r.email}`} />
                  <Field label="Phone" value={r.phone} />
                  {r.ticket_order_number && <Field label="Order #" value={r.ticket_order_number} />}
                </div>

                {r.notes && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderLeft: '3px solid #06B6D4', background: 'rgba(6,182,212,0.05)', fontSize: '13px', color: 'rgb(200,200,220)', whiteSpace: 'pre-wrap' }}>
                    {r.notes}
                  </div>
                )}

                {filter !== 'pending' && (
                  <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgb(149,149,176)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {r.reviewed_at && <span><Clock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Reviewed {new Date(r.reviewed_at).toLocaleString()} by {r.reviewed_by}</span>}
                    {r.letter_sent_at && <span style={{ color: '#10B981' }}><Mail size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Emailed {new Date(r.letter_sent_at).toLocaleString()}</span>}
                    {r.reject_reason && <span>Reason: {r.reject_reason}</span>}
                  </div>
                )}

                {errorId?.id === r.id && (
                  <div style={{ marginTop: '0.5rem', color: '#EF4444', fontSize: '13px' }}>{errorId.msg}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <span style={{ color: 'rgb(120,120,150)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ color: '#fff', marginTop: '2px' }}>
        {link ? <a href={link} style={{ color: '#06B6D4', textDecoration: 'none' }}>{value}</a> : value}
      </div>
    </div>
  );
}
