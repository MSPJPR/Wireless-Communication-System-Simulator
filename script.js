let results = [];

function startSimulation() {
    const modulationScheme = document.getElementById('modulation').value;
    const noiseLevel = parseFloat(document.getElementById('noiseLevel').value);
    const length = parseInt(document.getElementById('length').value);

    const canvas = document.getElementById('signalCanvas');
    const ctx = canvas.getContext('2d');
    const resultsDiv = document.getElementById('results');

    // Clear canvas and results
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resultsDiv.innerHTML = '';

    // Generate and process signals
    const signal = generateSignal(modulationScheme, length);
    const noise = generateNoise(length, noiseLevel);
    const noisySignal = addNoise(signal, noise);

    drawSignal(ctx, noisySignal);
    const ber = calculateBER(signal, noisySignal);
    const signalPower = calculateSignalPower(signal);

    results = { modulationScheme, noiseLevel, length, signalPower, ber };

    resultsDiv.innerHTML = `
        <p>Modulation: ${modulationScheme}</p>
        <p>Signal Power: ${signalPower.toFixed(2)} dB</p>
        <p>Bit Error Rate (BER): ${ber.toFixed(5)}</p>
    `;
}

function generateSignal(modulation, length) {
    let signal = [];
    for (let i = 0; i < length; i++) {
        switch (modulation) {
            case 'bpsk':
                signal.push(Math.random() > 0.5 ? 1 : -1);
                break;
            case 'qpsk':
                signal.push(Math.sin(i * Math.PI / 10));
                break;
            case 'qam16':
                signal.push(Math.sin(i * Math.PI / 15) + Math.cos(i * Math.PI / 15));
                break;
            case 'fsk':
                signal.push(Math.sin(i * Math.PI / 20) + Math.sin(i * Math.PI / 25));
                break;
            case 'pam':
                signal.push(Math.random() > 0.5 ? 1 : 0);
                break;
        }
    }
    return signal;
}

function generateNoise(length, noiseLevel) {
    return Array.from({ length }, () => Math.random() * noiseLevel - noiseLevel / 2);
}

function addNoise(signal, noise) {
    return signal.map((value, index) => value + noise[index]);
}

function drawSignal(ctx, signal) {
    ctx.beginPath();
    ctx.moveTo(0, signal[0] * 50 + 150);
    for (let i = 1; i < signal.length; i++) {
        ctx.lineTo(i * (600 / signal.length), signal[i] * 50 + 150);
    }
    ctx.strokeStyle = '#0077cc';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function calculateSignalPower(signal) {
    const power = signal.reduce((acc, value) => acc + value ** 2, 0) / signal.length;
    return 10 * Math.log10(power);
}

function calculateBER(original, noisy) {
    let errors = 0;
    for (let i = 0; i < original.length; i++) {
        if (Math.round(original[i]) !== Math.round(noisy[i])) {
            errors++;
        }
    }
    return errors / original.length;
}

function exportResults() {
    const csvContent = `data:text/csv;charset=utf-8,Modulation,Noise Level,Length,Signal Power (dB),BER\n${results.modulationScheme},${results.noiseLevel},${results.length},${results.signalPower.toFixed(2)},${results.ber.toFixed(5)}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'simulation_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
