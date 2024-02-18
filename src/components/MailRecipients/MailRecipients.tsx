'use client';
const people = [
    {
        name: 'Lindsay Walton',
        role: 'Front-end Developer',
        imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Courtney Henry',
        role: 'Designer',
        imageUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Tom Cook',
        role: 'Director, Product Development',
        imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
]
import { ChangeEvent, useState } from 'react';

type ExampleProps = {
    surveyId: string;
};

const Example: React.FC<ExampleProps> = ({ surveyId }) => {
    const [recipientEmail, setRecipientEmail] = useState('');

    const handleInviteClick = async () => {
        try {
            
            const response = await fetch(`/api/surveys/${surveyId}/send-invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipient: recipientEmail }),
            });

            if (response.ok) {
                console.log('Invitation sent successfully');
            } else {
                console.error('Failed to send invitation:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRecipientEmail(e.target.value);
    };

    return (
        <div className="mx-auto max-w-lg p-14 border rounded bg-white bg-opacity-30">
            <div>
                <div className="text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Add team members</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        You haven’t added any team members to your project yet. As the owner of this project, you can manage team
                        member permissions.
                    </p>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex">
                    <label htmlFor="email" className="sr-only">
                        Email address
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={recipientEmail}
                        onChange={handleRecipientChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter an email"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleInviteClick}
                        className="ml-4 flex-shrink-0 rounded-md border border-transparent bg-white text-black px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Send invite
                    </button>
                </form>
            </div>
            <div className="mt-10">
                <h3 className="text-sm font-medium text-gray-500">Team members previously added to projects</h3>
                {people.map((person, personIdx) => (
                    <li key={personIdx} className="flex items-center justify-between space-x-3 py-4">
                        <div className="flex min-w-0 flex-1 items-center space-x-3">
                            <div className="flex-shrink-0">
                                <img className="h-10 w-10 rounded-full" src={person.imageUrl} alt="" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">{person.name}</p>
                                <p className="truncate text-sm font-medium text-gray-500">{person.role}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                className="inline-flex items-center rounded-full border border-transparent bg-gray-100 py-2 px-3 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <span className="text-sm font-medium text-gray-900">
                                    {' '}
                                    Invite <span className="sr-only">{person.name}</span>{' '}
                                </span>
                            </button>
                        </div>
                    </li>
                ))}
            </div>
        </div>
    );
};

export default Example;
