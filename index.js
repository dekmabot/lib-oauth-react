import React from "react";
import {Link, Outlet, Route, useLocation, useNavigate} from "react-router-dom";

export const getAccessToken = () => localStorage.getItem('accessToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')
export const getExpiresAt = () => localStorage.getItem('expiresAt')

export function OAuthRoutes(homepage = "/dashboard", handleLogin) {
    return (
        <Route path="auth">
            <Route path="login" element={<RedirectToLoginElement homepage={homepage}/>}/>
            <Route path="callback" element={<ControllerAuthCallback homepage={homepage} handleLogin={handleLogin}/>}/>
        </Route>
    )
}

export const LoginLogoutLink = (props) => {
    if (props.user) {
        return <LogoutLink {...props} name={props.logout}/>
    } else {
        return <LoginLink {...props} name={props.login}/>
    }
}

export function LoginLink(props) {
    return (
        <Link to="/auth/login" onClick={handleLoginClick}>{props.name}</Link>
    )
}

export function LogoutLink(props) {
    const onCLick = () => {
        handleLogoutClick(props)
    }
    return (
        <Link to="/" onClick={onCLick}>{props.name}</Link>
    )
}

export const ProtectedRoute = (props) => {
    if (!props.user) {
        return redirectToLogin(document.location.pathname)
        // return NotAuthorizedErrorPage();
    }

    return <Outlet/>;
};

function ControllerAuthCallback({homepage, handleLogin}) {
    let clientId = process.env.REACT_APP_OAUTH_CLIENT_ID,
        clientSecret = process.env.REACT_APP_OAUTH_CLIENT_SECRET,
        redirectUrl = process.env.REACT_APP_OAUTH_REDIRECT_URL,
        endpoint = process.env.REACT_APP_OAUTH_ENDPOINT

    let
        searchParams = new URLSearchParams(useLocation().search),
        code = searchParams.get('code'),
        state = searchParams.get('state') ?? null,
        navigate = useNavigate()

    if (code === null) {
        redirectToLogin()
    }

    state = JSON.parse(state)

    const data = (new FormData());
    data.append('grant_type', 'authorization_code')
    data.append('client_id', clientId)
    data.append('client_secret', clientSecret)
    data.append('redirect_uri', redirectUrl)
    data.append('code', code)

    const requestOptions = {
        method: 'POST',
        body: data
    };

    async function getTokenSync() {
        return await (await fetch(endpoint + '/oauth/token', requestOptions)).json()
    }

    const convertCodeToToken = async function () {
        let data = await getTokenSync()

        rememberToken(data)

        let user = userObject()
        handleLogin(user)

        let path = 'redirectTo' in state
            ? state.redirectTo
            : homepage

        navigate(path)
    }

    convertCodeToToken().then()
}

const handleLoginClick = () => {
    redirectToLogin()
}

const handleLogoutClick = (props) => {
    localStorage.clear()
    props.handleLogout()
}

// const authenticate = async () => {
//     if (getRefreshToken()) {
//         try {
//             const token = await refreshTokens() // call an API, returns tokens
//
//             // you will have the exact same setters in your Login page/app too
//             localStorage.setItem('access_token', token.access_token)
//             localStorage.setItem('refresh_token', token.refresh_token)
//
//             return true
//         } catch (error) {
//             redirectToLogin()
//             return false
//         }
//     }
//
//     redirectToLogin()
//     return false
// }

const rememberToken = (data) => {
    let
        accessToken = data.access_token,
        refreshToken = data.refresh_token,
        expiresIn = data.expires_in,
        expiresAt = new Date()

    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('expiresAt', expiresAt.toString())
}

// const refreshTokens = () => {
//     // TODO: refresh token
//     console.log('refresh expired tokens')
// }

function RedirectToLoginElement(props) {
    return redirectToLogin(props.homepage)
}

function redirectToLogin(redirectTo = null) {
    window.location.href = getLoginUrl(redirectTo);
}

function getLoginUrl(redirectTo = null) {
    let clientId = process.env.REACT_APP_OAUTH_CLIENT_ID,
        redirectUrl = process.env.REACT_APP_OAUTH_REDIRECT_URL,
        endpoint = process.env.REACT_APP_OAUTH_ENDPOINT

    let state = null
    if (redirectTo !== null) {
        // console.log('redirect: ' + redirectTo)
        state = JSON.stringify({redirectTo: redirectTo})
    }

    return endpoint + "/oauth/authorize?client_id=" + clientId
        + "&redirect_uri=" + redirectUrl
        + "&response_type=code&scope=&state=" + state
}

// class AuthenticateBeforeRender extends Component {
//     state = {
//         isAuthenticated: false,
//     }
//
//     componentDidMount() {
//         authenticate().then(isAuthenticated => {
//             this.setState({isAuthenticated})
//         })
//     }
//
//     render() {
//         return this.state.isAuthenticated ? this.props.render() : null
//     }
// }
//
// function NotAuthorizedErrorPage() {
//     return <h2>403: Unauthorized</h2>;
// }

export function userObject() {
    if (!getAccessToken() || !getExpiresAt()) {
        return null
    }

    let
        expiresAtDateTime = new Date(getExpiresAt()),
        isExpired = expiresAtDateTime < new Date()
    if (isExpired) {
        //console.log('token expired')
        return null;
    }

    return {
        id: 1,
        name: "User name",
        token: {
            accessToken: getAccessToken(),
            refreshToken: getRefreshToken(),
            expiresAt: getExpiresAt(),
        }
    }
}