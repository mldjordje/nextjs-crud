import axios from 'axios';

// Definicija interfejsa za strukturu 'NewWorkerData'
export interface NewWorkerData {
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  worker_position: string;
  // Dodajte ostale atribute po potrebi
}

// Funkcija za dobijanje svih radnika
export const getAllWorkers = async () => {
  try {
    const response = await axios.get('http://localhost:3001/workers');
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw new Error('Error fetching workers');
  }
};

// Funkcija za dodavanje novog radnika
export const addWorker = async (newWorkerData: NewWorkerData) => {
  try {
    const response = await axios.post('http://localhost:3001/workers', newWorkerData);
    return response.data;
  } catch (error) {
    console.error('Error adding worker:', error);
    throw new Error('Error adding worker');
  }
};

// Funkcija za brisanje radnika
export const deleteWorker = async (id: number) => {
  try {
    await axios.delete(`http://localhost:3001/workers/${id}`);
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw new Error('Error deleting worker');
  }
};

// Funkcija za ažuriranje radnika
export const updateWorker = async (id: number, updatedWorkerData: NewWorkerData) => {
  try {
    const response = await axios.put(`http://localhost:3001/workers/${id}`, updatedWorkerData);
    return response.data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw new Error('Error updating worker');
  }
};

// Funkcija za pretragu radnika
export const searchWorkers = async (searchTerm: string) => {
  try {
    const response = await axios.get(`http://localhost:3001/workers/search?searchTerm=${searchTerm}`);
    return response.data;
  } catch (error) {
    console.error('Error searching workers:', error);
    throw new Error('Error searching workers');
  }
};

// Izvozite useClient funkciju
export const useClient = () => {
  return {
    getAllWorkers,
    addWorker,
    deleteWorker,
    updateWorker,
    searchWorkers,
    // Dodajte ostale funkcije ovde
  };
};
