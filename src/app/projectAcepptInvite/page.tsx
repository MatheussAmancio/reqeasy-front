'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { routerServer } from '@/server/config';

export default function ProjectLinkInput() {
    const router = useRouter();

    const initialFormState = {
        projectLink: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const handleEnterButtonClick = async () => {
        const userDataJSON = localStorage.getItem('userData');
        const userDataObject = JSON.parse(String(userDataJSON));
        console.log('Link do projeto:', formData.projectLink);
        try {
            const response = await axios.post(`${routerServer}/api/invite/invite/${formData.projectLink}`, {
            }, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`
                }
            });
            console.log('Resposta da solicitação:', response.data);
            router.push(`/home`);
        } catch (error) {
            console.error('Erro ao buscar o projeto:', error);
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 justify-center w-full">
            <div className="fixed top-0 left-0 w-full bg-gray-800">
                <Navbar />
            </div>

            <div className="fixed top-10 left-0">
                <Sidebar />
            </div>

            <div className="h-screen ml-48 pt-16 p-10">
                <div className="bg-white rounded p-4 border border-gray-300">
                    <div className="mb-4">
                        <Input
                            title="Codigo do Projeto"
                            type="text"
                            id="projectLink"
                            name="projectLink"
                            value={formData.projectLink}
                            onChange={handleChange}
                            placeholder="Cole o codigo do projeto..."
                        />
                    </div>
                    <div className="text-center">
                        <Button
                            type="button"
                            title="Entrar"
                            onClick={handleEnterButtonClick}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
