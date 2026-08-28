import type {
    Metadata,
} from 'next';

import {
    Poppins,
} from 'next/font/google';

import './globals.css';


const poppins =
    Poppins({
        subsets: [
            'latin',
        ],
        weight: [
            '400',
            '500',
            '600',
            '700',
        ],
        variable:
            '--font-poppins',
    });


export const metadata:
    Metadata = {
        title:
            'Módulo de Eventos',
        description:
            'Interface de eventos para Autarquia 360',
    };


export default function RootLayout({
    children,
}: Readonly<{
    children:
        React.ReactNode;
}>) {
    return (
        <html
            lang="pt"
            className={
                poppins.variable
            }
        >
            <body>
                {children}
            </body>
        </html>
    );
}
