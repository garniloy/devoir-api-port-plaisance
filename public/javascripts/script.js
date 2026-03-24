

const btn = document.getElementById('submit-btn');

const email = document.getElementById('email');
const password = document.getElementById('password');

async function loginUser(email, password) {
  try {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    

    if (response.ok && data.success) {
      console.log('✅ Login successful:', data);

      localStorage.setItem('user', JSON.stringify({
        name: data.user_name,
        email: data.user_email
      }));

      
      return true;
    }

    // ❌ Errors (no redirect)
    if (data.message) {
      console.error('❌ Server error:', data.message, data.error);
    } else if (data.issue) {
      console.error('❌ Authentication failed:', data.details);
    } else {
      console.error('❌ Unknown error response:', data);
    }

    return false;

  } catch (err) {
    console.error('❌ Network or parsing error:', err.message);
    return false;
  }
}

btn.addEventListener('click', async () => {
  loginUser(email.value ,password.value)
  const success = await loginUser(email.value, password.value);
  console.log(success)
  window.location.href = '/dashboard';
  
  if (!success) {
    console.log('Login failed — stay on page');
  }
});
