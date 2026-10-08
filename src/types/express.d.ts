declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'ADMIN' | 'CASHIER';
      };
    }
  }
}

export {};
