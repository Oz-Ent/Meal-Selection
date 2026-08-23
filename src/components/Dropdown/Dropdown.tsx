import { FormControl, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  ariaLabel,
}: DropdownProps) {
  const handleChange = (event: SelectChangeEvent<string>) => onChange(event.target.value);

  return (
    <FormControl fullWidth disabled={disabled}>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': ariaLabel ?? placeholder }}
        renderValue={(selected) =>
          selected ? options.find((option) => String(option.value) === selected)?.label : placeholder
        }
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
              mt: 0.75,
              maxHeight: 320,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 12px 28px rgba(22, 45, 58, 0.16)',
              },
            },
          },
        }}
        sx={{
          minHeight: 48,
          borderRadius: '6px',
          bgcolor: disabled ? '#f3f4f6' : '#ffffff',
          color: value ? '#3a3a3a' : '#6b7280',
          fontSize: '1rem',
          margin: ' 8px',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            minHeight: '48px !important',
            boxSizing: 'border-box',
            padding: '0 44px 0 14px !important',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary)',
            borderWidth: 2,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e5e7eb',
          },
          '& .MuiSelect-icon': {
            color: 'var(--color-primary)',
          },
        }}
      >
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
            sx={{
              minHeight: 44,
              fontSize: '0.95rem',
              '&.Mui-selected': { bgcolor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', fontWeight: 600 },
              '&.Mui-selected:hover': { bgcolor: 'var(--color-primary-subtle)' },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}