export type TransactionStatus = 'borrowed' | 'return_pending' | 'returned';

export interface ChargerTransaction {
    id: number;
    charger_id: number;
    borrowed_date: string;
    borrowed_time: string;
    borrowed_person: string;
    returned_date: string | null;
    returned_time: string | null;
    returned_person: string | null;
    returned_by_username: string | null;
    approved_by_admin_id: number | null;
    approved_at: string | null;
    status: TransactionStatus;
    created_at: string;
}