import PropTypes from 'prop-types';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';
import {useDispatch, useSelector} from 'react-redux';
import {getUserInfo, login, restrictPath, setLoginState} from '../../store/reducers/profile';
import {appRoles} from "../../config";

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({children}) => {
    // const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const {isLoggedIn, user} = useSelector((state) => state.profile)
    const userId = localStorage.getItem('userId')
    const urlParams = new URLSearchParams(window.location.search);
    const botId = urlParams.get('botId');
    const version = urlParams.get('version');
    const path = window.location.pathname;
    const restrictedPaths = ["/admin", "/bot/multi-agent"];

    useEffect(() => {
        if (userId) {
            dispatch(getUserInfo(userId)).then((res) => {
                setLoginState(res.payload.userInfo)
                if (restrictedPaths.some(pathItem => path.startsWith(pathItem))) {
                    if (!res.payload.userInfo?.appRoles?.includes(appRoles["adminRole"]) && !res.payload.userInfo?.appRoles?.includes(appRoles["superAdminRole"]) && !res.payload.userInfo?.appRoles?.includes(appRoles["masterAdminRole"])) {
                        dispatch(restrictPath(true));
                        navigate("/error-page", {replace: true})
                    } else {
                        dispatch(restrictPath(false));
                    }
                }
            })
        } else {
            navigate('/login', {replace: true})
        }
    }, [dispatch, userId]);

    return children;
};

AuthGuard.propTypes = {
    children: PropTypes.node
};

export default AuthGuard;
