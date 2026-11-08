import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.pi.seduc.fiscalizacao',
  appName: 'Fiscalização SEDUC',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#090D16'
    }
  }
};

export default config;
