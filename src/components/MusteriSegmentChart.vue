<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
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
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  // Segmentlere göre grupla
  const segmentMap = {}
  props.data.forEach(musteri => {
    const segment = musteri.segment || 'Diğer'
    if (!segmentMap[segment]) {
      segmentMap[segment] = 0
    }
    segmentMap[segment]++
  })
  
  const labels = Object.keys(segmentMap)
  const values = Object.values(segmentMap)
  
  // Segment renkler
  const segmentColors = {
    'VIP': '#7B1FA2',      // Mor
    'Sadık': '#388E3C',    // Yeşil  
    'Düzenli': '#1976D2',  // Mavi
    'Yeni': '#F57C00',     // Turuncu
    'Diğer': '#757575'     // Gri
  }

  const colors = labels.map(label => segmentColors[label] || '#9E9E9E')

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 15
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 11,
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
          return `${context.label}: ${context.parsed} müşteri (${percentage}%)`
        }
      }
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
}
</style> 