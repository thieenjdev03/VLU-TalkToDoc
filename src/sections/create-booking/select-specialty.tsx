'use client';

import { useState, useEffect } from 'react';

import {
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useGetSpecialties } from 'src/api/specialty';

import { ISpecialtyItem } from 'src/types/specialties';

export default function SelectSpecialty({
  onSelect,
  handleSelectCurrentStep,
}: {
  onSelect: (key: string) => void;
  handleSelectCurrentStep: (step: string) => void;
}) {
  const [selected, setSelected] = useState<ISpecialtyItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState<ISpecialtyItem | null>(null);

  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([]);
  const { specialties } = useGetSpecialties({
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (specialties) {
      setSpecialtyList(specialties?.data || []);
    }
  }, [specialties]);

  const handlePreview = (item: ISpecialtyItem) => {
    setPreview(item);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (preview) {
      setSelected(preview);
      setModalOpen(false);
    }
  };

  return (
    <div className="w-fit min-h-screen mx-auto flex flex-col items-center px-4">
      <h2 className="text-2xl md:text-3xl font-semibold text-[black] mb-10 text-center">
        Chọn chuyên khoa
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 gap-4 max-w-4xl">
        {specialtyList.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => {
              handlePreview(s);
            }}
            className={`w-36 h-36 md:w-40 md:h-40 bg-white rounded-xl border transition duration-150 flex flex-col items-center justify-center px-4 text-[black]
              ${
                selected?.id === s.id
                  ? 'border-[#078DEE] shadow-md ring-2 ring-[#078DEE]'
                  : 'border-[#078DEE] hover:shadow'
              }`}
          >
            <span className="text-sm font-medium text-center">{s.name}</span>
            <span className="text-sm font-medium text-center">({s.id})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-6 mt-10 w-full">
        <Button
          onClick={() => {
            handleSelectCurrentStep('');
          }}
          size="large"
          variant="outlined"
          color="primary"
        >
          Trở Về
        </Button>
        <Button
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          size="large"
          variant="contained"
          color="primary"
        >
          Xác Nhận
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{preview?.name || 'Chuyên khoa'}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            {preview?.description || 'Không có mô tả chi tiết.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Huỷ</Button>
          <Button variant="contained" onClick={handleConfirm}>
            Chọn chuyên khoa này
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
