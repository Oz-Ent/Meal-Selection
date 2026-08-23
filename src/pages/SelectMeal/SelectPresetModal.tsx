import { useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import ApplyPresetEmpty from '../../assets/ApplyPresetEmpty.svg';
import { usePresetsByUserQuery } from '../../api/useApiQueries';
import type { Preset } from '../../api/Services/PresetServices';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export interface SelectPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId: number;
  userId?: number;
  onApplyPreset: (preset: Preset) => Promise<void>;
}

export function SelectPresetModal({
  isOpen,
  onClose,
  menuId,
  userId,
  onApplyPreset,
}: SelectPresetModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const presetsQuery = usePresetsByUserQuery(userId);
  const allPresets = presetsQuery.data ?? [];

  // Filter presets for current menu schedule and search term
  const menuPresets = allPresets.filter((p) => p.menuId === menuId);
  const filteredPresets = menuPresets.filter((p) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (p.name || '').toLowerCase().includes(query);
  });

  const handleClose = () => {
    setSearchTerm('');
    setSelectedPreset(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedPreset) return;
    setIsApplying(true);
    try {
      await onApplyPreset(selectedPreset);
      handleClose();
    } catch (error) {
      console.error('Failed to confirm preset:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant="bottom" showCloseButton={true}>
      <div className="p-4 pt-2 flex flex-col text-slate-900 font-sans w-full">
        <h2 className="text-base font-bold text-slate-900 mb-3 text-left">Select preset menu</h2>

        {/* Search Bar */}
        <div className="relative mb-2 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search preset menu"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none pr-10 focus:border-slate-400 placeholder:text-slate-400"
          />
          <Search
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
        </div>

        <p className="text-xs text-slate-500 italic mb-4 text-left">
          Available preset menus for this week&apos;s menu.
        </p>

        {/* Content Area */}
        {presetsQuery.isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7">
              <LoadingSpinner />
            </div>
            <p className="text-xs text-slate-500">Loading presets...</p>
          </div>
        ) : filteredPresets.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <img
              src={ApplyPresetEmpty}
              alt="No presets available"
              className="w-28 h-28 object-contain mb-3"
            />
            <p className="text-xs font-medium text-slate-500">No preset meals available.</p>
          </div>
        ) : (
          /* Preset List */
          <div className="flex flex-col gap-1 max-h-[45vh] overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(isSelected ? null : preset)}
                  className={`flex items-center justify-between w-full p-3.5 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {preset.name || `Preset ${preset.id}`}
                  </span>
                  {isSelected && <Check size={18} className="text-slate-800 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Confirm Button */}
        {selectedPreset && (
          <button
            type="button"
            disabled={isApplying}
            onClick={handleConfirm}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} strokeWidth={2.5} />
            )}
            <span>Confirm</span>
          </button>
        )}
      </div>
    </Modal>
  );
}
