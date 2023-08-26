const BACKEND_ROUTE = 'http://localhost:5000';

export const fetchAPIRequest = async (route, method, bodyData = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (method === 'GET') {
    // append payload to path
  } else {
    options.body = JSON.stringify(bodyData);
  }

  if (localStorage.getItem('token')) {
    options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }

  const response = await fetch(`${BACKEND_ROUTE}${route}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message.slice(3, -4));
  }

  return data;
};
