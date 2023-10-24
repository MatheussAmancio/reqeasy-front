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

import { Button } from "@/components/button"

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
        // Implemente a lógica para excluir uma tarefa
    };

    const handleCompleteTask = (taskId: string) => {
        // Implemente a lógica para marcar uma tarefa como concluída
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const userDataJSON = localStorage.getItem('userData');
                const userDataObject = JSON.parse(String(userDataJSON));
                const response = await axios.get(`${routerServer}/api/task/project/${params.projectId}`, {
                    headers: {
                        Authorization: `Bearer ${userDataObject.jwtToken}`,
                    },
                });
                setTasks(response.data.result);
                setIsLoading(false);
            } catch (error) {
                console.error('Erro ao obter a lista de tarefas', error);
                setIsLoading(false);
            }
        };

        fetchData();

    }, [params.projectId]);

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
                        {<div className="container mx-auto flex justify-between items-center text-black  text-2xl font-bold hover:opacity-80">
                            ReqEasy
                        </div>}
                        {isLoading ? (
                            <div>Carregando...</div>
                        ) : (
                            <div className="task-list mt-4 mb-4 max-h-[calc(100vh-8rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                                <ul>
                                    {filteredTasks.map((project, index) => (
                                        <div className="mb-4" key={index}>
                                            <TaskCard task={project}
                                                onDelete={handleDeleteTask}
                                                onToggleComplete={handleCompleteTask}
                                            />
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
