import React from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';

type StatusOption = {
  value: 'pending' | 'approved' | 'rejected' | 'updating';
  label: string;
  color: string;
};

const statusOptions: StatusOption[] = [
  { value: 'pending', label: 'Chờ xác nhận', color: '#f59e0b' },
  { value: 'approved', label: 'Đã xác nhận', color: '#10b981' },
  { value: 'rejected', label: 'Đã từ chối', color: '#ef4444' },
  { value: 'updating', label: 'Đang cập nhật', color: '#3b82f6' },
];

const customStyles: StylesConfig<StatusOption, false> = {
  indicatorSeparator: (base) => ({
    ...base,
    display: 'none',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? state.data.color
      : state.isFocused
        ? `${state.data.color}22`
        : 'white',
    color: state.isSelected ? 'white' : 'black',
  }),
  singleValue: (base, state) => ({
    ...base,
    color: state.data.color,
    fontWeight: 600,
  }),
};

type Props = {
  value?: 'pending' | 'approved' | 'rejected' | 'updating';
  onChange: (value: 'pending' | 'approved' | 'rejected' | 'updating' | undefined) => void;
};

const StatusSelect: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (option: SingleValue<StatusOption>) => {
    onChange(option?.value);
  };

  return (
    <Select
      options={statusOptions}
      styles={customStyles}
      value={statusOptions.find((opt) => opt.value === value)}
      onChange={handleChange}
      isClearable
      components={{
        IndicatorSeparator: () => null,
        ClearIndicator: () => null,
      }}
      placeholder="Chọn trạng thái"
    />
  );
};

export default StatusSelect;
