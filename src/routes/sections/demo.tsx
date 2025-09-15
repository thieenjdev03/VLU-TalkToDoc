import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import MainLayout from 'src/layouts/main';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// Demo Pages
const ChatSidebarDemoPage = lazy(() => import('src/pages/demo/chat-sidebar-demo'));
const ChatAppointmentDemoPage = lazy(() => import('src/pages/demo/chat-appointment-demo'));
const ChatKeywordDemoPage = lazy(() => import('src/pages/demo/chat-keyword-demo'));
const ChatJsonDemoPage = lazy(() => import('src/pages/demo/chat-json-demo'));

// ----------------------------------------------------------------------

export const demoRoutes = [
  {
    element: (
      <MainLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    ),
    children: [
      {
        path: 'demo',
        children: [
          { path: 'chat-sidebar-demo', element: <ChatSidebarDemoPage /> },
          { path: 'chat-appointment-demo', element: <ChatAppointmentDemoPage /> },
          { path: 'chat-keyword-demo', element: <ChatKeywordDemoPage /> },
          { path: 'chat-json-demo', element: <ChatJsonDemoPage /> },
        ],
      },
    ],
  },
];
