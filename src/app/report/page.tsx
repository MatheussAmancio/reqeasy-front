'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
type Report = {
    id: string;
    name: string;
    description: string;

}
export default function ProjectCreate() {

    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const route = useRouter()

    const reports = [
        {
            id: "reportTaskUser",
            name: "Relação de Requisitos por Usuário",
            description: "Este Relatório mostra tudo que o usuário movimentou em cada projeto ",
        },
        {
            id: "reportTaskProjeto",
            name: "Relação de Requisitos por Projeto",
            description: "Este Relatório mostra o que cada usuário movimentou em cada projeto ",
        },
        {
            id: "reportProjectStatus",
            name: "Relação de Projetos",
            description: "Este Relatório mostra o status de cada projeto em que o usuário está",
        },
    ];

    const handleReportClick = (report: Report) => {
        setSelectedReport(report);
        if (selectedReport) {
            route.push(`/${selectedReport.id}`);
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
                <div className="grid grid-cols-2 gap-4">
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onClick={() => handleReportClick(report)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
    const { name, description } = report;

    return (
        <div
            className="bg-white p-4 rounded-md shadow-md cursor-pointer transition-transform transform hover:shadow-lg"
            onClick={onClick}
        >
            <h2 className="text-black font-bold">{name}</h2>
            <p className="text-gray-700 font-normal">{description}</p>
        </div>
    );
}



