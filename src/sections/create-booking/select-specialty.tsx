'use client';

import { useState, useEffect } from 'react';

import {
  Link,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useGetSpecialties } from 'src/api/specialty';

import { ISpecialtyItem } from 'src/types/specialties';

export default function SelectSpecialty({
  onSelect,
  handleSelectCurrentStep,
  formData,
  setCurrentStep,
  handleSubmit,
}: {
  onSelect: (key: ISpecialtyItem) => void;
  handleSelectCurrentStep: (step: string) => void;
  formData: any;
  setCurrentStep: (step: string) => void;
  handleSubmit: (data: any) => void;
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
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
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
      formData.specialty_id = preview.id;
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
            <div className="w-full h-full flex flex-col gap-1 items-center justify-center">
              <img
                src={
                  s.avatarUrl ||
                  'https://res.cloudinary.com/dut4zlbui/image/upload/v1744651244/ah43js2wcqzhtjkur5iz.svg'
                }
                alt={s.name}
                className="w-full h-full object-cover"
                style={{
                  objectFit: 'cover',
                  height: '40px',
                  width: '40px',
                }}
              />
              <span className="text-sm font-medium text-center">{s.name}</span>
              {/* <span className="text-sm font-medium text-center">({s.id})</span> */}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-6 mt-10 w-full">
        <Link
          component={RouterLink}
          href="/dashboard"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0' }}
        >
          <Button size="large" variant="outlined" color="primary">
            Trở Về
          </Button>
        </Link>
        <Button
          disabled={!selected}
          onClick={() => {
            setCurrentStep('medical-form');
            if (selected) {
              onSelect(selected);
              handleSubmit({
                specialtyObject: selected,
                patientObject: userProfile,
              });
            }
          }}
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
