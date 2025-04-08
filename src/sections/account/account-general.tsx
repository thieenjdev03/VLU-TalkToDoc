import UserNewEditForm from '../user/user-new-edit-form';

// ----------------------------------------------------------------------
export default function AccountGeneral() {
  const userProfile = localStorage.getItem('userProfile');
  const currentUser = JSON.parse(userProfile || '{}');
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
