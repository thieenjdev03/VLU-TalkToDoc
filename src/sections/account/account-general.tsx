import { useState, useEffect } from 'react';

import { IUserItem } from 'src/types/user';

import { getUserById } from '../../api/user';
import UserNewEditForm from '../user/user-new-edit-form';
// ----------------------------------------------------------------------
export default function AccountGeneral() {
  const userProfile = localStorage.getItem('userProfile');
  const [currentUser, setCurrentUser] = useState<IUserItem | null>(JSON.parse(userProfile || '{}'));
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userProfileData = await getUserById(currentUser?._id || '');
      if (userProfileData) {
        setCurrentUser(userProfileData);
      }
    };
    fetchUserProfile();
  }, [currentUser?._id]);
  return (
    <UserNewEditForm
      updateUserPage
      currentUser={currentUser}
      typeUser="patient"
      hospitals={[]}
      isSettingAccount
    />
  );
}
