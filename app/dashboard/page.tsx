'use client'

import { AvatarBadge } from '@/components/AvatarBadge'
import { LayoutGrid } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage() {

    const { user } = useAuth()
    return (
        <>

            <nav className=" flex justify-between px-6 py-4">
                <div className="text-xl font-extrabold tracking-tight flex items-center gap-3">
                    <LayoutGrid size={32} />
                    Gestor de Tareas
                </div>
                {user && (

                    <Link href="/profiles">

                        <AvatarBadge
                            name={user?.name}
                            avatar_url={user?.avatar_url}
                        />


                    </Link>

                )}


            </nav>
            <button
                onClick={async () => {
                    await fetch('/api/auth/signout', {
                        method: 'POST'
                    })

                    window.location.href = '/'
                }}
                className="bg-white/20 text-white px-20 py-2 rounded"
            >
                Logout
            </button>

        </>
    )
}
