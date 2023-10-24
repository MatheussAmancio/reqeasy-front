import React, { useState, useEffect } from 'react';
import { Status } from '@/enum/status'
import { Priority } from '@/enum/priority'
import { ColorPriority } from '@/enum/colorPriority';
import axios from 'axios';
import { routerServer } from '@/server/config';
import { Button } from "@/components/button"
import { Input } from "@/components/input";
import { BsFillTrashFill } from 'react-icons/bs';

export type TaskInterface = {
    id: string
    description: string
    priority: string
    status: string
    createdAt: string
}

type ProjectCardProps = {
    task: TaskInterface;
    onDelete: (taskId: string) => void; // Função para lidar com a exclusão
    onToggleComplete: (taskId: string) => void; // Função para lidar com a conclusão
};

export function TaskCard({ task, onDelete, onToggleComplete }: ProjectCardProps) {
    const handleDeleteClick = () => {
        onDelete(task.id); // Chama a função onDelete passando o ID da tarefa
    };

    const handleToggleComplete = () => {
        onToggleComplete(task.id); // Chama a função onToggleComplete passando o ID da tarefa
    };

    const isVeryLowPriority = task.priority === 'VERY_LOW';

    return (
        <div className={`task-card bg-white rounded p-2 relative ${task.status.toLowerCase()}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={task.status === 'COMPLETED'}
                        onChange={handleToggleComplete}
                        className={`w-4 h-4 mr-2 ${task.status === 'COMPLETED' ? 'completed' : ''} cursor-pointer`}
                    />
                    <div
                        style={{
                            backgroundColor: ColorPriority[task.priority as keyof typeof ColorPriority],
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            marginRight: '8px',
                            border: isVeryLowPriority ? '1px solid black' : 'none',
                        }}
                    ></div>
                    <div className="flex flex-col">
                        <h2 className="task-title font-bold text-black text-base">
                            {task.description}
                        </h2>
                    </div>
                </div>
                <button className="delete-button" onClick={handleDeleteClick}>
                    <BsFillTrashFill size={20} style={{ color: '#888' }} />
                </button>
            </div>
        </div>
    );
}