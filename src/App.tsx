import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import './App.css';
import { APP_ROUTES } from './constant';
import { store } from './store/store';
import ChatList from './pages/ChatList';
import ChatRoomPage from './pages/ChatRoomPage';
import Invitations from './pages/Invitations';
import SentInvitations from './pages/SentInvitations';
import PrivateChat from './components/PrivateChat/PrivateChat';
import Messages from './pages/Messages';

const AuthoPage = lazy(() => import('./routes/AuthRoute'));
const UserRoute = lazy(() => import('./routes/UserRoute'));

function App() {
  const theme = createTheme({
    primaryColor: 'goldenDream',
    primaryShade: 5,
    colors: {
      goldenDream: [
        '#fdfde9',
        '#fbfcc5',
        '#faf88e',
        '#f7ed4d',
        '#f2dc1d',
        '#e9ca10',
        '#c39a0b',
        '#9c6f0c',
        '#815812',
        '#6e4815',
        '#402608',
      ],
    },
    fontFamily: 'Inter var, ui-sans-serif, system-ui, sans-serif',
    defaultRadius: 'md',
    components: {
      Input: {
        styles: {
          root: { '&:focus': { borderColor: '#e9ca10' } }
        },
      },
      Button: {
        defaultProps: {
          color: 'goldenDream',
        },
      },
    },
  });


  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications position="bottom-right" zIndex={1000} />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path={APP_ROUTES.LOGIN} element={<AuthoPage />} />
                <Route path={APP_ROUTES.REGISTER} element={<AuthoPage />} />
                <Route path="/*" element={<UserRoute />} />
                <Route path="/chat" element={<ChatList />} />
                <Route path="/chat/:startupId" element={<ChatRoomPage />} />
                <Route path="/invitations" element={<Invitations />} />
                <Route path="/sent-invitations" element={<SentInvitations />} />
                <Route path="/private-chat/:chatRoomId" element={<PrivateChat />} />
                <Route path="/messages" element={<Messages />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </MantineProvider>
    </Provider>
  );
}

export default App;