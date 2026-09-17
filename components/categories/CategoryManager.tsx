'use client';

import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Users, Trophy } from 'lucide-react';
import { useFestStore } from '@/hooks/useFestStore';
import { Category } from '@/types/fest';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function CategoryManager() {
  const store = useFestStore();
  const session = store.getSession();
  const categories = store.getCategories();
  const students = store.getStudents();
  const competitions = store.getCompetitions();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAge: 10,
    maxAge: 18,
    maxCompetitionsPerStudent: 3,
    active: true,
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      minAge: 10,
      maxAge: 18,
      maxCompetitionsPerStudent: 3,
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      minAge: cat.minAge,
      maxAge: cat.maxAge,
      maxCompetitionsPerStudent: cat.maxCompetitionsPerStudent ?? 3,
      active: cat.active,
    });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (session.role !== 'ADMIN') return;
    if (!formData.name.trim()) return;

    if (editingCategory) {
      store.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        maxCompetitionsPerStudent: Number(formData.maxCompetitionsPerStudent),
        active: formData.active,
      });
      setEditingCategory(null);
    } else {
      store.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        maxCompetitionsPerStudent: Number(formData.maxCompetitionsPerStudent),
        active: formData.active,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (session.role !== 'ADMIN') return;
    if (
      window.confirm(
        `Are you sure you want to delete Category "${cat.name}"?`
      )
    ) {
      store.deleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 dark:text-white uppercase">
            CATEGORIES
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Define category brackets and maximum event quotas per student
          </p>
        </div>

        {session.role === 'ADMIN' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const studentCount = students.filter((s) => s.categoryId === cat.id).length;
          const compCount = competitions.filter((c) => c.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="p-6 rounded-[28px] bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="category">{cat.name}</Badge>
                </div>

                <h3 className="text-xl font-bold text-neutral-950 dark:text-white mt-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {cat.description || 'Standard category division for fest participants.'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-neutral-400 block uppercase">
                      STUDENTS
                    </span>
                    <span className="text-base font-bold text-neutral-900 dark:text-white">
                      {studentCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-neutral-400 block uppercase">
                      PROGRAMMES
                    </span>
                    <span className="text-base font-bold text-neutral-900 dark:text-white">
                      {compCount}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>Quota limit:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    Max {cat.maxCompetitionsPerStudent} events / student
                  </span>
                </div>
              </div>

              {session.role === 'ADMIN' && (
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory ? 'Edit Category' : 'Create Category'}
          subtitle="Configure age eligibility and maximum competition limits."
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Grades 8 to 10"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Max Events Allowed Per Student
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxCompetitionsPerStudent}
                onChange={(e) =>
                  setFormData({ ...formData, maxCompetitionsPerStudent: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
