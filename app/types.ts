export interface IWork {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  worker_position: string; // Promenjeno ime polja iz "position" u "worker_position"
}
