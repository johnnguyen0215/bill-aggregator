import {
  Container,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/Navbar/index';
import { AuthProvider } from './providers/auth';
import { LoadingProvider } from './providers/loading';
import { BillDataProvider } from './providers/billData';
import { Main } from './pages/Main';
import { RequireAuth } from './router/components/RequireAuth';
import { SignIn } from './pages/SignIn';
import { routes } from './router/routes';
import styles from './styles.module.css';
import { GapiProvider } from './providers/gapi';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <Router>
      <GapiProvider>
        <LoadingProvider>
          <AuthProvider>
            <BillDataProvider>
              <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <NavBar />
                <div className={styles.outerContainer}>
                  <Container>
                    <Routes>
                      <Route exact path={routes.signin} element={<SignIn />} />
                      <Route element={<RequireAuth />}>
                        <Route exact path={routes.main} element={<Main />} />
                      </Route>
                    </Routes>
                  </Container>
                </div>
              </ThemeProvider>
            </BillDataProvider>
          </AuthProvider>
        </LoadingProvider>
      </GapiProvider>
    </Router>
  );
}

export default App;
