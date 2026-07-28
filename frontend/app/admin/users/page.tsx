'use client';

import React from 'react';
import { Users, UserPlus, ShieldCheck, Lock } from 'lucide-react';

export default function AdminUsersPage() {
  const users = [
    { name: 'Dr. Alok Kumar', email: 'director.uiet@csjmu.ac.in', role: 'Super Administrator', dept: 'Director Office', status: 'Active' },
    { name: 'Prof. Vinay Pathak', email: 'vc@csjmu.ac.in', role: 'Executive Sponsor', dept: 'Vice Chancellor Office', status: 'Active' },
    { name: 'Dr. Rahul Dev', email: 'rahul.cse@csjmu.ac.in', role: 'Knowledge Manager', dept: 'Computer Science & Eng', status: 'Active' },
    { name: 'Anita Sharma', email: 'admissions@csjmu.ac.in', role: 'Admissions Officer', dept: 'University Helpdesk', status: 'Active' },
    { name: 'Sanjay Verma', email: 'hostel.admin@csjmu.ac.in', role: 'Hostel Manager', dept: 'Student Affairs', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
            Administrative User Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage administrative access privileges, department credentials, and portal roles
          </p>
        </div>
        <button className="px-3.5 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors">
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Administrator Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-slate-800 dark:text-slate-200">
              {users.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-[11px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.dept}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    <button className="text-[#002B49] dark:text-amber-400 hover:underline">Edit Privileges</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
