import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import './App.css';
import { APP_ROUTES } from './constant';
// import { store } from './store/store';

// const AuthoPage = lazy(() => import('./routes/AuthRoute'));
// const UserRoute = lazy(() => import('./routes/UserRoute'));

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
                {/* <Route path={APP_ROUTES.LOGIN} element={<AuthoPage />} />
                <Route path={APP_ROUTES.REGISTER} element={<AuthoPage />} />
                <Route path="/*" element={<UserRoute />} /> */}
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </MantineProvider>
    </Provider>
  );
}

export default App;