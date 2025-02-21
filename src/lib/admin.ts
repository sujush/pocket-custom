// src/lib/admin.ts

export const checkIsAdmin = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAdmin') === 'true';
  };
  
  export const adminLogout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
  };
  
  export const isAdminSessionValid = () => {
    if (typeof window === 'undefined') return false;
    const loginTime = localStorage.getItem('adminLoginTime');
    if (!loginTime) return false;
    
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const isValid = Date.now() - Number(loginTime) < TWO_HOURS;
    
    if (!isValid) {
      adminLogout();
    }
    
    return isValid;
  };