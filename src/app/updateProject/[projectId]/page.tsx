'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { TextArea } from "@/components/textArea";
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { Priority } from '@/enum/priority';

import { routerServer } from '@/server/config';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ProjectEdit({ params }: { params: { projectId: string } }) {
    const router = useRouter();
    const priorityMapping: Record<string, Priority> = {
        'Muito Alta': Priority.HIGHEST,
        'Alta': Priority.HIGH,
        'Média': Priority.MEDIUM,
        'Baixa': Priority.LOW,
        'Muito Baixa': Priority.VERY_LOW
    };

    const initialFormState: ProjectsInterface = {
        title: '',
        content: '',
        priority: ''
    };

    const [projectData, setProjectData] = useState(initialFormState);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectData({ ...projectData, [event.target.name]: event.target.value });
    }

    useEffect(() => {

        loadProjectData();

    }, [params.projectId]);

    const loadProjectData = async () => {
        try {

            const userDataJSON = localStorage.getItem('userData');
            const userDataObject = JSON.parse(String(userDataJSON));
            console.log('Projeto:', params.projectId)
            const response = await axios.get(`${routerServer}/api/project/${params.projectId}`, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`
                }
            });
            console.log(response)
            const project = response.data; // Suponha que a resposta contenha todos os dados do projeto

            setProjectData({
                title: project.title,
                content: project.content,
                priority: project.priority
            });

        } catch (error) {
            console.error('Erro ao carregar os dados do projeto:', error);
        }
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Envie uma solicitação de atualização para a API com os dados do projeto alterados (projectData)
        const userDataJSON = localStorage.getItem('userData');
        const userDataObject = JSON.parse(String(userDataJSON));
        try {
            const response = await axios.put(`${routerServer}/api/project/${params.projectId}`, {
                title: projectData.title,
                content: projectData.content,
                priority: projectData.priority
            }, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`
                }
            });

            router.push('/home')
            // Redirecione o usuário após a edição bem-sucedida
        } catch (error) {
            console.error('Erro ao atualizar o projeto:', error);
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
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <Input
                            title="Nome do Projeto"
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Digite o nome do projeto..."
                            value={projectData.title || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <TextArea
                            name="content"
                            id="content"
                            title="Descrição do Projeto"
                            placeholder="Descrição do Projeto"
                            className="w-full p-4 h-64 bg-gray-200"
                            value={projectData.content}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <Select
                            name="priority"
                            id="priority"
                            title="Prioridade do Projeto"
                            value={projectData.priority}
                            onChange={handleChange}
                        >
                            <option value="">Selecione a prioridade</option>
                            {Object.entries(Priority).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {priorityMapping[value]}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Button type="submit" title="Salvar" />
                    </div>
                </form>
            </div>
        </section>
    );
}