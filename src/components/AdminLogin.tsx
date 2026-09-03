const handleLogin = async (e: 
React.FormEvent) => {
  e.preventDefault(); try { const response 
    = await fetch('/api/admin/login', {
      method: 'POST', headers: { 
      'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ username, 
      password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) { 
      localStorage.setItem('adminToken', 
      data.token);
      // Login successful hone ke baad 
      // dashboard par redirect karein
      window.location.href = 
      '/admin/dashboard';
    } else {
      alert(data.error || 'Invalid 
      credentials');
    }
  } catch (err) {
    console.error('Login error:', err); 
    alert('Server connection failed');
  }
};
