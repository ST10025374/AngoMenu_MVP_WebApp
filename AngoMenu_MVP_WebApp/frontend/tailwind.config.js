/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    red: '#c70404',
                    yellow: '#f9c807',
                    dark: '#040302',
                },
            },
            boxShadow: {
                soft: '0 14px 30px rgba(4, 3, 2, 0.14)',
            },
        },
    },
    plugins: [],
};
