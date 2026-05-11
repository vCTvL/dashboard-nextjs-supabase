import React from 'react'

export default function DashboardPage() {
    return (
        <div>DashboardPage

            <form action="/api/auth/signout" method="post">
                <button type="submit">Sign out</button>
            </form>
        </div>
    )
}
