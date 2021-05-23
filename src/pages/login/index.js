import { Container, Button, Card } from '@material-ui/core';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';
import LoadingContext from '../../contexts/loadingContext';
import useGapi from '../../customHooks/useGapi';
import './style.css';

const LoginPage = () => {
  const gapi = useGapi();

  const { setPending } = useContext(LoadingContext);
  const { isSignedIn, setIsSignedIn } = useContext(AuthContext);
  const history = useHistory();

  const handleSignin = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signIn();
    setIsSignedIn(true);
    history.push('/');
  };

  const handleSignout = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signOut();
    setIsSignedIn(false);
  };

  if (!isSignedIn) {
    gapi.signin2.render('google-signin-button', {
      scope: 'profile email',
      width: 240,
      height: 50,
      longtitle: true,
      theme: 'dark',
    });
  }

  return (
    <Container>
      <div className="cardContainer">
        <Card>
          <div className="body">
            <div className="intro">
              Welcome to this awesome bill aggregator app. Please sign into your
              gmail account.
            </div>

            <div className="buttonContainer">
              {!isSignedIn ? (
                <button
                  className="signinButton"
                  type="button"
                  id="google-signin-button"
                  onClick={handleSignin}
                  onKeyDown={handleSignin}
                />
              ) : (
                <Button
                  className="signoutButton"
                  variant="contained"
                  onClick={handleSignout}
                  color="secondary"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
