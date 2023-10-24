'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/button"
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { TextArea } from "@/components/textArea";
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { Priority } from '@/enum/priority';

import { routerServer } from '@/server/config';
import axios from 'axios';

export default function projectCreate() {

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

  const [formState, setFormState] = useState<ProjectsInterface>({
    title: '',
    content: '',
    priority: ''
  });


  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  useEffect(() => {
    if (confirmationMessage) {
      const timeoutId = setTimeout(() => {
        setConfirmationMessage(''); // Limpa a mensagem após 5 segundos (5000 ms)
      }, 5000);

      return () => clearTimeout(timeoutId); // Limpa o temporizador quando o componente é desmontado
    }
  }, [confirmationMessage]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [event.target.name]: event.target.value });
  }

  async function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    console.log('Projeto:', formState.title);
    console.log('Conteudo:', formState.content);

    console.log('Prioridade:', formState.priority);

    const userDataJSON = localStorage.getItem('userData');
    const userDataObject = JSON.parse(String(userDataJSON));
    try {
      const response = await axios.post(`${routerServer}/api/project`, {
        title: formState.title,
        content: formState.content,
        priority: formState.priority
      }, {
        headers: {
          Authorization: `Bearer ${userDataObject.jwtToken}`
        }
      });

      setConfirmationMessage('Projeto criado com sucesso!');
      setFormState(initialFormState);
      // Você pode adicionar algum código aqui para redirecionar ou realizar outras ações após a criação bem-sucedida do projeto.
    } catch (error) {
      setConfirmationMessage('Erro ao criar o projeto. Tente novamente.');
      console.error(error);
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 justify-center w-full">
      <div className="fixed top-0 left-0 w-full bg-gray-800 ">
        <Navbar />
      </div>

      <div className="fixed top-10 left-0">
        <Sidebar />
      </div>


      <div className="h-screen ml-48 pt-16 p-10 ">
        <form onSubmit={handleFormSubmit}>

          <div className="mb-4">
            <Input
              title="Nome do Projeto"
              type="text" 
              name="title" 
              id="Text"
              placeholder="Digite o nome do projeto..."
              value={formState.title}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <TextArea
              name="content" // Corrigir o nome do campo
              id="description"
              title="Descrição do Projeto"
              placeholder="Descrição do Projeto"
              className="w-full p-4 h-64 bg-gray-200"
              value={formState.content}
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
              <option value="">Selecione a prioridade</option>
              {Object.entries(Priority).map(([key, value]) => (
                <option key={key} value={key}>
                  {priorityMapping[value]}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <Button type="submit" title="Criar Projeto" />
          </div>
          {confirmationMessage && (
            <p className="text-green-500">{confirmationMessage}</p>
          )}
        </form>
      </div>
    </section>
  );
}
