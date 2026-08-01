'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Database, Trash2, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useCustomModal } from '@/components/providers/ModalProvider';
import { format } from 'date-fns';

export default function BackupsPage() {
  const { confirm, showAlert } = useCustomModal();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ['databaseBackups'],
    queryFn: async () => {
      const res = await api.get('/backups');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/backups/create');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['databaseBackups'] });
      showAlert({ title: 'Backup Successful', message: `Database securely backed up to ${data.data.filename}.`, variant: 'success' });
    },
    onError: (err) => {
      showAlert({ title: 'Backup Failed', message: err.response?.data?.message || err.message, variant: 'danger' });
    },
    onSettled: () => setIsProcessing(false)
  });

  const restoreMutation = useMutation({
    mutationFn: async (filename) => {
      const res = await api.post(`/backups/restore/${filename}`);
      return res.data;
    },
    onSuccess: () => {
      showAlert({ title: 'Restore Successful', message: 'The database has been fully restored.', variant: 'success' });
    },
    onError: (err) => {
      showAlert({ title: 'Restore Failed', message: err.response?.data?.message || err.message, variant: 'danger' });
    },
    onSettled: () => setIsProcessing(false)
  });

  const deleteMutation = useMutation({
    mutationFn: async (filename) => {
      const res = await api.delete(`/backups/${filename}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['databaseBackups'] });
    },
    onError: (err) => {
      showAlert({ title: 'Delete Failed', message: err.response?.data?.message || err.message, variant: 'danger' });
    }
  });

  const handleCreate = () => {
    setIsProcessing(true);
    createMutation.mutate();
  };

  const handleRestore = async (filename) => {
    const isConfirmed = await confirm({
      title: 'DANGER: Restore Database',
      message: `Are you absolutely sure you want to overwrite the current database with the backup "${filename}"? Any data created after this backup will be permanently lost!`,
      variant: 'danger',
      confirmText: 'Yes, Overwrite Database'
    });

    if (isConfirmed) {
      setIsProcessing(true);
      restoreMutation.mutate(filename);
    }
  };

  const handleDelete = async (filename) => {
    const isConfirmed = await confirm({
      title: 'Delete Backup',
      message: `Are you sure you want to delete the backup file "${filename}"? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete Backup'
    });

    if (isConfirmed) {
      deleteMutation.mutate(filename);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) return <p className="text-slate-400 p-8 text-center text-xs font-medium">Loading backups...</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Database Disaster Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage automated daily backups, create manual snapshots, and restore business data.</p>
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={isProcessing} 
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-md"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{isProcessing && createMutation.isPending ? 'Backing up...' : 'Create Snapshot Now'}</span>
        </Button>
      </div>

      <Card className="p-0 border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Backup Filename</th>
                <th className="px-5 py-4">Date Created</th>
                <th className="px-5 py-4 text-right">File Size</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center text-slate-400 font-medium">
                    No database backups found. Automated backups run daily at 2:00 AM.
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        {backup.filename}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {format(new Date(backup.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-600">
                      {formatBytes(backup.size)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(backup.filename)}
                          disabled={isProcessing}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          title="Restore this backup"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.filename)}
                          disabled={isProcessing}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Delete this backup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
