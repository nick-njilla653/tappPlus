declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    API_PORT: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    FCM_SERVICE_ACCOUNT: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};
