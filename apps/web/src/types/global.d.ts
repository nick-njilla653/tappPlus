declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};
