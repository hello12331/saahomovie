'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, Ticket, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/email-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResendTicketEmail = async (bookingId: string) => {
    if (!bookingId) return;
    try {
      const res = await fetch('/api/bookings/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchLogs();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[#20232D] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-3">
            <Mail className="w-8 h-8 text-[#FF4D6D]" />
            <span>Email Logs & Transmission Audit</span>
          </h1>
          <p className="text-xs text-[#A8ACB8] mt-1">Audit dispatched OTPs, booking confirmations, and retry failed emails</p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-[#20232D] text-white text-xs font-bold flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      <div className="bg-[#171A23] rounded-3xl border border-[#20232D] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#20232D] text-[#A8ACB8] font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Recipient</th>
              <th className="p-4">Email Type</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Status</th>
              <th className="p-4">Sent Time</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#20232D] text-slate-300">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-[#20232D]/50 transition-colors">
                <td className="p-4 font-bold text-white">{log.recipient}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded bg-[#20232D] text-[10px] font-bold text-[#FF4D6D]">
                    {log.emailType}
                  </span>
                </td>
                <td className="p-4 max-w-xs truncate">{log.subject}</td>
                <td className="p-4">
                  {log.status === 'SENT' ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SENT</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILED</span>
                    </span>
                  )}
                </td>
                <td className="p-4 text-[#A8ACB8]">{new Date(log.sentAt).toLocaleString()}</td>
                <td className="p-4 text-right">
                  {log.bookingId && (
                    <button
                      onClick={() => handleResendTicketEmail(log.bookingId)}
                      className="px-3 py-1.5 rounded-lg bg-[#FF4D6D] text-white text-[10px] font-bold hover:bg-[#ff3358]"
                    >
                      Resend Ticket Email
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
