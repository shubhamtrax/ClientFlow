
import React, { useState } from 'react';
import type { Client } from '../types';
import Modal from './Modal';
import ClientForm from './ClientForm';
import { PlusIcon, UserCircleIcon, PencilIcon, TrashIcon } from './icons/Icons';

interface ClientListProps {
    clients: Client[];
    onAddClient: (client: Omit<Client, 'id'>) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleOpenAddModal = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleSaveClient = (clientData: Omit<Client, 'id'> | Client) => {
        if ('id' in clientData) {
            onUpdateClient(clientData);
        } else {
            onAddClient(clientData);
        }
        handleCloseModal();
    };

    return (
        <div className="bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clients</h2>
                <button onClick={handleOpenAddModal} className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Add Client
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map(client => (
                    <div
                        key={client.id}
                        className="p-4 rounded-md bg-gray-50 dark:bg-gray-700 group transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {client.logo ? (
                                    <img src={client.logo} alt={`${client.name}'s logo`} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                )}
                                <div className="ml-4">
                                    <p className="font-semibold text-gray-900 dark:text-white">{client.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.company}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                                    {client.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col items-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEditModal(client)} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => onDeleteClient(client.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <Modal title={editingClient ? 'Edit Client' : 'Add New Client'} onClose={handleCloseModal}>
                    <ClientForm
                        client={editingClient}
                        onSave={handleSaveClient}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ClientList;