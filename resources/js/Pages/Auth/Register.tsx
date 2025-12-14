import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Cadastro" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                            WhatsApp Sistema
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crie sua conta gratuitamente
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Criar conta</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para criar sua conta
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <Input
                                    label="Nome completo"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    placeholder="João Silva"
                                    autoComplete="name"
                                    autoFocus
                                    required
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="seu@email.com"
                                    autoComplete="username"
                                    required
                                />

                                <Input
                                    label="Senha"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />

                                <Input
                                    label="Confirmar senha"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    isLoading={processing}
                                    className="w-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Criar conta
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                Já tem uma conta?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    Fazer login
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} WhatsApp Sistema. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </>
    );
}
