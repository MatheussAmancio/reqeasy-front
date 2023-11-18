'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Status } from '@/enum/status';
import { routerServer } from '@/server/config';

// Configurando os tipos de fonte
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function ReportTaskUser() {
    interface Project {
        id: number;
        title: string;
        content: string;
        status: string;
        createdAt: Date;
        users: {
            name: string;
        }[];
    }

    interface ReportData {
        projects: Project[];
    }

    const [errors, setError] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const [formState, setFormState] = useState({
        startDate: '',
        endDate: '',
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
        setError(''); // Limpar erros anteriores

        const dateIni = formState.startDate;
        const dateFim = formState.endDate;

        if (isValidDate(dateIni) && isValidDate(dateFim)) {
            const startDate = new Date(dateIni);
            const endDate = new Date(dateFim);

            if (startDate <= endDate) {
                try {
                    const userDataJSON = localStorage.getItem('userData');
                    if (userDataJSON) {
                        const userDataObject = JSON.parse(userDataJSON);

                        const response = await axios.get(`${routerServer}/api/report/userproject/${userDataObject.id}`, {
                            params: formState,
                            headers: {
                                Authorization: `Bearer ${userDataObject.jwtToken}`,
                            },
                        });

                        const data = response.data;

                        setReportData(data);

                        if (data) {
                            const pdfBlob = await generatePDFReport(data, dateIni, dateFim);
                            const pdfUrl = URL.createObjectURL(pdfBlob);
                            window.open(pdfUrl, '_blank');
                        }
                    } else {
                        setError('Dados do usuário não encontrados.');
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
            date: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
            },
            createdBy: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
            },
            separator: {
                margin: [0, 10, 0, 10],
            },
            total: {
                fontSize: 12,
                margin: [0, 2, 0, 2],
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
                text: `Relação de Projetos por Usuário - Período: ${dateIni.split('-').reverse().join('/')} a ${dateFin.split('-').reverse().join('/')}`,
                fontSize: 16,
                bold: true,
                margin: [0, 0, 0, 10],
            },
        ];

        content.push(header);

        if (projects) {
            const totalProjects = projects.length;
            const totalProcessing = projects.filter((project) => project.status === 'PROCESSING').length;
            const totalCompleted = projects.filter((project) => project.status === 'COMPLETED').length;

            content.push({ text: 'Totalizador de Projetos', style: 'title' });
            content.push({ text: `Projetos Criados: ${totalProjects}`, style: 'total' });
            content.push({ text: `Projetos Em Andamento: ${totalProcessing}`, style: 'total' });
            content.push({ text: `Projetos Concluídos: ${totalCompleted}`, style: 'total' });

            content.push({ text: 'Lista de Projetos', style: 'title' });

            projects.forEach((project, index) => {
                const projectContent: any[] = [
                    { text: 'Título: ' + project.title, style: 'title' },
                    { text: 'Conteúdo: ' + project.content, style: 'content' },
                    {
                        text: 'Status: ' + (Status[project.status as keyof typeof Status] || project.status),
                        style: 'status',
                    },
                    { text: 'Data de Criação: ' + format(new Date(project.createdAt), 'dd/MM/yyyy'), style: 'date' },
                ];

                if (project.users.length > 0) {
                    projectContent.push({ text: 'Participantes:', style: 'createdBy' });
                    project.users.forEach((user) => {
                        projectContent.push({ text: user.name, style: 'createdBy' });
                    });
                }

                if (index < projects.length - 1) {
                    content.push({ text: '-----------------------------------------------------------------------------------------------------------------------------------------------------------', style: 'separator' });
                }

                content.push(...projectContent);
            });
        }

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

    useEffect(() => { }, [reportData]);

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
