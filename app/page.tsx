'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IWork } from './types';
import { useClient } from '../api/index';

export default function Home() {
  const client = useClient();

  const [workers, setWorkers] = useState<IWork[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<IWork[]>([]);
  const [newWorkerData, setNewWorkerData] = useState({
    first_name: '',
    last_name: '',
    worker_position: '',
    address: '',
    phone_number: ''
  });
  const [selectedWorker, setSelectedWorker] = useState<IWork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState<'asc' | 'desc'>('asc');

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/workers');
      const sortedWorkers = response.data.sort((a: IWork, b: IWork) =>
        sortType === 'asc' ? a.first_name.localeCompare(b.first_name) : b.first_name.localeCompare(a.first_name)
      );

      const updatedWorkers = updateWorkerIds(sortedWorkers);
      setWorkers(updatedWorkers);
      setFilteredWorkers(updatedWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortType]);

  useEffect(() => {
    const filtered = workers.filter(
      (worker) =>
        worker.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.worker_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkers(filtered);
  }, [searchTerm, workers]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewWorkerData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await client.addWorker(newWorkerData);
      setNewWorkerData({
        first_name: '',
        last_name: '',
        worker_position: '',
        address: '',
        phone_number: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding worker:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await client.deleteWorker(id);
      const updatedWorkers = workers.filter(worker => worker.id !== id);
      setWorkers(updatedWorkers);
      setFilteredWorkers(updatedWorkers);
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  };

  const handleEdit = (worker: IWork) => {
    setNewWorkerData({
      first_name: worker.first_name,
      last_name: worker.last_name,
      worker_position: worker.worker_position,
      address: worker.address,
      phone_number: worker.phone_number
    });
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedWorker(null);
    setIsModalOpen(false);
  };

  const handleModalSubmit = async () => {
    try {
      if (!selectedWorker) return; 
      await client.updateWorker(selectedWorker.id, newWorkerData); 
      setIsModalOpen(false);
      setSelectedWorker(null);
      fetchData();
    } catch (error) {
      console.error('Error updating worker:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };
  
  useEffect(() => {
    const filtered = workers.filter(
      (worker) =>
        worker.first_name.toLowerCase().includes(searchTerm) ||
        worker.last_name.toLowerCase().includes(searchTerm) ||
        worker.worker_position.toLowerCase().includes(searchTerm) ||
        worker.address.toLowerCase().includes(searchTerm) ||
        worker.phone_number.toLowerCase().includes(searchTerm) ||
        worker.id.toString() === searchTerm // Dodajemo proveru za ID
    );
    setFilteredWorkers(filtered);
  }, [searchTerm, workers]);

  const updateWorkerIds = (workers: IWork[]) => {
    return workers.map((worker, index) => ({ ...worker, id: index + 1 }));
  };
  const handleSearchSubmit = async () => {
    try {
      const response = await axios.get('http://localhost:3001/workers/search', {
        params: {
          searchTerm: searchTerm
        }
      });
      const filteredData = response.data;
      setFilteredWorkers(filteredData);
    } catch (error) {
      console.error('Error searching workers:', error);
    }
  };
  
  return (
<div className="overflow-x-auto">
       <div className="flex items-center space-x-4">
       <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange}  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 text-white focus:ring-blue-500"/>
    <button
      onClick={handleSearchSubmit}
     className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >Search
    </button>
</div>

  <form onSubmit={handleSubmit} className="mb-8">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-red-800 text-sm font-bold mb-2">First Name:</label>
        <input 
          type="text" 
          name="first_name" 
          value={newWorkerData.first_name} 
          onChange={handleInputChange} 
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white" 
        />
      </div>
      <div>
        <label className="block text-red-800 text-sm font-bold mb-2">Last Name:</label>
        <input 
          type="text" 
          name="last_name" 
          value={newWorkerData.last_name} 
          onChange={handleInputChange} 
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white" 
        />
      </div>
      <div>
        <label className="block text-red-800 text-sm font-bold mb-2">Position:</label>
        <input 
          type="text" 
          name="worker_position" 
          value={newWorkerData.worker_position} 
          onChange={handleInputChange} 
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white" 
        />
      </div>
      <div>
        <label className="block text-red-800 text-sm font-bold mb-2">Address:</label>
        <input 
          type="text" 
          name="address" 
          value={newWorkerData.address} 
          onChange={handleInputChange} 
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white" 
        />
      </div>
      <div>
        <label className="block text-red-800 text-sm font-bold mb-2">Phone Number:</label>
        <input 
          type="text" 
          name="phone_number" 
          value={newWorkerData.phone_number} 
          onChange={handleInputChange} 
          className="border border-blue-300 p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-300 text-white" 
        />
      </div>
    </div>
    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300">Create Worker</button>
  </form>
  <table className="table w-full">
    <thead>
      <tr>
        <th className="px-4 py-2">ID</th>
        <th className="px-4 py-2">Name</th>
        <th className="px-4 py-2">Position</th>
        <th className="px-4 py-2">Address</th>
        <th className="px-4 py-2">Phone Number</th>
        <th className="px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {workers.map((worker: IWork) => (
        <tr key={worker.id}>
          <td className="border px-4 py-2">{worker.id}</td>
          <td className="border px-4 py-2">{worker.first_name} {worker.last_name}</td>
          <td className="border px-4 py-2">{worker.worker_position}</td>
          <td className="border px-4 py-2">{worker.address}</td>
          <td className="border px-4 py-2">{worker.phone_number}</td>
          <td className="border px-4 py-2">
            <button onClick={() => handleDelete(worker.id)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300">Delete</button>
            <button onClick={() => handleEdit(worker)} className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 ml-2">Edit</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  {isModalOpen && (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl sm:max-w-4xl sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" onClick={handleModalClose} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring focus:ring-blue-300">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Edit Worker</h2>
            <form onSubmit={handleModalSubmit} className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-800">First Name:</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={newWorkerData.first_name || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-blue-300 rounded-md text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-800">Last Name:</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={newWorkerData.last_name || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-blue-300 rounded-md text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-800">Position:</label>
                  <input 
                    type="text" 
                    name="worker_position" 
                    value={newWorkerData.worker_position || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-blue-300 rounded-md text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-800">Address:</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={newWorkerData.address || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-blue-300 rounded-md text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-800">Phone Number:</label>
                  <input 
                    type="text" 
                    name="phone_number" 
                    value={newWorkerData.phone_number || ''} 
                    onChange={handleInputChange} 
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-blue-300 rounded-md text-white" 
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" onClick={handleModalSubmit} className="mr-2 py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-red-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"onClick={handleModalSubmit}>Update Worker </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
}

