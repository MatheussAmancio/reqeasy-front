import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export function Navbar() {
  const route = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar se o usuário está logado
  const [userName, setUserName] = useState(''); // Nome do usuário, que pode ser obtido após o login

  useEffect(() => {
    // Verifique se o usuário está logado aqui
    // Defina o estado isLoggedIn com base no status de login do usuário
    const userIsLoggedIn = true; // Substitua por sua lógica real de verificação de login
    setIsLoggedIn(userIsLoggedIn);

    // Se o usuário estiver logado, você pode buscar o nome do usuário aqui
    // setUserName('Nome do Usuário'); // Substitua por sua lógica real para obter o nome do usuário
  }, []);

  async function handleLogout() {
    // Coloque a lógica de logout aqui, como limpar os tokens de autenticação
    // Em seguida, redirecione o usuário para a página de login
    // Exemplo fictício:
    // await axios.post('http://localhost:3000/api/logout');
    // route.push('/login');
  }

  function handleCreateProject() {
    // Coloque a lógica para criar um novo projeto aqui
    // Por exemplo, você pode redirecionar o usuário para a página de criação de projeto:
    // route.push('/create-project');
  }

  return (
    <nav className="bg-gray-800 p-1">
      {<div className="container mx-auto flex justify-between items-center">
        <a href="/" className="flex items-center text-white text-2xl font-semibold hover:opacity-80">
          <img className="w-8 h-8 mr-2" src="https://www.svgrepo.com/show/400089/clipboard.svg" alt="logo" />
          ReqEasy
        </a>
      </div>}
    </nav>
  );
}