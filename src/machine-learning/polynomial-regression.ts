export class PolynomialRegression {
    private coefficients: number[]
    private bias: number
    private learningRate: number
    private degree: number
    private numFeatures: number
    private bounds: [number, number][] | undefined

    constructor(
        degree: number,
        numFeatures: number,
        learningRate: number = 0.01,
        bounds: [number, number][] | undefined = undefined
    ) {
        this.degree = degree
        this.numFeatures = numFeatures
        this.learningRate = learningRate
        this.bounds = bounds
        this.bias = 0
        this.coefficients = new Array(this.getTotalTerms()).fill(0)
    }

    private getTotalTerms(): number {
        return this.numFeatures * this.degree
    }

    private transformFeatures(X: number[][]): number[][] {
        return X.map(row =>
            row.flatMap((feature) =>
                Array.from({ length: this.degree }, (_, d) => Math.pow(feature, d + 1))
            )
        )
    }

    fit(X: number[][], y: number[], epochs: number = 1000): void {
        const m = X.length
        const polyFeatures = this.transformFeatures(X)

        for (let epoch = 0; epoch < epochs; epoch++) {
            const predictions = this.predict(X)
            const errors = predictions.map((pred, i) => pred - y[i])

            const gradients = new Array(this.coefficients.length).fill(0)
            let biasGradient = 0

            for (let i = 0; i < m; i++) {
                for (let j = 0; j < this.coefficients.length; j++) {
                    gradients[j] += polyFeatures[i][j] * errors[i]
                }
                biasGradient += errors[i]
            }

            for (let j = 0; j < this.coefficients.length; j++) {
                this.coefficients[j] -= (this.learningRate / m) * gradients[j]
                if (this.bounds !== undefined) {
                    const [min, max] = this.bounds[j % this.numFeatures]
                    if (this.coefficients[j] < min) this.coefficients[j] = min
                    if (this.coefficients[j] > max) this.coefficients[j] = max
                }
            }

            this.bias -= (this.learningRate / m) * biasGradient
        }
    }

    predict(X: number[][]): number[] {
        const polyFeatures = this.transformFeatures(X)

        return polyFeatures.map(row => {
            let prediction = this.bias
            for (let j = 0; j < this.coefficients.length; j++) {
                prediction += this.coefficients[j] * row[j]
            }
            return prediction
        })
    }

    getParameters(): { coefficients: number[]; bias: number } {
        return { coefficients: this.coefficients, bias: this.bias }
    }
}
