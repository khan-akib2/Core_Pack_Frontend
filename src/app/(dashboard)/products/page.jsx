'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, X, Edit, Trash2, FolderPlus, Tags } from 'lucide-react';
import { useCustomModal } from '@/components/providers/ModalProvider';

export default function ProductsPage() {
  const { confirm, showAlert } = useCustomModal();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Wooden Packaging Boxes');
  const [hsnCode, setHsnCode] = useState('44151000');
  const [gstRate, setGstRate] = useState(5);
  const [unit, setUnit] = useState('Pcs');
  const [newCategoryName, setNewCategoryName] = useState('');

  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    }
  });

  const DEFAULT_CATEGORIES = [
    'Wooden Packaging Boxes',
    'Corrugated Boxes',
    'Wooden Pallets',
    'Wooden Crates',
    'Custom Packaging'
  ];

  const categories = (Array.isArray(company?.categories) && company.categories.length > 0)
    ? company.categories
    : DEFAULT_CATEGORIES;

  React.useEffect(() => {
    if (!category && categories?.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/company', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
    }
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get(`/products?search=${encodeURIComponent(search)}`);
      return res.data.data;
    }
  });

  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];

  const createOrUpdateProductMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingId) {
        const res = await api.put(`/products/${editingId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/products', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setName('');
    setCategory(categories[0] || 'Wooden Packaging Boxes');
    setHsnCode('44151000');
    setGstRate(5);
    setUnit('Pcs');
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name || '');
    setCategory(prod.category || categories[0] || 'Wooden Packaging Boxes');
    setHsnCode(prod.hsnCode || '44151000');
    setGstRate(prod.gstRate || 5);
    setUnit(prod.unit || 'Pcs');
    setShowModal(true);
  };

  const handleDelete = async (id, prodName) => {
    const isOk = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete product "${prodName}"?`,
      confirmText: 'Delete Product',
      variant: 'danger'
    });
    if (isOk) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (categories.includes(catName)) {
      return showAlert({ title: 'Duplicate Category', message: 'This category already exists.' });
    }

    const updated = [...categories, catName];
    updateCompanyMutation.mutate({ categories: updated });
    setNewCategoryName('');
  };

  const handleRemoveCategory = async (catToRemove) => {
    if (categories.length <= 1) {
      return showAlert({ title: 'Action Restricted', message: 'At least one category is required.' });
    }
    const isOk = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${catToRemove}"?`,
      confirmText: 'Delete Category',
      variant: 'danger'
    });
    if (isOk) {
      const updated = categories.filter(c => c !== catToRemove);
      updateCompanyMutation.mutate({ categories: updated });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrUpdateProductMutation.mutate({
      name,
      category,
      hsnCode,
      gstRate: Number(gstRate),
      unit
    });
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product & Packaging Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage wooden boxes, corrugated cartons, pallets, categories and HSN rates</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowCategoryModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 whitespace-nowrap">
            <Tags className="w-4 h-4" /> Manage Categories
          </Button>
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="p-1.5 px-3 border-slate-200/80">
        <div className="flex items-center space-x-2">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search by Product Name, Category, HSN Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none shadow-none focus:ring-0 text-xs placeholder:text-slate-400 py-1.5 px-1"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Product Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">HSN Code</th>
                <th className="p-3.5">GST %</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">Loading catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">No products in catalog.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-4 font-semibold text-slate-900 text-xs">{p.name}</td>
                    <td className="p-3.5">
                      <Badge variant="default" className="text-[10.5px] font-medium bg-slate-100/80 text-slate-700 border-slate-200">
                        {p.category}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono text-[11.5px] text-slate-500">{p.hsnCode}</td>
                    <td className="p-3.5 text-xs font-medium text-slate-600">{p.gstRate}%</td>
                    <td className="p-3.5 text-xs text-slate-500">{p.unit || 'Pcs'}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{editingId ? 'Edit Product Details' : 'Add New Packaging Product'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required />
              <Select
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </Select>
              <Input label="HSN Code *" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} required />
              <Select
                label="GST Tax Rate *"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              >
                <option value="5">5% (CGST 2.5% + SGST 2.5%)</option>
              </Select>
              <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createOrUpdateProductMutation.isPending}>
                  {editingId ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Manage Product Categories</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
              />
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-t border-slate-100 pt-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800">
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
