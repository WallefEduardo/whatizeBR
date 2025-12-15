import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Checkbox from '@/Components/UI/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { LogIn } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                            WhatsApp Sistema
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Faça login para continuar
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Entrar na sua conta</CardTitle>
                            <CardDescription>
                                Digite seu email e senha para acessar o sistema
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {status && (
                                <div className="mb-4 p-3 text-sm font-medium text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400 rounded">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    placeholder="seu@email.com"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />

                                <Input
                                    label="Senha"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />

                                <div className="flex items-center justify-between">
                                    <Checkbox
                                        label="Lembrar de mim"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    maxWidth="lg"
                                    isLoading={processing}
                                    className="w-full"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Entrar
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                Não tem uma conta?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    Cadastre-se
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
