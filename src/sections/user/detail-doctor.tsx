import React from 'react';

import { IUserItem } from 'src/types/user';

import './styles/styles.scss';

export default function DoctorModal({
  open,
  onClose,
  doctor,
  setCurrentStep,
  setOpenModal,
}: {
  open: boolean;
  onClose: () => void;
  doctor: IUserItem | null;
  setCurrentStep: (step: string) => void;
  setOpenModal: (open: boolean) => void;
}) {
  if (!open || !doctor) return null;
  return (
    <div className="fixed inset-0 z-50 shadow-lg bg-amber-50 flex items-center justify-center modal-detail-doctor">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-lg relative">
        <button
          type="button"
          className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar */}
          <img
            src={
              doctor.avatarUrl ||
              'https://www.shutterstock.com/image-vector/default-placeholder-doctor-halflength-portrait-600nw-1058724875.jpg'
            }
            alt={doctor.fullName || ''}
            className="w-32 h-32 rounded-lg object-cover"
          />

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">{doctor.fullName}</h2>
              <span className="text-xs text-green-600 font-semibold">● Đang hoạt động</span>
            </div>
            <p className="text-sm text-gray-600">Địa điểm: {doctor.address}</p>
            <p className="text-sm text-gray-600">Bệnh Viện: {doctor.hospital?.name}</p>
            <p className="text-sm text-gray-600">Cấp bậc: {doctor?.rank?.name}</p>
            <div className="flex flex-wrap gap-2">
              {doctor.specialty?.map((s: any, index: number) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col mt-4 md:mt-0 justify-end gap-4">
            <p className="text-lg text-gray-600">
              Giá khám: {(doctor?.rank?.base_price || 0).toLocaleString('vi-VN')} VNĐ
            </p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              onClick={() => {
                setOpenModal(false);
                setCurrentStep('step-payment');
              }}
            >
              Đặt lịch hẹn
            </button>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-semibold">{0}</span>
              <span className="text-sm text-gray-500">( 0 đánh giá)</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Hổ trợ qua:</span>
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Gọi âm thanh
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
