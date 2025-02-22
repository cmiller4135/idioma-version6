import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const usePrompt = (message: string, when: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    const handleNavigation = (event: PopStateEvent) => {
      if (when && !window.confirm(message)) {
        event.preventDefault();
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [when, message, navigate, location]);
};

export default usePrompt;
