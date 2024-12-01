import { Chart, ChartItem, registerables } from "chart.js"
import { PolynomialRegression } from "../../src/machine-learning/polynomial-regression"

Chart.register(...registerables)

const CANVAS = document.getElementById('chart-rendering')

const data: { x: number; y: number }[] = []
const prediction: { x: number; y: number }[] = []

const CHART = new Chart(CANVAS as ChartItem, {
	type: 'line',
	data: {
		datasets: [{
			data: data,
			borderWidth: 1
		}, {
      data: prediction,
      borderWidth: 1
    }]
	},
	options: {
		scales: {
			x: {
				type: 'linear',
				beginAtZero: true
			},
			y: {
				beginAtZero: true
			}
		}
	}
})

const MODEL = new PolynomialRegression(3, 10, 0.01)

function train() {

  const X: number[][] = []
  const Y: number[] = []

	function appendSet() {
    const sigma = Math.random() * 0.1
    const a = Math.random() * 2
    const b = Math.random() * 2
    const start = Math.random() * 5
    const stop = start + 10
    const points = generateStochasticSin(sigma, a, b)(start, stop, 0.1)
    Y.push(points[100].y)
    const X_set = []
    for (let i = 0; i < 10; i++) {
      X_set.push(points[i].y)
    }
    X.push(X_set)
  }
  for (let i = 0; i < 1000; i++) {
    appendSet()
  }

  MODEL.fit(X, Y)
}
train()


const testPoints = generateStochasticSin(0, 1, 1)(0, 40, 0.1)
// data.push(...testPoints)

const past: { x: number; y: number }[] = []
for (let i = 0; i < testPoints.length; i++) {
  if (i < 100) {
    past.push(testPoints[i])
  } else {
    const pastPoints = past.slice(i - 100, i)  // Slice last 100 points
    const X_set = pastPoints.map(p => p.y)  // Use y-values as features
    past.push({ x: i * 0.1, y: MODEL.predict([X_set])[0] })
  }
}

prediction.push(...past)



CHART.update()






function generateStochasticSin(sigma: number, a: number, b: number) {
	function sin(start: number, stop: number, step: number) {
		const points: { x: number; y: number }[] = []
		for (let x = start; x <= stop; x += step) {
			let y = a * Math.sin(b * x)
			y += sigma * (2 * (Math.random() - 0.5))
			points.push({ x: x, y: y })
		}
		return points
	}
	return sin
}