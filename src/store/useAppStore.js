import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // Empresa selecionada (multi-empresa)
  company: { id: 1, name: 'Contourline Equipamentos Médicos', cnpj: '00.000.000/0001-00', regime: 'Lucro Real' },
  setCompany: (company) => set({ company }),

  // Período de referência
  period: { year: 2025, month: 12, competencia: '12/2025' },
  setPeriod: (period) => set({ period }),

  // Módulo ativo (para contexto da AI)
  activeModule: 'dashboard',
  setActiveModule: (activeModule) => set({ activeModule }),

  // Estado do copilot fiscal
  copilotOpen: false,
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  copilotMessages: [],
  addCopilotMessage: (msg) => set(s => ({ copilotMessages: [...s.copilotMessages, msg] })),

  // Alertas pendentes
  alertCount: 7,
  setAlertCount: (alertCount) => set({ alertCount }),

  // Semáforo geral
  taxTrafficLight: 'amber', // green | amber | red
  setTaxTrafficLight: (v) => set({ taxTrafficLight: v }),
}))
