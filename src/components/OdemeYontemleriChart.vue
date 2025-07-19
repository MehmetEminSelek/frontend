<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  const labels = props.data.map(item => item.yontem || item.label || 'Bilinmiyor')
  const values = props.data.map(item => item.toplamTutar || item.value || 0)
  
  // Renkler - Her ödeme yöntemi için farklı renk
  const colors = [
    '#1976D2', // Mavi
    '#388E3C', // Yeşil
    '#F57C00', // Turuncu
    '#7B1FA2', // Mor
    '#D32F2F', // Kırmızı
    '#00796B', // Teal
    '#5D4037', // Kahverengi
    '#455A64'  // Blue Grey
  ]

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 12,
          family: 'Roboto, sans-serif'
        },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#1976D2',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          const total = context.dataset.data.reduce((sum, value) => sum + value, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ₺${context.parsed.toLocaleString('tr-TR')} (${percentage}%)`
        }
      }
    }
  },
  elements: {
    arc: {
      borderAlign: 'center'
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 220px;
  width: 100%;
}
</style> 