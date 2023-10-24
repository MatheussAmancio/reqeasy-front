import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Status } from '@/enum/status'
import { Priority } from '@/enum/priority'
import { ColorPriority } from '@/enum/colorPriority';
import axios from 'axios';
import { routerServer } from '@/server/config';
import { Button } from "@/components/button"
import { Input } from "@/components/input";

type ProjectsInterface = {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    content: string;
};


type ProjectCardProps = {
    project: ProjectsInterface;
    onDeleteProject?: (projectId: string) => void; // onDeleteProject é opcional
    onCompleteProject?: (projectId: string) => void;
    onInviteProject?: (projectId: string) => void;

};


export function ProjectCard({ project, onDeleteProject, onCompleteProject, onInviteProject }: ProjectCardProps,) {
    const router = useRouter();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const userDataJSON = localStorage.getItem('userData');
    const userDataObject = JSON.parse(String(userDataJSON));

    const handleAlterar = () => {
        // Redirecione para a página de alteração
        router.push(`/updateProject/${project.id}`);
    };

    const handleConcluir = () => {
        if (onCompleteProject) {
            onCompleteProject(project.id);
        }
    };

    const handleDeletar = () => {
        if (onDeleteProject) {
            onDeleteProject(project.id);
        }
    };


    const handleInviteProject = () => {
        if (onInviteProject) {
            onInviteProject(project.id);
        }
    };

    const handleMenuToggle = () => {
        setMenuOpen(!isMenuOpen);
    };

    const handleOutsideClick = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
        }
    };

    const handleCardClick = () => {
        // Redirecionar para a tela desejada quando o card é clicado
        router.push(`/projectTask/${project.id}`);
    };
    useEffect(() => {
        window.addEventListener('click', handleOutsideClick);
        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div className="project-card bg-white rounded-lg p-4 hover:cursor-pointer relative">
            <div onClick={handleCardClick}>
                <div className="flex items-center mb-1">
                    <img
                        className="w-8 h-9 mr-2"
                        src="https://www.svgrepo.com/show/400089/clipboard.svg"
                        alt="logo"
                    />
                    <div className="flex flex-col">
                        <h2 className="project-title font-bold text-black text-base lg:text-lg">
                            {project.title}
                        </h2>
                        <p className="project-date text-gray-400 text-xs mt-[-1px]">
                            {new Date(project.createdAt).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>
                <p className="project-content mt-2 text-black">{project.content}</p>
                <p
                    className={`project-status mt-2 text-black font-semibold ${project.status.toLowerCase()}`}
                >
                    Status: {Status[project.status as keyof typeof Status] || project.status}
                </p>
                <p
                    className={`project-priority mt-2 text-black font-semibold ${project.priority.toLowerCase()}`}
                >
                    Prioridade:  {Priority[project.priority as keyof typeof Priority] || project.priority}
                </p>

                <div
                    className="priority-line w-full h-1 rounded-b-lg mt-2"
                    style={{ backgroundColor: ColorPriority[project.priority as keyof typeof ColorPriority] || project.priority }}
                ></div>

            </div>

            <div className="absolute top-0 right-0 p-4" ref={menuRef} style={{ zIndex: 9999 }}>
                <button
                    className="text-gray-600 hover:text-gray-800 focus:outline-none p-2 w-full"
                    onClick={handleMenuToggle}
                    style={{ zIndex: 9999 }} // Defina o z-index para um valor alto
                >
                    &#8942;
                </button>
                {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <button
                                onClick={handleInviteProject}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                Criar Convite
                            </button>

                            <button
                                onClick={handleAlterar}
                                className="block px-4 py-2 text-sm text-gray-700 hover-bg-gray-100 w-full text-left"
                            >
                                Alterar
                            </button>
                            <button
                                onClick={handleConcluir}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                Concluir
                            </button>
                            <button
                                onClick={() => handleDeletar()}
                                className="block px-4 py-2 text-sm text-red-600 hover:text-red-800 hover-bg-gray-100 w-full text-left"
                            >
                                Deletar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}