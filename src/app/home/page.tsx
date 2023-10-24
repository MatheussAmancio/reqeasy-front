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
import { ProjectCard } from '@/components/projectCard';
import { Button } from "@/components/button"

export type ProjectsInterface = {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  content: string
}


export default function SignIn() {
  const [projects, setProjects] = useState<ProjectsInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (typeof window !== 'undefined') {
    const userDataJSON = localStorage.getItem('userData');
    const userDataObject = JSON.parse(String(userDataJSON));
    useEffect(() => {
      axios.get(`${routerServer}/api/project`, {
        headers: {
          Authorization: `Bearer ${userDataObject.jwtToken}`
        }
      })
        .then((response) => {
          // Atualize o estado com os dados dos projetos
          setProjects(response.data.result);
        })
        .catch((error) => {
          console.error('Erro ao obter a lista de projetos', error);
        });
    }, [userDataObject.jwtToken]);



  }


  const filteredProjects = projects.filter((project: ProjectsInterface) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseContent, setResponseContent] = useState('');

  const copyToClipboard = (text: string) => {
    // Cria um elemento de texto temporário para copiar o texto
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Anexa o elemento à árvore DOM
    document.body.appendChild(textArea);

    // Seleciona o texto no elemento
    textArea.select();

    // Tenta copiar o texto para a área de transferência
    document.execCommand('copy');

    // Remove o elemento de texto temporário
    document.body.removeChild(textArea);
  };

  const handleInviteProject = async (projectId: string) => {
    try {
      const userDataJSON = localStorage.getItem('userData');
      const userDataObject = JSON.parse(String(userDataJSON));

      const response = await axios.post(`${routerServer}/api/invite/project/${projectId}`, {
      }, {
        headers: {
          Authorization: `Bearer ${userDataObject.jwtToken}`
        }
      });
      const jsonString = JSON.stringify(response.data)
      // Analisar a string JSON
      const parsedData = JSON.parse(jsonString);

      // Acessar a propriedade "id"
      const id = parsedData.id;
      setResponseContent(id);
      setDialogOpen(true);


    } catch (error) {
      console.error('Erro ao criar link projeto:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const userDataJSON = localStorage.getItem('userData');
      const userDataObject = JSON.parse(String(userDataJSON));
      await axios.delete(`${routerServer}/api/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${userDataObject.jwtToken}`
        }
      });
      setProjects((prevProjects) => prevProjects.filter((project: ProjectsInterface) => project.id !== projectId));
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      const userDataJSON = localStorage.getItem('userData');
      const userDataObject = JSON.parse(String(userDataJSON));
      await axios.patch(
        `${routerServer}/api/project/${projectId}`,
        {
          status: 'PROCESSING'
        },
        {
          headers: {
            Authorization: `Bearer ${userDataObject.jwtToken}`
          }
        }
      );

      const response = await axios.patch(
        `${routerServer}/api/project/${projectId}`,
        {
          status: 'COMPLETED'
        },
        {
          headers: {
            Authorization: `Bearer ${userDataObject.jwtToken}`
          }
        }
      );
      console.log(response)

      // Atualize o status do projeto na lista local ou recarregue os projetos
      // Exemplo de atualização da lista local:
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === projectId) {
            return { ...project, status: 'COMPLETED' };
          }
          return project;
        })
      );

      console.log('Projeto concluído com sucesso:', response.data);
    } catch (error) {
      console.error('Erro ao concluir projeto:', error);
    }
  };


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
            <Input
              type="text"
              name="search"
              id="search"
              placeholder="Nome do projeto"
              value={searchTerm}
              onChange={handleInputChange}
              className="mb-6 p-4 bg-gray-200"
            />
            <div className="mt-4 mb-4 max-h-[calc(100vh-8rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
              {filteredProjects.map((project, index) => (
                <div className="mb-4" key={index}>
                  <ProjectCard project={project}
                    onDeleteProject={handleDeleteProject}
                    onCompleteProject={handleCompleteProject}
                    onInviteProject={handleInviteProject}

                  />
                </div>
              ))}
            </div>
            {dialogOpen && (

              <div className="modal fixed inset-0 flex items-center justify-center">
                <div className="modal-content bg-white p-12 rounded-lg shadow-md w-2/6">
                  <div className="mb-4 py-4 w-full">
                    <Input
                      title="Codigo do Projeto"
                      type="text"
                      name="title"
                      id="Text"
                      defaultValue={(responseContent)}
                      readOnly
                    />
                  </div>
                  <div className="mb-4" >
                    <Button
                      type="button" title="Copiar"
                      onClick={() => {
                        copyToClipboard(responseContent);
                      }}
                    />
                  </div>
                  <div className="mb-4 ">
                    <Button type="button" title="Fechar" onClick={() => {
                      setDialogOpen(false);
                    }} />
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}