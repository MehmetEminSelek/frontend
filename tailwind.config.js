module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts}'],
    theme: {
        extend: {
            colors: {
                // Primary - Soft Blue
                'primary': '#5D87FF',
                'primary-dark': '#4570EA',
                'primary-light': '#769BFF',
                // Secondary - Soft Cyan
                'secondary': '#49BEFF',
                'secondary-dark': '#29A8E8',
                'secondary-light': '#70CDFF',
                // Accent - Soft Yellow
                'accent': '#FFD666',
                // Status
                'success': '#13DEB9', // Soft Teal
                'warning': '#FFAE1F', // Soft Orange
                'error': '#FA896B',   // Soft Red
                'info': '#5D87FF',
                // Backgrounds
                'background': '#F5F7FA',
                'surface': '#FFFFFF'
            },
            fontFamily: {
                'sans': ['Inter', 'Roboto', '-apple-system', 'sans-serif'],
                'display': ['Poppins', 'Inter', 'sans-serif']
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem'
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem'
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
                'strong': '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
        }
    },
    plugins: []
}