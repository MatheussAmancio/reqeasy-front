'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import React, { ChangeEvent } from 'react';
import { Input } from "@/components/input";
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Priority } from '@/enum/priority';
import { Select } from "@/components/select";
import { Status } from '@/enum/status';
import { Button } from "@/components/button";
import { routerServer } from '@/server/config';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { format } from 'date-fns';

// Configurando os tipos de fonte
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function ReportTaskUser() {
    const priorityMapping = {
        'Muito Alta': Priority.HIGHEST,
        'Alta': Priority.HIGH,
        'Média': Priority.MEDIUM,
        'Baixa': Priority.LOW,
        'Muito Baixa': Priority.VERY_LOW,
    };

    const statusMapping = {
        'Cancelado': Status.CANCELED,
        'Concluido': Status.COMPLETED,
        'Em Andamento': Status.PROCESSING,
        'Criado': Status.CREATED,
    };

    interface Project {
        id: number;
        title: string;
        content: string;
        status: string;
        priority: string;
        createdAt: Date;
        users: {
            name: string;
        };
        tasksCreated: number;
        tasksCompleted: number;
        tasksCancelled: number;
    }

    interface ReportData {
        projects: Project[];
    }

    const [errors, setError] = useState<string>('');
    const [reportData, setReportData] = useState([]);

    const [formState, setFormState] = useState({
        startDate: '',
        endDate: '',
        priority: '',
        status: '',
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormState((prevFormState) => ({
            ...prevFormState,
            [name]: value,
        }));
    };


    async function handleReportTaskUser(event: React.FormEvent) {
        event.preventDefault();
        console.log(formState);

        const dateIni = formState.startDate;
        const dateFim = formState.endDate;

        if (isValidDate(dateIni) && isValidDate(dateFim)) {
            const startDate = new Date(dateIni);
            const endDate = new Date(dateFim);

            if (startDate <= endDate) {
                try {
                    try {
                        const dateIni = formState.startDate;
                        const dateFim = formState.endDate;
                        const userDataJSON = localStorage.getItem('userData');
                        const userDataObject = JSON.parse(String(userDataJSON));
                        const response = await axios.get(`${routerServer}/api/report/user/${userDataObject.id}`, {
                            params: formState,
                            headers: {
                                Authorization: `Bearer ${userDataObject.jwtToken}`,
                            },
                        });
                        const data = response.data;

                        console.log('Datas:', dateIni, dateFim);
                        setReportData(data);
                        const pdfBlob = await generatePDFReport(data, dateIni, dateFim);
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        window.open(pdfUrl, '_blank');
                    } catch (error) {
                        console.error('Erro ao criar o relatório em PDF:', error);
                        setError('Ocorreu um erro ao criar o relatório em PDF.');
                    }
                } catch (error) {
                    console.error('Erro ao criar o relatório em PDF:', error);
                    setError('Ocorreu um erro ao criar o relatório em PDF.');
                }
            } else {
                setError('A data inicial não pode ser maior do que a data final.');
            }
        } else {
            setError('Data inicial ou final inválida.');
        }
    }

    function isValidDate(dateString: string) {
        // Função para verificar se a data é válida
        return !isNaN(Date.parse(dateString));
    }

    const generatePDFReport = async (data: ReportData, dateIni: string, dateFin: string) => {
        const projects = data.projects;
        const currentDate = new Date().toLocaleDateString();
        const reqeasyName = 'ReqEasy'; // Nome da aplicação

        const content: any[] = [];
        const definedStyles: Record<string, any> = {
            title: {
                fontSize: 16,
                bold: true,
                margin: [0, 5, 0, 5],
            },
            content: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
            },
            status: {
                fontSize: 12,
                bold: true,
                margin: [0, 2, 0, 2],
            },
            priority: {
                fontSize: 12,
                bold: true,
                margin: [0, 2, 0, 2],
            },
            date: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
            },
            createdBy: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
            },
            tasksCreated: {
                fontSize: 12,
                margin: [20, 10, 0, 2],
            },
            tasksCompleted: {
                fontSize: 12,
                margin: [20, 0, 0, 2],
            },
            tasksCancelled: {
                fontSize: 12,
                margin: [20, 0, 0, 2],
            },
            separator: {
                margin: [0, 10, 0, 10],
            },
        };

        const header = [
            {
                text: reqeasyName,
                fontSize: 20,
                bold: true,
                margin: [0, 5, 0, 10],
            },
            {

                text: `Relação de Requisitos por Usuário - Período: ${dateIni.split('-').reverse().join('/')} a ${dateFin.split('-').reverse().join('/')}`,
                fontSize: 16,
                bold: true,
                margin: [0, 0, 0, 10],
            }
            // Outras informações de cabeçalho
        ];

        content.push(header);
        projects.forEach((project, index) => {
            const projectContent: any[] = [
                { text: 'Título: ' + project.title, style: 'title' },
                { text: 'Conteúdo: ' + project.content, style: 'content' },
                {
                    text: 'Status: ' + (Status[project.status as keyof typeof Status] || project.status),
                    style: 'status',
                },
                {
                    text: 'Prioridade: ' + (Priority[project.priority as keyof typeof Priority] || project.priority),
                    style: 'priority',
                },
                { text: 'Data de Criação: ' + format(new Date(project.createdAt), 'dd/MM/yyyy'), style: 'date' },
            ];

            const movementInfo = [
                { text: 'Requisitos Criados: ' + project.tasksCreated, style: 'tasksCreated' },
                { text: 'Requisitos Concluídos: ' + project.tasksCompleted, style: 'tasksCompleted' },
                { text: 'Requisitos Cancelados: ' + project.tasksCancelled, style: 'tasksCancelled' },
            ];

            if (index > 0) {
                content.push({ text: '-----------------------------------------------------------------------------------------------------------------------------------------------------------', style: 'separator' });
            }

            content.push(...projectContent);
            content.push(...movementInfo);
        });

        const documentDefinition = {
            content: content,
            styles: definedStyles,
        };

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        return new Promise<Blob>((resolve, reject) => {
            pdfDocGenerator.getBlob((pdfBlob: Blob) => {
                if (pdfBlob) {
                    resolve(pdfBlob);
                } else {
                    reject('Erro ao gerar o PDF');
                }
            });
        });
    };

    useEffect(() => { });

    return (
        <section className="bg-gray-50 dark:bg-gray-900 justify-center w-full min-h-screen">
            <div className="flex flex-col h-full">
                <div className="bg-gray-800 fixed top-0 left-0 right-0">
                    <Navbar />
                </div>
                <div className="flex h-full overflow-hidden">
                    <div className="fixed top-10 left-0">
                        <Sidebar />
                    </div>
                    <Sidebar />
                    <div className="flex-1 mx-auto pt-16 p-10">
                        <div className="border rounded-lg p-4 max-h-[calc(100vh-6rem)]">
                            <form onSubmit={handleReportTaskUser}>
                                <div className="mb-4">
                                    <Input
                                        type="date"
                                        name="startDate"
                                        title="Data Inicial"
                                        placeholder="Data de início"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        type="date"
                                        name="endDate"
                                        title="Data Final"
                                        placeholder="Data de término"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <Select
                                        name="priority"
                                        id="priority"
                                        title="Prioridade do Projeto"
                                        value={formState.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecione a prioridade dos Projetos</option>
                                        {Object.entries(Priority).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {priorityMapping[value]}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="mb-4">
                                    <Select
                                        name="status"
                                        id="status"
                                        title="Status do Projeto"
                                        value={formState.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Selecione o status dos Projetos</option>
                                        {Object.entries(Status).map(([key, value]) => (
                                            <option key={key} value={key}>
                                                {statusMapping[value]}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="mb-4">
                                    <Button type="submit" title="Gerar Relatório" />
                                </div>
                                <div className="text-red-500">{errors}</div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
