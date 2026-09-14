import { useState } from 'react';
import {
  Wallet,
  Utensils,
  Plus,
  Edit2,
  Calendar,
  X,
} from 'lucide-react';
import NavBar from '../../../components/NavBar/NavBar';
import { BottomNavbar } from '../../../components/BottomNavbar/BottomNavbar';
import StatCard from '../../../components/StatCard/StatCard';
import Button from '../../../components/Button/Button';
import Badge from '../../../components/Badge/Badge';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/InputField/InputField';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import {
  useBudgetsQuery,
  useActiveBudgetQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useExpendituresQuery,
  useActiveExpenditureQuery,
  useCreateExpenditureMutation,
  useUpdateExpenditureMutation,
} from '../../../api/useApiQueries';
import type {
  Budget,
  CreateBudgetDto,
  ExpenditurePeriod,
  CreateExpenditureDto,
} from '../../../api/Services/BudgetServices';

export function Budgets() {
  const [activeTab, setActiveTab] = useState<'budgets' | 'rates'>('budgets');
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState<CreateBudgetDto>({
    title: '',
    description: '',
    startPeriod: '',
    endPeriod: '',
    amount: 0,
  });

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExpenditurePeriod | null>(null);
  const [rateForm, setRateForm] = useState<CreateExpenditureDto>({
    type: 'MEAL',
    cost: 0,
    startDate: '',
    endDate: '',
  });

  // Queries
  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgetsQuery();
  const { data: activeBudget } = useActiveBudgetQuery();
  const { data: expenditures = [], isLoading: isRatesLoading } = useExpendituresQuery();
  const { data: activeExpenditure } = useActiveExpenditureQuery();

  // Mutations
  const createBudgetMutation = useCreateBudgetMutation();
  const updateBudgetMutation = useUpdateBudgetMutation();
  const createExpenditureMutation = useCreateExpenditureMutation();
  const updateExpenditureMutation = useUpdateExpenditureMutation();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const getStatusBadge = (start: string, end: string) => {
    const today = new Date().toISOString().split('T')[0];
    const s = start.split('T')[0];
    const e = end.split('T')[0];
    if (today >= s && today <= e) {
      return <Badge variant="success" size="xs" label="Active" />;
    } else if (today < s) {
      return <Badge variant="info" size="xs" label="Upcoming" />;
    } else {
      return <Badge variant="neutral" size="xs" label="Past" />;
    }
  };

  // Budget Modal handlers
  const handleOpenCreateBudget = () => {
    setEditingBudget(null);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setBudgetForm({
      title: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} Budget`,
      description: '',
      startPeriod: firstDay,
      endPeriod: lastDay,
      amount: 15000,
    });
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditBudget = (b: Budget) => {
    setEditingBudget(b);
    setBudgetForm({
      title: b.title,
      description: b.description || '',
      startPeriod: b.startPeriod ? b.startPeriod.split('T')[0] : '',
      endPeriod: b.endPeriod ? b.endPeriod.split('T')[0] : '',
      amount: b.amount,
    });
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.title || !budgetForm.startPeriod || !budgetForm.endPeriod || budgetForm.amount <= 0) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    try {
      if (editingBudget) {
        await updateBudgetMutation.mutateAsync({
          id: editingBudget.id,
          data: budgetForm,
        });
        showToast('success', 'Budget updated successfully.');
      } else {
        await createBudgetMutation.mutateAsync(budgetForm);
        showToast('success', 'Budget created successfully.');
      }
      setIsBudgetModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save budget.';
      showToast('error', msg);
    }
  };

  // Rate Modal handlers
  const handleOpenCreateRate = () => {
    setEditingRate(null);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
    setRateForm({
      type: 'MEAL',
      cost: 15.0,
      startDate: firstDay,
      endDate: lastDay,
    });
    setIsRateModalOpen(true);
  };

  const handleOpenEditRate = (rate: ExpenditurePeriod) => {
    setEditingRate(rate);
    setRateForm({
      type: rate.type,
      cost: rate.cost,
      startDate: rate.startDate ? rate.startDate.split('T')[0] : '',
      endDate: rate.endDate ? rate.endDate.split('T')[0] : '',
    });
    setIsRateModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateForm.startDate || !rateForm.endDate || rateForm.cost <= 0) {
      showToast('error', 'Please provide valid rate and date range.');
      return;
    }

    try {
      if (editingRate) {
        await updateExpenditureMutation.mutateAsync({
          id: editingRate.id,
          data: rateForm,
        });
        showToast('success', 'Catering rate updated successfully.');
      } else {
        await createExpenditureMutation.mutateAsync(rateForm);
        showToast('success', 'Catering rate created successfully.');
      }
      setIsRateModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save rate.';
      showToast('error', msg);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      <NavBar
        backUrl="/admin/activities"
        title="Budgets & Expenditure Rates"
      />

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-6">
        {/* Top Active StatCards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Active Budget"
            value={
              activeBudget
                ? `¢${activeBudget.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'No Active Budget'
            }
            subtitle={
              activeBudget
                ? `${activeBudget.title} (${activeBudget.startPeriod.split('T')[0]} to ${activeBudget.endPeriod.split('T')[0]})`
                : 'Configure a budget period for analytics tracking'
            }
            icon={<Wallet className="h-5 w-5" />}
            iconVariant="primary"
            headerRight={
              activeBudget ? (
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Edit2 size={13} />}
                  label="Edit"
                  onClick={() => handleOpenEditBudget(activeBudget)}
                />
              ) : (
                <Button
                  size="xs"
                  variant="primary"
                  icon={<Plus size={13} />}
                  label="Create"
                  onClick={handleOpenCreateBudget}
                />
              )
            }
          />

          <StatCard
            title="Active Meal Rate"
            value={
              activeExpenditure
                ? `¢${activeExpenditure.cost.toFixed(2)} / meal`
                : 'No Active Rate'
            }
            subtitle={
              activeExpenditure
                ? `Effective ${activeExpenditure.startDate.split('T')[0]} to ${activeExpenditure.endDate.split('T')[0]}`
                : 'Set vendor catering unit price for cost calculations'
            }
            icon={<Utensils className="h-5 w-5" />}
            iconVariant="secondary"
            headerRight={
              activeExpenditure ? (
                <Button
                  size="xs"
                  variant="outline"
                  icon={<Edit2 size={13} />}
                  label="Edit"
                  onClick={() => handleOpenEditRate(activeExpenditure)}
                />
              ) : (
                <Button
                  size="xs"
                  variant="primary"
                  icon={<Plus size={13} />}
                  label="Set Rate"
                  onClick={handleOpenCreateRate}
                />
              )
            }
          />
        </section>

        {/* Tab Controls & Add Action */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex rounded-xl bg-surface-muted p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'budgets'
                  ? 'bg-surface text-text-primary shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Budgets ({budgets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'rates'
                  ? 'bg-surface text-text-primary shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Catering Rates ({expenditures.length})
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            label={activeTab === 'budgets' ? 'New Budget' : 'New Rate Period'}
            onClick={activeTab === 'budgets' ? handleOpenCreateBudget : handleOpenCreateRate}
          />
        </section>

        {/* Tab Content: Budgets */}
        {activeTab === 'budgets' && (
          <section className="flex flex-col gap-3">
            {isBudgetsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : budgets.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-8 w-8 text-text-muted" />}
                title="No Budgets Defined"
                description="Set monthly or quarterly budgets to track food expenditure and projected costs."
                buttonLabel="Create First Budget"
                buttonAction={handleOpenCreateBudget}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {budgets.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs hover:border-border-hover/60 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary">{b.title}</h3>
                          {b.description && (
                            <p className="text-xs text-text-secondary mt-0.5">{b.description}</p>
                          )}
                        </div>
                        {getStatusBadge(b.startPeriod, b.endPeriod)}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-text-primary">
                          ¢{b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-text-muted">allocated</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-text-muted" />
                        <span>
                          {b.startPeriod.split('T')[0]} → {b.endPeriod.split('T')[0]}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditBudget(b)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Rates */}
        {activeTab === 'rates' && (
          <section className="flex flex-col gap-3">
            {isRatesLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : expenditures.length === 0 ? (
              <EmptyState
                icon={<Utensils className="h-8 w-8 text-text-muted" />}
                title="No Catering Rates Configured"
                description="Define the per-meal unit price agreed with your food vendors to enable spend calculation."
                buttonLabel="Add Catering Rate"
                buttonAction={handleOpenCreateRate}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {expenditures.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs hover:border-border-hover/60 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-text-primary">Catering Rate (Meal)</h3>
                          <p className="text-xs text-text-secondary mt-0.5">Unit cost billed per fulfilled meal portion</p>
                        </div>
                        {getStatusBadge(rate.startDate, rate.endDate)}
                      </div>

                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-text-primary">
                          ¢{rate.cost.toFixed(2)}
                        </span>
                        <span className="text-xs text-text-muted">/ meal</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-text-muted" />
                        <span>
                          {rate.startDate.split('T')[0]} → {rate.endDate.split('T')[0]}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditRate(rate)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* CREATE / EDIT BUDGET MODAL */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        variant="center"
        showCloseButton={false}
      >
        <form onSubmit={handleSaveBudget} className="flex flex-col p-5 font-sans text-text-primary w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h2>
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3.5">
            <InputField
              label="Budget Title *"
              value={budgetForm.title}
              onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })}
              placeholder="e.g. October 2026 Budget"
            />

            <InputField
              label="Allocated Amount (¢) *"
              type="number"
              value={budgetForm.amount ? String(budgetForm.amount) : ''}
              onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })}
              placeholder="15000"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <InputField
                label="Start Date *"
                type="date"
                value={budgetForm.startPeriod}
                onChange={(e) => setBudgetForm({ ...budgetForm, startPeriod: e.target.value })}
              />
              <InputField
                label="End Date *"
                type="date"
                value={budgetForm.endPeriod}
                onChange={(e) => setBudgetForm({ ...budgetForm, endPeriod: e.target.value })}
              />
            </div>

            <InputField
              label="Notes / Description (Optional)"
              value={budgetForm.description || ''}
              onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
              placeholder="e.g. Q4 Catering budget allocation"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              label="Cancel"
              onClick={() => setIsBudgetModalOpen(false)}
            />
            <Button
              type="submit"
              variant="primary"
              label={editingBudget ? 'Save Changes' : 'Create Budget'}
              disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
            />
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT RATE MODAL */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        variant="center"
        showCloseButton={false}
      >
        <form onSubmit={handleSaveRate} className="flex flex-col p-5 font-sans text-text-primary w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary">
              {editingRate ? 'Edit Catering Rate' : 'New Catering Rate'}
            </h2>
            <button
              type="button"
              onClick={() => setIsRateModalOpen(false)}
              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3.5">
            <InputField
              label="Per-Meal Rate (¢) *"
              type="number"
              value={rateForm.cost ? String(rateForm.cost) : ''}
              onChange={(e) => setRateForm({ ...rateForm, cost: parseFloat(e.target.value) || 0 })}
              placeholder="15.00"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <InputField
                label="Effective From *"
                type="date"
                value={rateForm.startDate}
                onChange={(e) => setRateForm({ ...rateForm, startDate: e.target.value })}
              />
              <InputField
                label="Effective Until *"
                type="date"
                value={rateForm.endDate}
                onChange={(e) => setRateForm({ ...rateForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              label="Cancel"
              onClick={() => setIsRateModalOpen(false)}
            />
            <Button
              type="submit"
              variant="primary"
              label={editingRate ? 'Update Rate' : 'Set Rate'}
              disabled={createExpenditureMutation.isPending || updateExpenditureMutation.isPending}
            />
          </div>
        </form>
      </Modal>

      <BottomToast
        isOpen={toastState.isOpen}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
        type={toastState.type}
        message={toastState.message}
      />

      <BottomNavbar activeTab="admin" />
    </main>
  );
}

export default Budgets;


