import React, { useState } from 'react';
import { Calculator, Notebook as Robot, User, DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsType {
  contactsPerDay: number;
  responseTime: number;
  ticketValue: number;
  humanCostPerHour: number;
  aiCostPerHour: number;
  humanMonthlyCost: number;
  aiCostPerMonth: number;
}

function getHumanConversionRateByTime(minutes: number): number {
  if (minutes <= 1) return 40;
  if (minutes <= 2) return 30;
  if (minutes <= 3) return 25;
  if (minutes <= 4) return 22;
  if (minutes <= 5) return 20;
  if (minutes <= 10) return 18;
  if (minutes <= 20) return 15;
  if (minutes <= 30) return 10;
  if (minutes <= 40) return 8;
  if (minutes <= 60) return 1;
  return 1;
}

function App() {
  const [metrics, setMetrics] = useState<MetricsType>({
    contactsPerDay: 100,
    responseTime: 180,
    ticketValue: 1200,
    humanCostPerHour: 25,
    aiCostPerHour: 15,
    humanMonthlyCost: 4000,
    aiCostPerMonth: 1500
  });

  // Calculate hourly costs based on monthly investment
  const workingDaysPerMonth = 22; // For human service
  const hoursPerDay = 8;
  const humanCostPerHour = metrics.humanMonthlyCost / (workingDaysPerMonth * hoursPerDay);
  const aiCostPerHour = metrics.aiCostPerMonth / (30 * 24); // AI available 24/7

  const calculateMetrics = (isAI: boolean) => {
    const monthlyContacts = metrics.contactsPerDay * 30;
    const responseTime = isAI ? 1 : metrics.responseTime;
    const conversionRate = isAI ? 40 : getHumanConversionRateByTime(responseTime);
    
    const lostLeadsRate = isAI ? 0.05 : 0.30;
    const respondedContacts = monthlyContacts * (1 - lostLeadsRate);
    
    let monthlyCost = 0;
    if (isAI) {
      const totalHoursPerMonth = (respondedContacts * responseTime) / 60;
      monthlyCost = (totalHoursPerMonth * metrics.aiCostPerHour) + metrics.aiCostPerMonth;
    } else {
      monthlyCost = metrics.humanMonthlyCost + ((respondedContacts * responseTime / 60) * metrics.humanCostPerHour);
    }

    const conversions = (respondedContacts * conversionRate) / 100;
    const revenue = conversions * metrics.ticketValue;
    const costPerAttendance = monthlyCost / respondedContacts;
    const annualRevenue = revenue * 12;
    const annualCost = monthlyCost * 12;
    const annualProfit = annualRevenue - annualCost;
    
    return {
      respondedContacts,
      conversions: Math.round(conversions),
      revenue,
      revenueFormatted: revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      monthlyCost,
      monthlyCostFormatted: monthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      costPerAttendance,
      costPerAttendanceFormatted: costPerAttendance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      lostRevenue: (monthlyContacts * lostLeadsRate * (conversionRate / 100) * metrics.ticketValue),
      lostRevenueFormatted: (monthlyContacts * lostLeadsRate * (conversionRate / 100) * metrics.ticketValue)
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      conversionRate,
      annualRevenue,
      annualRevenueFormatted: annualRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      annualCost,
      annualCostFormatted: annualCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      annualProfit,
      annualProfitFormatted: annualProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    };
  };

  const humanMetrics = calculateMetrics(false);
  const aiMetrics = calculateMetrics(true);

  const chartData = {
    labels: ['Atendimentos/mês', 'Conversões', 'Faturamento (R$ mil)', 'Custo Mensal (R$ mil)'],
    datasets: [
      {
        label: 'Atendimento Humano',
        data: [
          humanMetrics.respondedContacts,
          humanMetrics.conversions,
          humanMetrics.revenue / 1000,
          humanMetrics.monthlyCost / 1000
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Atendimento IA',
        data: [
          aiMetrics.respondedContacts,
          aiMetrics.conversions,
          aiMetrics.revenue / 1000,
          aiMetrics.monthlyCost / 1000
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
        },
      },
      title: {
        display: true,
        text: 'Comparativo de Desempenho',
        color: '#e5e7eb',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#e5e7eb',
        },
      },
      x: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#e5e7eb',
        },
      },
    },
  };

  const AnnualImpactCard = ({ title, metrics, isAI }: { title: string; metrics: any; isAI: boolean }) => (
    <div className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
      isAI ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
           : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-lg'
    }`}>
      <h3 className={`text-xl font-bold mb-4 ${
        isAI ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500'
             : 'text-gray-200'
      }`}>{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 rounded bg-gray-800/50">
          <span className="text-gray-400">Receita Anual:</span>
          <span className="font-semibold text-emerald-400">{metrics.annualRevenueFormatted}</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded bg-gray-800/50">
          <span className="text-gray-400">Investimento Anual:</span>
          <span className="font-semibold text-red-400">{metrics.annualCostFormatted}</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded bg-gray-800/50">
          <span className="text-gray-400">Lucro Anual:</span>
          <span className="font-semibold text-emerald-400">{metrics.annualProfitFormatted}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mb-4 flex items-center justify-center">
            <Calculator className="inline-block mr-2 mb-1 text-cyan-400" />
            Calculadora de Investimento e Eficiência Operacional
          </h1>
          <p className="text-gray-400">Dimensione o impacto da IA no seu negócio de saúde</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Métricas de Entrada */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Configurar Métricas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contatos por Dia
                </label>
                <input
                  type="number"
                  value={metrics.contactsPerDay}
                  onChange={(e) => setMetrics({...metrics, contactsPerDay: Number(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tempo Médio de Resposta (minutos)
                </label>
                <input
                  type="number"
                  value={metrics.responseTime}
                  onChange={(e) => setMetrics({...metrics, responseTime: Number(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ticket Médio (R$)
                </label>
                <input
                  type="number"
                  value={metrics.ticketValue}
                  onChange={(e) => setMetrics({...metrics, ticketValue: Number(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Investimento Mensal (Atendente Humano - R$)
                </label>
                <input
                  type="number"
                  value={metrics.humanMonthlyCost}
                  onChange={(e) => setMetrics({...metrics, humanMonthlyCost: Number(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Comparativo */}
          <div className="grid grid-cols-2 gap-4">
            {/* Atendimento Humano */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-200">Atendimento Humano</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-400">Atendimentos/mês:</p>
                  <p className="font-semibold text-gray-200">{humanMetrics.respondedContacts}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Taxa de Conversão:</p>
                  <p className="font-semibold text-gray-200">{humanMetrics.conversionRate}%</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Conversões:</p>
                  <p className="font-semibold text-gray-200">{humanMetrics.conversions}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Faturamento:</p>
                  <p className="font-semibold text-emerald-400 text-lg">{humanMetrics.revenueFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Custo Mensal:</p>
                  <p className="font-semibold text-red-400">{humanMetrics.monthlyCostFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Custo por Atendimento:</p>
                  <p className="font-semibold text-red-400">{humanMetrics.costPerAttendanceFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Perda Mensal:</p>
                  <p className="font-semibold text-red-400">{humanMetrics.lostRevenueFormatted}</p>
                </div>
              </div>
            </div>

            {/* Atendimento IA */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-green-900">
              <div className="flex items-center justify-center mb-4">
                <Robot className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500">Atendimento IA</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-400">Atendimentos/mês:</p>
                  <p className="font-semibold text-gray-200">{aiMetrics.respondedContacts}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Taxa de Conversão:</p>
                  <p className="font-semibold text-gray-200">{aiMetrics.conversionRate}%</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Conversões:</p>
                  <p className="font-semibold text-gray-200">{aiMetrics.conversions}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Faturamento:</p>
                  <p className="font-semibold text-emerald-400 text-lg">{aiMetrics.revenueFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Custo Mensal:</p>
                  <p className="font-semibold text-red-400">{aiMetrics.monthlyCostFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Custo por Atendimento:</p>
                  <p className="font-semibold text-red-400">{aiMetrics.costPerAttendanceFormatted}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-400">Perda Mensal:</p>
                  <p className="font-semibold text-red-400">{aiMetrics.lostRevenueFormatted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Comparação */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-gray-700 mb-10">
          <div className="h-[400px]">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Impacto Anual */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center">
            <Calendar className="mr-2" />
            Impacto Anual
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <AnnualImpactCard title="Atendimento Humano" metrics={humanMetrics} isAI={false} />
            <AnnualImpactCard title="Atendimento IA" metrics={aiMetrics} isAI={true} />
          </div>
        </div>

        {/* Vantagens da IA */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-gray-700 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Vantagens do Atendimento com IA</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200">Resposta Imediata</h3>
                <p className="text-sm text-gray-400">Atendimento em menos de 1 minuto</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200">Maior Conversão</h3>
                <p className="text-sm text-gray-400">Taxa de conversão de até 40%</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <DollarSign className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200">Custo-Benefício</h3>
                <p className="text-sm text-gray-400">Menor custo por atendimento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparativo de Investimento */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.15)] border border-slate-700 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
            Comparativo de Investimento
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Investimento em Atendimento Humano</h3>
              <div className="text-3xl font-bold text-red-400 mb-2">
                {metrics.humanMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                <span className="text-sm text-gray-400 ml-2">/mês</span>
              </div>
              <p className="text-sm text-gray-400">
                Custo por hora: {humanCostPerHour.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 mb-4">
                Investimento em IA
              </h3>
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                R$ 1.500,00
                <span className="text-sm text-gray-400 ml-2">/mês</span>
              </div>
              <p className="text-sm text-gray-400">
                Custo por hora: {aiCostPerHour.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabela Comparativa */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.15)] border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
            Análise Comparativa Detalhada
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Atendimento Humano</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Variações na qualidade do atendimento dependendo do atendente</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Sujeito a erros humanos e falhas de comunicação</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Limitado por horários de trabalho</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Alto custo operacional (salários, benefícios, treinamentos)</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Resposta mais lenta em casos repetitivos</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-gray-300">Necessidade constante de treinamento</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 mb-4">
                Atendimento IA
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Respostas consistentes e padronizadas</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Processa informações com precisão e reduz erros</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Disponível 24/7, sem interrupções</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Reduz custos a longo prazo após implementação</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Responde instantaneamente a perguntas frequentes</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-900/30 to-emerald-900/20 border border-teal-800/30">
                  <p className="text-gray-300">Aprende continuamente com interações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;