'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import React, { ChangeEvent } from 'react';
import { Input } from "@/components/input";
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { routerServer } from '@/server/config';
import jwt_decode from 'jwt-decode';
import { Sidebar } from '@/components/sidebar';
import { TaskCard } from '@/components/taskCard';
import { Priority } from '@/enum/priority';
import { Select } from "@/components/select";

import { Button } from "@/components/button"

const priorityMapping: Record<string, Priority> = {
    'Muito Alta': Priority.HIGHEST,
    'Alta': Priority.HIGH,
    'Média': Priority.MEDIUM,
    'Baixa': Priority.LOW,
    'Muito Baixa': Priority.VERY_LOW
};

export type TaskInterface = {
    id: string
    description: string
    priority: string
    status: string
    createdAt: string
}

export default function ProjectTask({ params }: { params: { projectId: string } }) {
    const [tasks, setTasks] = useState<TaskInterface[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleDeleteTask = (taskId: string) => {
        try {
            const userDataJSON = localStorage.getItem('userData');
            const userDataObject = JSON.parse(String(userDataJSON));

            console.log(taskId)
            const response = axios.delete(`${routerServer}/api/task/project/${params.projectId}/items/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`,
                },
            });
            console.log(response)
            setTasks((prevTask) => prevTask.filter((task: TaskInterface) => task.id !== taskId));
        } catch (error) {
            console.error('Erro ao obter a lista de tarefas', error);
            setIsLoading(false);
        }

    };

    const [formState, setFormState] = useState<TaskInterface>({
        id: '',
        description: '',
        priority: '',
        status: '',
        createdAt: ''
    });


    const handleCompleteTask = (taskId: string, isChecked: string) => {
        try {
            const userDataJSON = localStorage.getItem('userData');
            const userDataObject = JSON.parse(String(userDataJSON));
            const newStatus = isChecked.toUpperCase()
            console.log(taskId)
            const response = axios.patch(`${routerServer}/api/task/project/${params.projectId}/items/${taskId}`, {
                status: newStatus
            }, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`,
                },
            });
            console.log(response)
        } catch (error) {
            console.error('Erro ao obter a lista de tarefas', error);
            setIsLoading(false);
        }

    };

    const listTask = async () => {
        try {
            const userDataJSON = localStorage.getItem('userData');
            const userDataObject = JSON.parse(String(userDataJSON));
            const response = await axios.get(`${routerServer}/api/task/project/${params.projectId}`, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`,
                },
            });
            setTasks(response.data.result);
        } catch (error) {
            console.error('Erro ao obter a lista de tarefas', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        listTask();
    }, [params.projectId]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [event.target.name]: event.target.value });
    }

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault();

        const userDataJSON = localStorage.getItem('userData');
        const userDataObject = JSON.parse(String(userDataJSON));
        try {
            const response = await axios.post(`${routerServer}/api/task/project/${params.projectId}`, {
                description: formState.description,
                priority: formState.priority
            }, {
                headers: {
                    Authorization: `Bearer ${userDataObject.jwtToken}`
                }
            });

            console.log(response);

            await listTask();

            setFormState({
                id: '',
                description: '',
                status: '',
                createdAt: '',
                priority: formState.priority
            });

            if (tasks.length === 0) {

                const updateProjectStatusResponse = await axios.patch(`${routerServer}/api/project/${params.projectId}`, {
                    status: 'PROCESSING',
                }, {
                    headers: {
                        Authorization: `Bearer ${userDataObject.jwtToken}`,
                    },
                });
                console.log('Status do projeto atualizado:', updateProjectStatusResponse);
            }
        } catch (error) {

            console.error(error);
        }
    }
    const filteredTasks = tasks.filter((task) =>
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="bg-gray-50 dark:bg-gray-900 justify-center w-full h-full">
            <div className="flex flex-col h-screen">
                <div className="bg-gray-800 fixed top-0 left-0 right-0">
                    <Navbar />
                </div>
                <div className="flex h-full overflow-hidden ">

                    <div className="fixed top-10 left-0">
                        <Sidebar />
                    </div>
                    <Sidebar />


                    <div className="flex-1 ml-16 mt-10 p-4" style={{ marginLeft: '2rem' }}>
                        {isLoading ? (
                            <div className="text-black text-2xl font-bold mt-4 mb-0">Carregando...</div>
                        ) : (
                            <div style={{ height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
                                <div className="task-list mt-4 mb-0 h-full overflow-y-auto border border-gray-300 rounded scrollbar-width-thin scrollbar-thumb-transparent">
                                    <ul>
                                        {filteredTasks.map((project, index) => (
                                            <div className="mb-4" key={index}>
                                                <TaskCard
                                                    task={project}
                                                    onDelete={handleDeleteTask}
                                                    onUpdateStatus={(taskId: string, isChecked: string) => handleCompleteTask(taskId, isChecked)}
                                                />
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                                <form onSubmit={handleFormSubmit} style={{ flex: 1 }}>
                                    <div className="h-[calc(100vh-15rem)/3] mb-4 flex items-center">
                                        <div className="w-3/4 pr-2">
                                            <Input
                                                type="text"
                                                name="description"
                                                id="Text"
                                                placeholder="Digite a task..."
                                                value={formState.description}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <Select
                                                name="priority"
                                                id="priority"
                                                value={formState.priority}
                                                onChange={handleChange}
                                            >
                                                <option value="">Selecione a prioridade da task</option>
                                                {Object.entries(Priority).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {priorityMapping[value]}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <Button type="submit" title="Criar" />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
