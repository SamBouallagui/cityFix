import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cityfix-app',
  webDir: 'www',
  server: {
      cleartext: true, //allow http requests
    },
};

export default config;
