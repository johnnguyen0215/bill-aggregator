import { Container } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar/index';
import { AuthProvider } from './providers/auth';
import { LoadingProvider } from './providers/loading';
import { BillDataProvider } from './providers/billData';
import { Main } from './pages/Main';
import { RequireAuth } from './router/components/RequireAuth';
import { SignIn } from './pages/SignIn';
import { routes } from './router/routes';
import styles from './styles.module.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BillDataProvider>
          <LoadingProvider>
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
          </LoadingProvider>
        </BillDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
