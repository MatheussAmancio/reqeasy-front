'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Sidebar() {
  const route = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');


  useEffect(() => {

  }, [userName]);

  async function handleLogout() {
    // Coloque aqui a lógica para fazer logout, como limpar os tokens de autenticação.
  }

  return (
    <div className="bg-white w-48 h-screen text-black">
      <ul className="space-y-1 p-2 m-0">
        <div
          onClick={() => route.push('/home')}
          className="text-sm p-2 hover:bg-gray-200 cursor-pointer w-full"
        >
          <li>Projetos</li>
        </div>
        <div
          onClick={() => route.push('/projectCreate')}
          className="text-sm p-2 hover:bg-gray-200 cursor-pointer w-full"
        >
          <li>Criar Projeto</li>
        </div>
        <div
          onClick={() => route.push('/projectAcepptInvite')}
          className="text-sm p-2 hover:bg-gray-200 cursor-pointer w-full"
        >
          <li>Entrar em Projetos</li>
        </div>
        <div
          onClick={() => route.push('/report')}
          className="text-sm p-2 hover:bg-gray-200 cursor-pointer w-full"
        >
          <li>Relatórios</li>
        </div>
        <div
          onClick={handleLogout}
          className="text-sm p-2 hover:bg-gray-200 cursor-pointer w-full"
        >
          <li>Sair</li>
        </div>
      </ul>
    </div>
  );
}