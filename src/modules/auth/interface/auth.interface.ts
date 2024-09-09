export interface signInUser {
    email: string;
    password: string;
  }
  
  export interface forgotPasswordInterface {
    email?: string;
    password?: string;
  }
  
  export interface Payload {
    id: string;
    email: string;
  }
  
  export interface JwtPayload {
    id: string;
    email: string;
    iat: number;
    exp: number;
  }
  
  export interface UserReq {
    id: string;
    email: string;
    iat: number;
    exp: number;
  }
  