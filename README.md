# Lib to authenticate person through outer OAuth2 server

Allows:
1. add login/logout button in one string
2. add oauth/callback routes in one string
3. ProtectedRoute for app routes
4. exports userObject with login/email and token

## Install

1. Add package
```bash
npm i lib-oauth
```

2. Register on some OAuth2.0 provider with `//auth/callback` callback url, then add environment variables to your `.env` file
```env
REACT_APP_OAUTH_CLIENT_ID=                                          // ◀ OAuth provider clientId
REACT_APP_OAUTH_CLIENT_SECRET=                                      // ◀ OAuth provider Secret
REACT_APP_OAUTH_ENDPOINT=http://localhost:8001                      // ◀ OAuth provider endpoint
REACT_APP_OAUTH_REDIRECT_URL=http://localhost:8000/auth/callback    // ◀ Your app callback url
```

4. Import needed elements to your React app
```js
import {LoginLogoutLink, OAuthRoutes, ProtectedRoute, userObject} from "lib-oauth"
```

3. Init user object with current localStorage object or `null` if empty
```js
const [user, setUser] = React.useState(userObject());

const handleLogin = (user) => {
    console.log('login')
    setUser(user)
}
const handleLogout = () => {
    console.log('logout')
    setUser(null)
}
```

4. Add Login/Logout button to menu
```js
<LoginLogoutLink login="Войти" logout="Выйти" user={user} handleLogout={handleLogout}/>
```

5. Add oauth routes handler to your add routes list
```js
<Routes>
    <Route path="" element={<Home/>}/>
    <Route path="about" element={<About/>}/>
    {OAuthRoutes('/dashboard', handleLogin)}                       // ◀ Add code here
</Routes>
```

6. Use `ProtectedRoute` to authorize user before go somewhere
```js
<Routes>
    <Route path="" element={<Home/>}/>
    <Route path="about" element={<About/>}/>
    <Route element={<ProtectedRoute user={user}/>}>
        <Route path="dashboard" element={<Dashboard/>}/>    // ◀ Add code here
    </Route>
    {OAuthRoutes('/dashboard', handleLogin)}
</Routes>
```
