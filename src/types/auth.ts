export type UserRole = 'admin' | 'user';

export interface AppUser {
    user_id: number;
    username: string;
    role: UserRole;
}