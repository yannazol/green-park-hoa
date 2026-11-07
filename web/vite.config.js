import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import process from 'node:process'

function isPrivateOrLocalHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    ['.localhost', '.local', '.internal', '.lan', '.home', '.intranet'].some((suffix) =>
      host.endsWith(suffix)
    )
  ) {
    return true;
  }
  if (host === '::' || host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) {
    return true;
  }

  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)
  );
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const apiUrl = loadEnv(mode, process.cwd(), '').VITE_API_URL;
    let parsedApiUrl;

    try {
      parsedApiUrl = new URL(apiUrl);
    } catch {
      throw new Error('Set VITE_API_URL to the public HTTPS API base URL before building for production.');
    }

    if (
      parsedApiUrl.protocol !== 'https:' ||
      isPrivateOrLocalHost(parsedApiUrl.hostname) ||
      parsedApiUrl.username ||
      parsedApiUrl.password ||
      parsedApiUrl.search ||
      parsedApiUrl.hash ||
      !parsedApiUrl.pathname.replace(/\/+$/, '').endsWith('/api')
    ) {
      throw new Error('Production VITE_API_URL must use HTTPS, a public host, and end with /api.');
    }
  }

  return {
    plugins: [react()],
  };
})
