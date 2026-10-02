export type PhoneStatus = 'available' | 'borrowed';

export interface Phone {
    id: number;
    phone_identifier: string;
    description: string | null;
    phone_number: string;
    status: PhoneStatus;
    created_at: string;
}
