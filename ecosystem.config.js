module.exports = {
    apps: [
        {
            name: 'gif-creator',
            cwd: '/var/www/myapps/gif-creator',
            script: 'bun',
            args: 'run start',
            env_production: {
                NODE_ENV: 'production',
                PORT: process.env.APP_PORT || 3004,
                DATABASE_URL: process.env.DATABASE_URL,
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
                CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
                NEXT_PUBLIC_PIXABAY_KEY: process.env.NEXT_PUBLIC_PIXABAY_KEY
            }
        }
    ]
}
