import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '400px',
    margin: '0px auto',
    padding: '2rem',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  input: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  inputFocus: {
    borderColor: '#3b82f6', // blue
  },
  button: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#1e40af',
  },
};
function LoginForm() {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [hovered, setHovered] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // const res = await fetch('http://localhost:4000/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await res.json();
    // if (res.ok) login(data.token, email);
    // else alert(data.error);
  };

  return (
    // <form onSubmit={handleSubmit} style={styles.form}>
    //   <input  value={email} onChange={(e) => setemail(e.target.value)} placeholder="User ID" />
    //   <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
    //   <button type="submit">Login</button>
    // </form>
    <div>
                  <h1>Login</h1>

    <form onSubmit={handleSubmit} style={styles.form}>

      <input
        value={email}
        onChange={(e) => setemail(e.target.value)}
        placeholder="Email"
        style={styles.input}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        style={styles.input}
      />
      <button
        type="submit"
        style={{
          ...styles.button,
          ...(hovered ? styles.buttonHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Login
      </button>
    </form>

    </div>
  );
}

export default LoginForm;