import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.gprlab.fiscalia',
  appName: 'Fiscaliz.IA.lab - GPR',
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
