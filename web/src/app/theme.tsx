'use client';

import { ConfigProvider, theme, App } from 'antd';

// Indian-inspired color palette
export const kundaliTheme = {
    token: {
        colorPrimary: '#D4AF37', // Royal Gold
        colorBgBase: '#0A0A1A', // Cosmic Dark
        colorTextBase: '#E8E6E3', // Light cream text
        colorBgContainer: 'rgba(26, 10, 46, 0.8)', // Cosmic purple with transparency
        colorBorder: 'rgba(212, 175, 55, 0.3)', // Gold border
        colorBorderSecondary: 'rgba(255, 107, 53, 0.2)', // Saffron border
        colorSuccess: '#52c41a',
        colorWarning: '#FF6B35', // Saffron
        colorError: '#8B1538', // Deep Maroon
        colorInfo: '#005F73', // Peacock Blue
        borderRadius: 12,
        fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
    },
    components: {
        Button: {
            colorPrimary: '#D4AF37',
            algorithm: true,
            primaryShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
        },
        Card: {
            colorBgContainer: 'rgba(26, 10, 46, 0.6)',
            colorBorderSecondary: 'rgba(212, 175, 55, 0.2)',
        },
        Form: {
            labelColor: '#D4AF37',
        },
        Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorBorder: 'rgba(212, 175, 55, 0.3)',
            colorTextPlaceholder: 'rgba(232, 230, 227, 0.4)',
        },
        Select: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorBorder: 'rgba(212, 175, 55, 0.3)',
        },
        DatePicker: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorBorder: 'rgba(212, 175, 55, 0.3)',
        },
        TimePicker: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorBorder: 'rgba(212, 175, 55, 0.3)',
        },
        Table: {
            colorBgContainer: 'rgba(26, 10, 46, 0.4)',
            headerBg: 'rgba(212, 175, 55, 0.1)',
            headerColor: '#D4AF37',
            borderColor: 'rgba(212, 175, 55, 0.2)',
        },
        Tabs: {
            colorPrimary: '#D4AF37',
            itemSelectedColor: '#D4AF37',
        },
        Tag: {
            colorBorder: 'rgba(212, 175, 55, 0.3)',
        },
    },
    algorithm: theme.darkAlgorithm,
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <ConfigProvider theme={kundaliTheme}>
            <App>
                {children}
            </App>
        </ConfigProvider>
    );
}

