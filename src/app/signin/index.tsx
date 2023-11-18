'use client';

import axios from 'axios';
import { useState } from 'react';
import { Button } from "@/components/button"
import { Input } from "@/components/input";
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { routerServer } from '@/server/config';
import jwt_decode from 'jwt-decode';


export default function SignIn() {
    const route = useRouter()
    const [modo, setModo] = useState<'login' | 'cadastro'>('login')
    const [errors, setError] = useState<string>('');

    const [formState, setFormState] = useState<SigninInterface>({
        name: '',
        email: '',
        password: '',
        jwtToken: '',
        id: ''
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [event.target.name]: event.target.value });
    }


    async function handleSignup(event: React.FormEvent) {
        event.preventDefault();

        try {
            console.log('Email:', formState.email);
            console.log('Senha:', formState.password);
            const response = await axios.post(`${routerServer}/api/users`, {
                email: formState.email,
                name: formState.name,
                password: formState.password
            });

            console.log(response);

            // Somente chame handleSignin se a criação do usuário for bem-sucedida
            handleSignin(event)
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            setError('Usuário já existe ou ocorreu um erro durante a criação.');
        }
    }

    async function handleSignin(event: React.FormEvent) {
        event.preventDefault();
        localStorage.setItem('userData', JSON.stringify(formState));
        const userDataJSON = localStorage.getItem('userData');
        const userDataObject = JSON.parse(String(userDataJSON));
        try {
            console.log('Email:', userDataObject.email);
            console.log('Senha:', userDataObject.password);

            const response = await axios.post(`${routerServer}/api/signin`, {
                email: userDataObject.email,
                password: userDataObject.password
            });

            const token = response.data.token;
            const decodedToken = jwt_decode(token);

            const userCode = (decodedToken as { user_id: string }).user_id;


            userDataObject.jwtToken = response.data.token;
            userDataObject.id = userCode
            localStorage.setItem('userData', JSON.stringify(userDataObject));


            console.log('Token gerado:', response.data.token);
            console.log('Id Usuario:', userCode)

            route.push(`/home`);
        } catch (error) {
            console.error('Erro ao gerar token:', error);
            setError('Email ou senha incorretos. Por favor, verifique suas credenciais.');
        }
    }

    return (

        <section className="bg-gray-50 dark:bg-gray-900 justify-center">

            <div className="fixed top-0 left-0 w-full  bg-gray-800 ">
                <Navbar />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center h-screen w-full">
                {/* Divisão esquerda (entrada de dados) */}
                <div className="md:w-1/2 lg:w-1/3">
                    {/*<div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">*/}
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-full">
                        {modo === 'cadastro' ? (
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Criar conta
                            </h1>
                        ) : (
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Entrar
                            </h1>
                        )}

                        <form className="space-y-4 md:space-y-6" onSubmit={modo === 'cadastro' ? handleSignup : handleSignin}>
                            {modo === 'cadastro' ? (
                                <div>
                                    <Input
                                        title="Informe seu Nome"
                                        type="text" name="name"
                                        id="name"
                                        placeholder="João da Silva"
                                        value={formState.name}
                                        onChange={handleChange} />
                                </div>
                            ) : (null)}
                            <div>
                                <Input
                                    title="Informe seu email"
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="exemplo@email.com"
                                    value={formState.email}
                                    onChange={handleChange} />
                            </div>
                            <div>
                                <Input
                                    title="Informe sua senha"
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={formState.password}
                                    onChange={handleChange} />
                            </div>
                            {modo === 'cadastro' ? (
                                <Button type="submit" title="Criar Conta" />
                            ) : (
                                <Button type="submit" title="Entrar" />
                            )}


                            {modo === 'cadastro' ? (
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Já possui uma conta? <a onClick={() => setModo('login')} href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Faça Login</a>
                                </p>
                            ) : (
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Não possui uma conta? <a onClick={() => setModo('cadastro')} href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Criar Conta</a>
                                </p>
                            )}

                        </form>
                        {errors && (
                            <div className="text-red-600 font-semibold text-sm mt-2">
                                {errors}
                            </div>
                        )}
                    </div>

                </div>

                {/* Divisão direita (imagem) */}
                <div className="md:w-1/2 hidden md:block w-screen h-screen lg:w-2/3">
                    <img
                        src="https://source.unsplash.com/5fNmWej4tAA" // Substitua pelo URL da sua imagem
                        alt="Imagem de fundo"
                        className="w-full h-screen object-cover"
                    />
                </div>
            </div>
        </section>
    )
}