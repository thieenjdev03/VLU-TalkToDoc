import { useMemo } from 'react'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

// import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color'

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
)

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  drug: icon('ic_drug'),
  medical: icon('ic_medical')
}

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate()
  const userProfile = localStorage.getItem('userProfile')
  const user = userProfile ? JSON.parse(userProfile) : {}

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: t('overview'),
      //   items: [
      //     {
      //       title: t('app'),
      //       path: paths.dashboard.root,
      //       icon: ICONS.dashboard,
      //     },
      //     {
      //       title: t('ecommerce'),
      //       path: paths.dashboard.general.ecommerce,
      //       icon: ICONS.ecommerce,
      //     },
      //     {
      //       title: t('analytics'),
      //       path: paths.dashboard.general.analytics,
      //       icon: ICONS.analytics,
      //     },
      //     {
      //       title: t('banking'),
      //       path: paths.dashboard.general.banking,
      //       icon: ICONS.banking,
      //     },
      //     {
      //       title: t('booking'),
      //       path: paths.dashboard.general.booking,
      //       icon: ICONS.booking,
      //     },
      //     {
      //       title: t('file'),
      //       path: paths.dashboard.general.file,
      //       icon: ICONS.file,
      //     },
      //   ],
      // },

      // Admin Navigation
      // ----------------------------------------------------------------------
      {
        hidden: user?.role !== 'ADMIN',
        subheader: t('Thống kê chung - Quản Trị Viên'),
        items: [
          {
            hidden: user?.role !== 'ADMIN',
            title: t('Thống Kê'),
            path: paths.dashboard.invoice.root,
            icon: ICONS.analytics,
            children: [
              {
                title: t('Thống Kê Chung'),
                path: paths.dashboard.root
              },
              {
                title: t('Giao Dịch'),
                path: paths.dashboard.invoice.root
              },
              {
                title: t('Doanh Thu Bác Sĩ'),
                path: paths.dashboard.report.revenue
              },
              {
                title: t('Báo cáo đánh giá'),
                path: paths.dashboard.report.review_doctor
              },
              {
                title: t('Doanh Thu TalkToDoc'),
                path: paths.dashboard.report.revenue_ttd
              },
              {
                title: t('Lịch hẹn'),
                path: paths.dashboard.report.appointment
              },
              {
                title: t('Chuyên khoa'),
                path: paths.dashboard.report.specialty
              }
            ]
          }
        ]
      },
      {
        hidden: user?.role !== 'ADMIN',
        subheader: t('Quản lý hệ thống - Quản Trị Viên'),
        items: [
          // Patient Role
          {
            hidden: user?.role !== 'PATIENT',
            title: t('Quản lý lịch hẹn'),
            path: paths.dashboard.appointment.root,
            icon: ICONS.medical,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.appointment.list }
            ]
          },
          {
            hidden: user?.role !== 'PATIENT',
            title: t('Hồ sơ bệnh án'),
            path: paths.dashboard.medicalRecord.root,
            icon: ICONS.medical,
            children: [
              {
                title: t('Danh Sách'),
                path: paths.dashboard.medicalRecord.list
              }
            ]
          },
          // {
          //   hidden: user?.role !== 'PATIENT',
          //   title: t('Quản lý tài khoản'),
          //   path: paths.dashboard.account.root,
          //   icon: ICONS.user,
          //   children: [
          //     { title: t('Thông tin cá nhân'), path: paths.dashboard.account.profile },
          //     { title: t('Đổi mật khẩu'), path: paths.dashboard.account.changePassword },
          //     { title: t('Xoá tài khoản'), path: paths.dashboard.account.delete },
          //   ],
          // },
          // {
          //   hidden: user?.role !== 'PATIENT',
          //   title: t('Quản lý toa thuốc'),
          //   path: paths.dashboard.prescription.root,
          //   icon: ICONS.medical,
          //   children: [{ title: t('Danh sách'), path: paths.dashboard.prescription.list }],
          // },
          // USER
          {
            hidden: user?.role !== 'ADMIN',
            title: t('Quản Lý Người Dùng'),
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              // { title: t('Thông tin'), path: paths.dashboard.user.root },
              // { title: t('cards'), path: paths.dashboard.user.cards },
              {
                title: t('Bệnh Nhân'),
                path: paths.dashboard.user.list_patient
              },
              {
                title: t('Nhân viên'),
                path: paths.dashboard.user.list_employee
              },
              { title: t('Bác Sĩ'), path: paths.dashboard.user.list_doctor }
              // { title: t('Tạo Người Dùng'), path: paths.dashboard.user.new },
              // { title: t('Chỉnh Sửa Thông Tin Cá Nhân'), path: paths.dashboard.user.demo.edit },
              // { title: t('Thông Tin Tài Khoản'), path: paths.dashboard.user.account },
            ]
          },

          // Specialties
          {
            hidden: user?.role !== 'ADMIN',
            title: t('Danh Mục'),
            path: paths.dashboard.specialties.root,
            icon: ICONS.medical,
            children: [
              {
                title: t('Chuyên Khoa'),
                path: paths.dashboard.specialties.root
              },
              { title: t('Nhà Thuốc'), path: paths.dashboard.pharmacies.list },
              {
                title: t('Cấp Bậc'),
                path: paths.dashboard.ranking_doctor.list
              },
              { title: t('Bệnh Viện'), path: paths.dashboard.hospital.list },
              { title: t('Thuốc'), path: paths.dashboard.medicine.list },
              {
                title: t('Cấu hình chức năng'),
                path: paths.dashboard.config.root
              }
            ]
          },
          // {
          //   title: t('Quản Lý Nhà Thuốc'),
          //   path: paths.dashboard.job.root,
          //   icon: ICONS.job,
          //   children: [
          //     { title: t('Danh Sách'), path: paths.dashboard.pharmacies.list },
          //     // { title: t('details'), path: paths.dashboard.job.demo.details },
          //     // { title: t('create'), path: paths.dashboard.job.new },
          //     // { title: t('edit'), path: paths.dashboard.job.demo.edit },
          //   ],
          // },
          // PRODUCT
          // {
          //   hidden: user?.role !== 'ADMIN',
          //   title: t('Quản Lý Thuốc'),
          //   path: paths.dashboard.product.root,
          //   icon: ICONS.medical,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.product.root },
          //     {
          //       title: t('details'),
          //       path: paths.dashboard.product.demo.details,
          //     },
          //     { title: t('create'), path: paths.dashboard.product.new },
          //     { title: t('edit'), path: paths.dashboard.product.demo.edit },
          //   ],
          // },
          // // JOB
          {
            hidden: user?.role !== 'ADMIN',
            title: t('Quản lý lịch hẹn'),
            path: paths.dashboard.appointment.root,
            icon: ICONS.medical,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.appointment.list }
            ]
          },
          // // ORDER
          {
            hidden: user?.role !== 'ADMIN',
            title: t('Quản Lý Bệnh Án'),
            path: paths.dashboard.case.root,
            icon: ICONS.order,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.case.list }
            ]
          },

          // // INVOICE
          // {
          //   hidden: user?.role !== 'ADMIN',
          //   title: t('Thanh Toán'),
          //   path: paths.dashboard.invoice.root,
          //   icon: ICONS.invoice,
          //   children: [
          //     { title: t('Danh Sách'), path: paths.dashboard.invoice.root }
          //     // {
          //     //   title: t('details'),
          //     //   path: paths.dashboard.invoice.demo.details,
          //     // },
          //     // { title: t('Tạo Hóa Đơn'), path: paths.dashboard.invoice.new },
          //     // { title: t('edit'), path: paths.dashboard.invoice.demo.edit },
          //   ]
          // },
          {
            title: t('chat'),
            path: paths.dashboard.chat,
            icon: ICONS.chat
          }
          // // // BLOG
          // {
          //   title: t('blog'),
          //   path: paths.dashboard.post.root,
          //   icon: ICONS.blog,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.post.root },
          //     { title: t('details'), path: paths.dashboard.post.demo.details },
          //     { title: t('create'), path: paths.dashboard.post.new },
          //     { title: t('edit'), path: paths.dashboard.post.demo.edit },
          //   ],
          // },

          // // // TOUR
          // {
          //   title: t('tour'),
          //   path: paths.dashboard.tour.root,
          //   icon: ICONS.tour,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.tour.root },
          //     { title: t('details'), path: paths.dashboard.tour.demo.details },
          //     { title: t('create'), path: paths.dashboard.tour.new },
          //     { title: t('edit'), path: paths.dashboard.tour.demo.edit },
          //   ],
          // },

          // // FILE MANAGER
          // {
          //   title: t('file_manager'),
          //   path: paths.dashboard.fileManager,
          //   icon: ICONS.folder,
          // },

          // // MAIL
          // {
          //   title: t('mail'),
          //   path: paths.dashboard.mail,
          //   icon: ICONS.mail,
          //   info: <Label color="error">+32</Label>,
          // },

          // // CHAT
          // {
          //   title: t('chat'),
          //   path: paths.dashboard.chat,
          //   icon: ICONS.chat,
          // },

          // // CALENDAR
          // {
          //   title: t('calendar'),
          //   path: paths.dashboard.calendar,
          //   icon: ICONS.calendar,
          // },

          // // // KANBAN
          // // {
          // //   title: t('kanban'),
          // //   path: paths.dashboard.kanban,
          // //   icon: ICONS.kanban,
          // // },
        ]
      },

      // BÁC SĨ Navigation
      {
        hidden: user?.role !== 'DOCTOR',
        subheader: t('Quản lý hệ thống - Bác Sĩ'),
        items: [
          // Patient Role

          {
            hidden:
              user?.role !== 'DOCTOR' ||
              user?.registrationStatus !== 'approved',
            title: t('Quản lý lịch hẹn'),
            path: paths.dashboard.appointment.root,
            icon: ICONS.medical,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.appointment.list }
            ]
          },
          {
            hidden:
              user?.role !== 'DOCTOR' ||
              user?.registrationStatus !== 'approved',
            title: t('Quản lý bệnh án'),
            path: paths.dashboard.case.root,
            icon: ICONS.order,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.case.list }
            ]
          },
          // {
          //   hidden:
          //     user?.role !== 'DOCTOR' ||
          //     user?.registrationStatus !== 'approved',
          //   title: t('Quản lý toa thuốc'),
          //   path: paths.dashboard.prescription.root,
          //   icon: ICONS.medical,
          //   children: [
          //     { title: t('Danh sách'), path: paths.dashboard.prescription.list }
          //   ]
          // },
          {
            hidden: user?.role !== 'DOCTOR',
            title: t('Quản lý tài khoản'),
            path: paths.dashboard.account.root,
            icon: ICONS.user,
            children: [
              {
                title: t('Cập nhật thông tin'),
                path: paths.dashboard.user.account
              }
            ]
          }
        ]
      },
      // BỆNH NHÂN Navigation
      {
        hidden: user?.role !== 'PATIENT',
        subheader: t('Quản lý hệ thống - Bệnh Nhân'),
        items: [
          // Patient Role
          {
            hidden: user?.role !== 'PATIENT',
            title: t('Quản lý lịch hẹn'),
            path: paths.dashboard.appointment.root,
            icon: ICONS.medical,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.appointment.list }
            ]
          },
          {
            title: t('chat'),
            path: paths.dashboard.chat,
            icon: ICONS.chat
          },
          {
            hidden: user?.role !== 'PATIENT',
            title: t('Quản Lý Bệnh Án'),
            path: paths.dashboard.case.root,
            icon: ICONS.order,
            children: [
              { title: t('Danh Sách'), path: paths.dashboard.case.list }
            ]
          }
          // {
          //   hidden: user?.role !== 'PATIENT',
          //   title: t('Hồ sơ bệnh án'),
          //   path: paths.dashboard.medicalRecord.root,
          //   icon: ICONS.medical,
          //   children: [
          //     {
          //       title: t('Danh Sách'),
          //       path: paths.dashboard.medicalRecord.list
          //     }
          //   ]
          // }
          // {
          //   hidden: user?.role !== 'PATIENT',
          //   title: t('Quản lý tài khoản'),
          //   path: paths.dashboard.account.root,
          //   icon: ICONS.user,
          //   children: [
          //     { title: t('Thông tin cá nhân'), path: paths.dashboard.account.profile },
          //     { title: t('Đổi mật khẩu'), path: paths.dashboard.account.changePassword },
          //     { title: t('Xoá tài khoản'), path: paths.dashboard.account.delete },
          //   ],
          // },
          // {
          //   hidden: user?.role !== 'PATIENT',
          //   title: t('Quản lý toa thuốc'),
          //   path: paths.dashboard.prescription.root,
          //   icon: ICONS.medical,
          //   children: [{ title: t('Danh sách'), path: paths.dashboard.prescription.list }],
          // },
        ]
      }
      // // DEMO MENU STATES
      // {
      //   subheader: t(t('other_cases')),
      //   items: [
      //     {
      //       // default roles : All roles can see this entry.
      //       // roles: ['user'] Only users can see this item.
      //       // roles: ['admin'] Only admin can see this item.
      //       // roles: ['admin', 'manager'] Only admin/manager can see this item.
      //       // Reference from 'src/guards/RoleBasedGuard'.
      //       title: t('item_by_roles'),
      //       path: paths.dashboard.permission,
      //       icon: ICONS.lock,
      //       roles: ['admin', 'manager'],
      //       caption: t('only_admin_can_see_this_item'),
      //     },
      //     {
      //       title: t('menu_level'),
      //       path: '#/dashboard/menu_level',
      //       icon: ICONS.menuItem,
      //       children: [
      //         {
      //           title: t('menu_level_1a'),
      //           path: '#/dashboard/menu_level/menu_level_1a',
      //         },
      //         {
      //           title: t('menu_level_1b'),
      //           path: '#/dashboard/menu_level/menu_level_1b',
      //           children: [
      //             {
      //               title: t('menu_level_2a'),
      //               path: '#/dashboard/menu_level/menu_level_1b/menu_level_2a',
      //             },
      //             {
      //               title: t('menu_level_2b'),
      //               path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b',
      //               children: [
      //                 {
      //                   title: t('menu_level_3a'),
      //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3a',
      //                 },
      //                 {
      //                   title: t('menu_level_3b'),
      //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3b',
      //                 },
      //               ],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       title: t('item_disabled'),
      //       path: '#disabled',
      //       icon: ICONS.disabled,
      //       disabled: true,
      //     },
      //     {
      //       title: t('item_label'),
      //       path: '#label',
      //       icon: ICONS.label,
      //       info: (
      //         <Label color="info" startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}>
      //           NEW
      //         </Label>
      //       ),
      //     },
      //     {
      //       title: t('item_caption'),
      //       path: '#caption',
      //       icon: ICONS.menuItem,
      //       caption:
      //         'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
      //     },
      //     {
      //       title: t('item_external_link'),
      //       path: 'https://www.google.com/',
      //       icon: ICONS.external,
      //     },
      //     {
      //       title: t('blank'),
      //       path: paths.dashboard.blank,
      //       icon: ICONS.blank,
      //     },
      //   ],
      // },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, user?.role]
  )

  return data
}
