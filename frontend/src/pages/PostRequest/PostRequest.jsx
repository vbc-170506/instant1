// pages/PostRequest/PostRequest.jsx
// This now redirects to the service selection flow instead of showing the form directly
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PostRequest = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/services', { replace: true });
  }, [navigate]);

  return null;
};

export default PostRequest;