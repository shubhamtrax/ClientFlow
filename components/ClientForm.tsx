
import React, { useState } from 'react';
import type { Client } from '../types';

interface ClientFormProps {
    client?: Client | null;
    onSave: (client: Omit<Client, 'id'> | Client) => void;
    onCancel: () => void;
}

const countryCodes = [
    { code: '+1', name: 'USA/Canada' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+91', name: 'India' },
    { code: '+61', name: 'Australia' },
    { code: '+49', name: 'Germany' },
    { code: '+81', name: 'Japan' },
    { code: '+86', name: 'China' },
    { code: '+33', name: 'France' },
];

const parsePhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return { code: '+1', number: '' };
    const knownCode = countryCodes.find(c => phoneNumber.startsWith(c.code + ' '));
    if (knownCode) {
        return { code: knownCode.code, number: phoneNumber.substring(knownCode.code.length + 1) };
    }
    // Fallback for numbers without space or unknown codes
    const parts = phoneNumber.split(' ');
    if (parts.length > 1 && parts[0].startsWith('+')) {
        return { code: parts[0], number: parts.slice(1).join(' ') };
    }
    return { code: '+1', number: phoneNumber };
};

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
    const [name, setName] = useState(client?.name || '');
    const [email, setEmail] = useState(client?.email || '');
    const [company, setCompany] = useState(client?.company || '');
    const [logo, setLogo] = useState(client?.logo || '');
    const [phoneParts, setPhoneParts] = useState(parsePhoneNumber(client?.phone));

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneChange = (part: 'code' | 'number', value: string) => {
        setPhoneParts(prev => ({ ...prev, [part]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullPhoneNumber = phoneParts.number ? `${phoneParts.code} ${phoneParts.number}`.trim() : '';
        const clientData = { name, email, company, logo, phone: fullPhoneNumber };
        if (client) {
            onSave({ ...client, ...clientData });
        } else {
            onSave(clientData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
             <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                        value={phoneParts.code}
                        onChange={e => handlePhoneChange('code', e.target.value)}
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {countryCodes.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                    </select>
                    <input
                        type="tel"
                        id="phone"
                        value={phoneParts.number}
                        onChange={e => handlePhoneChange('number', e.target.value)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="555-123-4567"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                    {logo && <img src={logo} alt="Logo Preview" className="h-16 w-16 rounded-full object-cover bg-gray-100" />}
                    <input type="file" id="logo" onChange={handleLogoChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save Client</button>
            </div>
        </form>
    );
};

export default ClientForm;