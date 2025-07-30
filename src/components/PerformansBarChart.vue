<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Performans'
  }
})

const chartData = computed(() => {
  const labels = props.data.map(item => 
    item.subeAd || item.urunAdi || item.kampanya || item.label || 'Bilinmiyor'
  )
  
  const values = props.data.map(item => 
    item.toplamCiro || item.toplamSatis || item.gelir || item.value || 0
  )
  
  const counts = props.data.map(item => 
    item.satisAdet || item.siparisSayisi || item.count || 0
  )

  return {
    labels,
    datasets: [
      {
        label: 'Toplam Ciro (₺)',
        data: values,
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
        borderColor: '#1976D2',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y'
      },
      {
        label: 'Satış Adedi',
        data: counts,
        backgroundColor: 'rgba(56, 142, 60, 0.7)',
        borderColor: '#388E3C',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y1'
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 12,
          family: 'Roboto, sans-serif'
        }
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
          if (context.datasetIndex === 0) {
            return `Ciro: ₺${context.parsed.y.toLocaleString('tr-TR')}`
          } else {
            return `Adet: ${context.parsed.y} sipariş`
          }
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 10
        },
        maxRotation: 45
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 10
        },
        callback: function(value) {
          return '₺' + value.toLocaleString('tr-TR')
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style> 