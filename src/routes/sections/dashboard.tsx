import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { AuthGuard } from 'src/auth/guard'
import DashboardLayout from 'src/layouts/dashboard'

import { LoadingScreen } from 'src/components/loading-screen'

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'))
const OverviewEcommercePage = lazy(
  () => import('src/pages/dashboard/ecommerce')
)
const OverviewAnalyticsPage = lazy(
  () => import('src/pages/dashboard/analytics')
)
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'))
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'))
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'))

// PRODUCT
const ProductDetailsPage = lazy(
  () => import('src/pages/dashboard/product/details')
)
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'))
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'))
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'))

// CASE
const CaseListPage = lazy(() => import('src/pages/dashboard/case/list'))
const CaseDetailsPage = lazy(() => import('src/pages/dashboard/case/details'))

// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'))
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'))

// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'))
const InvoiceDetailsPage = lazy(
  () => import('src/pages/dashboard/invoice/details')
)
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'))
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'))
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'))
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'))
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'))
const UserDoctorListPage = lazy(
  () => import('src/pages/dashboard/user/list-doctor')
)
const UserEmployeeListPage = lazy(
  () => import('src/pages/dashboard/user/list-employee')
)
const UserPatientListPage = lazy(
  () => import('src/pages/dashboard/user/list-patient')
)
const SpecialtiesListPage = lazy(
  () => import('src/pages/dashboard/specialties/list')
)
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'))
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'))
const SpecialtyCreatePage = lazy(
  () => import('src/pages/dashboard/specialties/new')
)
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'))
// BOOKING
const BookingListPage = lazy(
  () => import('src/pages/dashboard/create-booking/list')
)
const BookingCreatePage = lazy(
  () => import('src/pages/dashboard/create-booking/new')
)
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'))
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'))
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'))
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'))
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'))
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'))
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'))
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'))
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'))
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'))
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'))
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'))
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'))
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'))
const MailPage = lazy(() => import('src/pages/dashboard/mail'))
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'))
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'))
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(
  () => import('src/pages/dashboard/permission')
)
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'))

// Pharmacy Page
const PharmacyListPage = lazy(() => import('src/pages/dashboard/pharmacy/list'))
const PharmacyCreatePage = lazy(
  () => import('src/pages/dashboard/pharmacy/new')
)

// Hospital Page
const HospitalListPage = lazy(() => import('src/pages/dashboard/hospital/list'))
const HospitalCreatePage = lazy(
  () => import('src/pages/dashboard/hospital/new')
)

const ProviderRankingPage = lazy(
  () => import('src/pages/dashboard/provider-ranking/list')
)
const ProviderRankingCreatePage = lazy(
  () => import('src/pages/dashboard/provider-ranking/new')
)

// Medicine
const MedicineListPage = lazy(() => import('src/pages/dashboard/medicine/list'))
const MedicineCreatePage = lazy(
  () => import('src/pages/dashboard/medicine/new')
)
const MedicineImportUpdatePage = lazy(
  () => import('src/pages/dashboard/medicine/import-update')
)
const MedicineImportNewPage = lazy(
  () => import('src/pages/dashboard/medicine/import')
)

// APPOINTMENT
const AppointmentListPage = lazy(
  () => import('src/pages/dashboard/appointment/list')
)
const AppointmentDetailsPage = lazy(
  () => import('src/pages/dashboard/appointment/details')
)

// ----------------------------------------------------------------------

// Config
const ConfigEditorPage = lazy(
  () => import('src/pages/dashboard/config-editor/editor')
)

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'create-booking', element: <BookingCreatePage /> },
      { path: 'list-booking', element: <BookingListPage /> },
      { path: 'config', element: <ConfigEditorPage /> },
      {
        path: 'user',
        children: [
          { element: <UserDoctorListPage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'list-doctor', element: <UserDoctorListPage /> },
          { path: 'list-employee', element: <UserEmployeeListPage /> },
          { path: 'list-patient', element: <UserPatientListPage /> },
          { path: 'new', element: <UserCreatePage typeUser="user" /> },
          { path: 'new-doctor', element: <UserCreatePage typeUser="doctor" /> },
          {
            path: 'new-employee',
            element: <UserCreatePage typeUser="employee" />
          },
          {
            path: 'new-patient',
            element: <UserCreatePage typeUser="patient" />
          },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> }
        ]
      },
      {
        path: 'specialties',
        children: [
          { element: <SpecialtiesListPage />, index: true },
          { path: 'list', element: <SpecialtiesListPage /> },
          { path: 'new', element: <SpecialtyCreatePage /> }
        ]
      },
      {
        path: 'pharmacy',
        children: [
          { element: <PharmacyListPage />, index: true },
          { path: 'list', element: <PharmacyListPage /> },
          { path: 'new', element: <PharmacyCreatePage /> }
        ]
      },
      {
        path: 'appointment',
        children: [
          { path: 'list', element: <AppointmentListPage /> },
          { path: '', element: <AppointmentListPage /> },
          { path: 'details', element: <AppointmentDetailsPage /> }
        ]
      },
      {
        path: 'hospital',
        children: [
          { path: 'list', element: <HospitalListPage /> },
          { path: 'new', element: <HospitalCreatePage /> }
        ]
      },
      {
        path: 'ranking',
        children: [
          { path: 'list', element: <ProviderRankingPage /> },
          { path: 'new', element: <ProviderRankingCreatePage /> }
        ]
      },
      {
        path: 'medicine',
        children: [
          { path: 'list', element: <MedicineListPage /> },
          { path: 'new', element: <MedicineCreatePage /> },
          { path: 'import-update', element: <MedicineImportUpdatePage /> },
          { path: 'import', element: <MedicineImportNewPage /> }
        ]
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> }
        ]
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> }
        ]
      },
      {
        path: 'case',
        children: [
          { element: <CaseListPage />, index: true },
          { path: 'list', element: <CaseListPage /> },
          { path: 'new', element: <CaseDetailsPage /> }
        ]
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> }
        ]
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> }
        ]
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> }
        ]
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> }
        ]
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> }
    ]
  }
]
