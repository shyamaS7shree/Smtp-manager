// lib/auth.js
export async function checkAuthenticatedEmail(email) {
  try {
    const response = await fetch('https://api.smtpmaster.org/api/single-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}`
    });

    if (!response.ok) {
      return { success: false, message: 'Email not authenticated' };
    }

    const data = await response.json();
    
    if (data.id && data.email) {
      return { 
        success: true, 
        userData: {
          id: data.id,
          email: data.email,
          name: data.name,
          reg_id: data.reg_id
        }
      };
    }

    return { success: false, message: 'Invalid email' };
  } catch (error) {
    console.error('Auth check error:', error);
    return { success: false, message: 'Authentication service error' };
  }
}