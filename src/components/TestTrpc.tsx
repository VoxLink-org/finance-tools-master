import { useState } from 'react';
import { useGreeting } from '../hooks/useTrpcSwr';

export function TestTrpc() {
  const [name, setName] = useState('');
  const { data, error, isLoading } = useGreeting({ name });

  return (
    <div>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>{data.text}</p>}
    </div>
  );
}