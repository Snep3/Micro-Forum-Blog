import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import PostsPage from './components/PostsPage';

function App() {
  const [token, setToken] = useState(''); //set userinfo

  //on logout clears userinfo
  const logout = () => {
    setToken('');
  };
//if user not connected will show loginpage
  if (!token) {
    return <LandingPage onLogin={setToken} />;
  }
//if user connected will show postpage
  return <PostsPage token={token} onLogout={logout} />;
}

export default App;
