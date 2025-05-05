import { useState, useEffect } from 'react';

import { IUserItem } from 'src/types/user';

import { getUserById } from '../../api/user';
import UserNewEditForm from '../user/user-new-edit-form';

export default function AccountGeneral() {
  const [currentUser, setCurrentUser] = useState<IUserItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userProfileStr = localStorage.getItem('userProfile');
    if (!userProfileStr) return;

    const userProfile = JSON.parse(userProfileStr);
    const { _id, role } = userProfile;
    if (!_id || !role) return;

    const fetchUserProfile = async () => {
      try {
        const data = await getUserById(_id, role.toLowerCase());
        setCurrentUser({ ...data, role: data.role?.toLowerCase() });
      } catch (error) {
        console.error('Lỗi khi fetch user:', error);
        setCurrentUser({ ...userProfile, role: role.toLowerCase() });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading || !currentUser) return <div>Đang tải thông tin người dùng...</div>;

  return (
    <UserNewEditForm
      updateUserPage
      currentUser={currentUser}
      typeUser={currentUser.role as 'doctor' | 'patient' | 'employee' | 'user' | 'admin'}
      hospitals={[]}
      isSettingAccount
    />
  );
}
