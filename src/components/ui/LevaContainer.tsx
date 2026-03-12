'use client'

import { Leva } from 'leva'

export function LevaContainer() {
    const isProd = process.env.NODE_ENV === 'production'

    return (
        <Leva
            hidden={isProd}
            collapsed={true}
            oneLineLabels={true}
            flat={true}
            theme={{
                colors: {
                    accent1: '#7c3aed',
                    accent2: '#9333ea',
                    accent3: '#a855f7',
                },
                sizes: {
                    rootWidth: '360px',
                    controlWidth: '200px',
                    numberInputMinWidth: '68px',
                },
            }}
        />
    )
}
