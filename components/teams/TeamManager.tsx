'use client';

import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Trophy,
  Users,
  Award,
  PlusCircle,
  MinusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Team, PointAdjustment } from '@/types/fest';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function TeamManager() {
  const store = useFestStore();
  const session = store.getSession();
  const teams = store.getTeams();
  const pointAdjustments = store.getPointAdjustments();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [adjustingTeam, setAdjustingTeam] = useState<Team | null>(null);

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    shortCode: '',
    color: '#18181B',
    description: '',
    captain: '',
    active: true,
  });

  // Adjustment Form
  const [adjPoints, setAdjPoints] = useState<number>(5);
  const [adjReason, setAdjReason] = useState('Exemplary Pavilion Discipline');

  const openCreateModal = () => {
    setTeamForm({
      name: '',
      shortCode: '',
      color: '#18181B',
      description: '',
      captain: '',
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      shortCode: team.shortCode,
      color: team.color,
      description: team.description,
      captain: team.captain,
      active: team.active,
    });
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.shortCode.trim()) return;

    if (editingTeam) {
      store.updateTeam(editingTeam.id, {
        name: teamForm.name.trim().toUpperCase(),
        shortCode: teamForm.shortCode.trim().toUpperCase(),
        color: teamForm.color,
        description: teamForm.description.trim(),
        captain: teamForm.captain.trim(),
        active: teamForm.active,
      });
      setEditingTeam(null);
    } else {
      store.createTeam({
        name: teamForm.name.trim().toUpperCase(),
        shortCode: teamForm.shortCode.trim().toUpperCase(),
        color: teamForm.color,
        description: teamForm.description.trim(),
        captain: teamForm.captain.trim(),
        active: teamForm.active,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteTeam = (team: Team) => {
    if (
      window.confirm(
        `Are you sure you want to delete Team "${team.name}"? This is irreversible.`
      )
    ) {
      store.deleteTeam(team.id);
    }
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingTeam || !adjReason.trim()) return;
    store.addPointAdjustment(adjustingTeam.id, adjPoints, adjReason.trim());
    setAdjustingTeam(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            HOUSES & TEAMS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Current house standings, medal counts and discretionary point adjustments
          </p>
        </div>

        {session.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add House / Team</span>
          </button>
        )}
      </div>

      {/* Large Visual Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const maxTeamPoints = Math.max(...teams.map((t) => t.points), 1);
          const percent = Math.round((team.points / maxTeamPoints) * 100);

          return (
            <div
              key={team.id}
              className="p-7 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge & Rank */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                    {team.shortCode}
                  </span>
                  <div className="flex items-center gap-1">
                    {team.rank === 1 && <Trophy className="w-4 h-4 text-amber-500" />}
                    <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-400">
                      RANK #{team.rank}
                    </span>
                  </div>
                </div>

                {/* Team Name */}
                <h3 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
                  {team.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{team.description}</p>
                <div className="space-y-1 text-xs font-mono mt-3">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Leader: <span className="font-bold text-neutral-900 dark:text-white">{team.captain || 'None assigned'}</span>
                  </p>
                  {team.viceCaptain && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Sub-Leader: <span className="font-bold text-neutral-900 dark:text-white">{team.viceCaptain}</span>
                    </p>
                  )}
                </div>

                {/* Big Score Display */}
                <div className="my-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      TOTAL SCORE
                    </span>
                    <p className="text-3xl font-black font-mono text-neutral-950 dark:text-white">
                      {team.points}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      STUDENTS
                    </span>
                    <p className="text-lg font-bold font-mono text-neutral-700 dark:text-neutral-300">
                      {team.studentCount}
                    </p>
                  </div>
                </div>

                {/* Medals Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <span className="text-amber-700 dark:text-amber-400 block font-bold text-sm">
                      {team.goldCount}
                    </span>
                    <span className="text-[10px] text-amber-600/80 uppercase">GOLD</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-700 dark:text-neutral-300 block font-bold text-sm">
                      {team.silverCount}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">SILVER</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/10 border border-amber-300/40 dark:border-amber-800/30">
                    <span className="text-amber-800 dark:text-amber-500 block font-bold text-sm">
                      {team.bronzeCount}
                    </span>
                    <span className="text-[10px] text-amber-700/80 uppercase">BRONZE</span>
                  </div>
                </div>

                {/* Relative Progress Bar */}
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admin */}
              {session.role === 'ADMIN' && (
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setAdjustingTeam(team);
                      setAdjPoints(5);
                      setAdjReason('Exemplary Pavilion Discipline');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Adjust Points</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 cursor-pointer"
                      title="Delete Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bonus / Minus Points Audit Ledger Section */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-neutral-950 dark:text-white uppercase">
              DISCRETIONARY POINT AUDIT LOG
            </h3>
            <p className="text-xs text-neutral-500">
              Audit trail of all bonus (+) and disciplinary minus (-) points applied to houses
            </p>
          </div>
        </div>

        {pointAdjustments.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No point adjustments applied yet.</p>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
            {pointAdjustments.map((adj) => (
              <div key={adj.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg ${
                      adj.points >= 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {adj.points > 0 ? `+${adj.points}` : adj.points} PTS
                  </span>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {adj.teamName}
                    </span>
                    <p className="text-neutral-500 text-xs">{adj.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-mono">
                  <span>{new Date(adj.createdAt).toLocaleDateString()}</span>
                  {session.role === 'ADMIN' && (
                    <button
                      onClick={() => store.deletePointAdjustment(adj.id)}
                      className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Revoke Adjustment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Team */}
      {(isAddModalOpen || editingTeam) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTeam(null);
          }}
          title={editingTeam ? 'Edit House Details' : 'Create New House / Team'}
          subtitle="Define house code for automated chest number prefixes."
        >
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                House Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AL-FALAH"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm uppercase focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Short Code (2-3 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="AF"
                  value={teamForm.shortCode}
                  onChange={(e) => setTeamForm({ ...teamForm, shortCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono font-bold uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  House Captain
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zaid Bin Haris"
                  value={teamForm.captain}
                  onChange={(e) => setTeamForm({ ...teamForm, captain: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Description / Motto
              </label>
              <input
                type="text"
                placeholder="House of Valour & Knowledge"
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeam(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                {editingTeam ? 'Save Team' : 'Create Team'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Discretionary Point Adjustment */}
      {adjustingTeam && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingTeam(null)}
          title={`Adjust Points: ${adjustingTeam.name}`}
          subtitle="Add bonus points for achievements or minus points for discipline infringements."
        >
          <form onSubmit={handleApplyAdjustment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Points (Positive or Negative)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  required
                  value={adjPoints}
                  onChange={(e) => setAdjPoints(parseInt(e.target.value, 10) || 0)}
                  className="w-32 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-base font-mono font-bold focus:outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdjPoints(5)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
                  >
                    +5 (Discipline)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjPoints(-3)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold cursor-pointer"
                  >
                    -3 (Late Arrival)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Audit Reason *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Outstanding Volunteer Support in Assembly"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setAdjustingTeam(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Confirm Point Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
