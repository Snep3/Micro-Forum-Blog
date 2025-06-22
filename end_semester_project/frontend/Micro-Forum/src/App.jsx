import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // טעינת פוסטים
  useEffect(() => {
    axios.get(`${API_URL}/posts`)
      .then(res => setPosts(res.data))
      .catch(err => {
        console.error(err);
        setError('שגיאה בטעינת הפוסטים');
        clearMessage();
      });
  }, []);

  const clearMessage = () => {
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
  };

  const register = async () => {
    try {
      await axios.post(`${API_URL}/users/register`, { username, password });
      alert('נרשמת בהצלחה!');
    } catch (err) {
      console.error(err);
      alert('שגיאה ברישום');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/login`, { username, password });
      setToken(res.data.token);
      alert('התחברת בהצלחה!');
    } catch (err) {
      console.error(err);
      alert('שגיאה בהתחברות');
    }
  };

  const createPost = async () => {
    try {
      const res = await axios.post(`${API_URL}/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts([...posts, res.data]);
      setNewPost({ title: '', content: '' });
      setMessage('✅ פוסט נוצר בהצלחה');
      clearMessage();
    } catch (err) {
      console.error(err);
      setError('❌ לא ניתן ליצור פוסט');
      clearMessage();
    }
  };

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      setError('❌ שגיאה במחיקת הפוסט');
      clearMessage();
    }
  };

  const updatePost = async (id) => {
    const title = prompt('כותרת חדשה:');
    const content = prompt('תוכן חדש:');
    try {
      const res = await axios.put(`${API_URL}/posts/${id}`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(p => p._id === id ? res.data : p));
    } catch (err) {
      console.error(err);
      setError('❌ שגיאה בעדכון הפוסט');
      clearMessage();
    }
  };

  return (
    <div style={{ padding: '1rem', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <h2>התחברות / רישום</h2>
      <input placeholder="שם משתמש" value={username} onChange={e => setUsername(e.target.value)} /><br />
      <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={register}>הרשמה</button>
      <button onClick={login}>התחברות</button>

      {message && <div style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

      <h2>יצירת פוסט</h2>
      <input
        placeholder="כותרת"
        value={newPost.title}
        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
      /><br />
      <textarea
        placeholder="תוכן"
        value={newPost.content}
        onChange={e => setNewPost({ ...newPost, content: e.target.value })}
      /><br />
      <button onClick={createPost} disabled={!token}>צור פוסט</button>

      <h2>פוסטים</h2>
      {posts.map(post => (
        <div key={post._id} style={{ border: '1px solid gray', margin: '1rem 0', padding: '1rem' }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>מאת: {post.author?.username || 'לא ידוע'}</small><br />
          {token && (
            <>
              <button onClick={() => updatePost(post._id)}>ערוך</button>
              <button onClick={() => deletePost(post._id)}>מחק</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
