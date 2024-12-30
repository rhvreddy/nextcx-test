// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';

// auth provider
import {FirebaseProvider as AuthProvider} from 'contexts/FirebaseContext';
import PollingManager from "./components/PollingManager/PollingManager";
import {useEffect} from "react";
import {mainAppName} from "./consts";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  useEffect(() => {
    document.title = mainAppName ? `${mainAppName} - APP GPT` : "NextCX - APP GPT";
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/sia-favicon-icon.png" : "https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png";
    document.head.appendChild(link);

    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = mainAppName?.toLowerCase() === "sia" ? "https://d3dqyamsdzq0rr.cloudfront.net/sia/images/sia-favicon-icon.png" : "https://d3dqyamsdzq0rr.cloudfront.net/docubaat/images/nextcx-logo-without-titile.png";
    document.head.appendChild(appleTouchIcon);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(appleTouchIcon);
    };
  }, []);

  return (
    <ThemeCustomization>
      <RTLLayout>
        <ScrollTop>
          <AuthProvider>
            <>
              <Routes/>
              <Snackbar/>
              <PollingManager/>
              <ToastContainer pauseOnFocusLoss={false} limit={1}/>
            </>
          </AuthProvider>
        </ScrollTop>
      </RTLLayout>
    </ThemeCustomization>
  );
};

export default App;

