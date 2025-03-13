// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const currentDateElement = document.getElementById('current-date');
const currentTimeElement = document.getElementById('current-time');
const patientForm = document.getElementById('patient-form');
const patientTableBody = document.getElementById('patient-table-body');
const noDataMessage = document.getElementById('no-data-message');
const dashboardData = document.getElementById('dashboard-data');
const alertContainer = document.getElementById('alert-container');
const getStartedBtn = document.getElementById('get-started-btn');
const goToEncodeBtn = document.getElementById('go-to-encode-btn');
const interpretationResult = document.getElementById('interpretation-result');
const interpretationContent = document.getElementById('interpretation-content');

// Charts
let vitalsOverviewChart;
let bpDistributionChart;
let cardiacRateChart;
let temperatureChart;

// Vital signs reference values
const vitalSigns = {
    bloodPressure: {
        systolic: {
            min: 90,
            normal: 120,
            high: 140,
            crisis: 180
        },
        diastolic: {
            min: 60,
            normal: 80,
            high: 90,
            crisis: 120
        }
    },
    cardiacRate: {
        min: 60,
        max: 100
    },
    pulseRate: {
        min: 60,
        max: 100
    },
    respiratoryRate: {
        min: 12,
        max: 20
    },
    temperature: {
        min: 36.5,
        max: 37.5,
        fever: 38.0,
        hypothermia: 36.0
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadPatientData();
    setupEventListeners();
    
    // Start with the home page active
    changePage('home');
});

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    console.log('Nav links found:', navLinks.length);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            console.log('Navigation clicked:', targetPage);
            changePage(targetPage);
        });
    });

    // Patient Form Submission
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePatientData();
        });
    } else {
        console.error('Patient form not found in the DOM');
    }

    // Button Listeners
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Get Started button clicked');
            changePage('encode');
        });
    } else {
        console.error('Get Started button not found in the DOM');
    }

    if (goToEncodeBtn) {
        goToEncodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Go to Encode button clicked');
            changePage('encode');
        });
    } else {
        console.error('Go to Encode button not found in the DOM');
    }
    
    // Add export and clear data buttons event listeners
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportPatientData);
    }
    
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
}

// Navigation Functions
function changePage(pageId) {
    console.log('Changing page to:', pageId);
    
    // Check if pages exist
    if (!pages || pages.length === 0) {
        console.error('No page elements found');
        return;
    }
    
    // Validate pageId exists
    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
        console.error('Target page not found:', pageId);
        return;
    }
    
    // Update navigation active state
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active-nav');
        } else {
            link.classList.remove('active-nav');
        }
    });

    // Update page visibility
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
            console.log('Made page active:', pageId);
        } else {
            page.classList.remove('active');
        }
    });

    // Special handling for dashboard page
    if (pageId === 'dashboard') {
        updateDashboard();
    }
}

// Date and Time Functions
function updateDateTime() {
    if (!currentDateElement || !currentTimeElement) {
        console.error('Date/time elements not found');
        return;
    }
    
    const now = new Date();
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
    
    // Format time
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    currentTimeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Alert Functions
function showAlert(message, type) {
    if (!alertContainer) {
        console.error('Alert container not found');
        return;
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Patient Data Functions
function savePatientData() {
    // Get form values
    const nameInput = document.getElementById('patient-name');
    const systolicInput = document.getElementById('blood-pressure-systolic');
    const diastolicInput = document.getElementById('blood-pressure-diastolic');
    const cardiacRateInput = document.getElementById('cardiac-rate');
    const pulseRateInput = document.getElementById('pulse-rate');
    const respiratoryRateInput = document.getElementById('respiratory-rate');
    const temperatureInput = document.getElementById('temperature');
    
    // Check if all inputs exist
    if (!nameInput || !systolicInput || !diastolicInput || !cardiacRateInput || 
        !pulseRateInput || !respiratoryRateInput || !temperatureInput) {
        showAlert('Error: Form inputs not found', 'danger');
        return;
    }
    
    const name = nameInput.value;
    const systolic = parseInt(systolicInput.value);
    const diastolic = parseInt(diastolicInput.value);
    const cardiacRate = parseInt(cardiacRateInput.value);
    const pulseRate = parseInt(pulseRateInput.value);
    const respiratoryRate = parseInt(respiratoryRateInput.value);
    const temperature = parseFloat(temperatureInput.value);
    
    // Validate inputs
    if (!name || isNaN(systolic) || isNaN(diastolic) || isNaN(cardiacRate) || 
        isNaN(pulseRate) || isNaN(respiratoryRate) || isNaN(temperature)) {
        showAlert('Please fill all fields with valid values', 'warning');
        return;
    }
    
    // Create patient object
    const patient = {
        id: Date.now(), // Use timestamp as unique ID
        name,
        bloodPressure: {
            systolic,
            diastolic
        },
        cardiacRate,
        pulseRate,
        respiratoryRate,
        temperature,
        timestamp: new Date().toISOString(),
        interpretation: interpretVitalSigns(systolic, diastolic, cardiacRate, pulseRate, respiratoryRate, temperature)
    };
    
    // Get existing data from localStorage
    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    // Add new patient
    patients.push(patient);
    
    // Save back to localStorage
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // Show success message
    showAlert('Patient data saved successfully!', 'success');
    
    // Display interpretation
    displayInterpretation(patient.interpretation);
    
    // Reset form
    patientForm.reset();
}

function loadPatientData() {
    // Get data from localStorage
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    // Check if there's data available
    if (!noDataMessage || !dashboardData) {
        console.error('Data message elements not found');
        return;
    }
    
    if (patients.length === 0) {
        noDataMessage.classList.remove('hidden');
        dashboardData.classList.add('hidden');
    } else {
        noDataMessage.classList.add('hidden');
        dashboardData.classList.remove('hidden');
        
        // Populate table
        populatePatientTable(patients);
    }
}

function populatePatientTable(patients) {
    if (!patientTableBody) {
        console.error('Patient table body not found');
        return;
    }
    
    // Clear existing table rows
    patientTableBody.innerHTML = '';
    
    // Add each patient to table
    patients.forEach(patient => {
        const row = document.createElement('tr');
        
        // Determine overall status class
        let statusClass = 'status-normal';
        let statusText = 'Normal';
        
        const interpretation = patient.interpretation;
        if (interpretation.some(item => item.severity === 'danger')) {
            statusClass = 'status-danger';
            statusText = 'Critical';
        } else if (interpretation.some(item => item.severity === 'warning')) {
            statusClass = 'status-warning';
            statusText = 'Abnormal';
        }
        
        // Build row content
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg</td>
            <td>${patient.cardiacRate} bpm</td>
            <td>${patient.pulseRate} bpm</td>
            <td>${patient.respiratoryRate} bpm</td>
            <td>${patient.temperature.toFixed(1)}°C</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${patient.id}">Delete</button>
            </td>
        `;
        
        patientTableBody.appendChild(row);
        
        // Add event listener to delete button
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deletePatient(patient.id);
        });
    });
}

function deletePatient(patientId) {
    // Get existing data
    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    // Remove patient with matching ID
    patients = patients.filter(patient => patient.id !== patientId);
    
    // Save back to localStorage
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // Update UI
    populatePatientTable(patients);
    updateDashboard();
    
    // Show notification
    showAlert('Patient record deleted', 'success');
}

// Vital Signs Interpretation
function interpretVitalSigns(systolic, diastolic, cardiacRate, pulseRate, respiratoryRate, temperature) {
    const interpretation = [];
    
    // Blood Pressure Interpretation
    if (systolic < vitalSigns.bloodPressure.systolic.min || diastolic < vitalSigns.bloodPressure.diastolic.min) {
        interpretation.push({
            parameter: 'Blood Pressure',
            status: 'Low Blood Pressure (Hypotension)',
            message: 'Blood pressure is below normal range. Monitor for dizziness or fatigue.',
            severity: 'warning'
        });
    } else if (systolic >= vitalSigns.bloodPressure.systolic.crisis || diastolic >= vitalSigns.bloodPressure.diastolic.crisis) {
        interpretation.push({
            parameter: 'Blood Pressure',
            status: 'Hypertensive Crisis',
            message: 'Blood pressure is critically high. Immediate medical attention required.',
            severity: 'danger'
        });
    } else if (systolic >= vitalSigns.bloodPressure.systolic.high || diastolic >= vitalSigns.bloodPressure.diastolic.high) {
        interpretation.push({
            parameter: 'Blood Pressure',
            status: 'High Blood Pressure (Hypertension)',
            message: 'Blood pressure is elevated. Monitor and consider interventions.',
            severity: 'warning'
        });
    } else {
        interpretation.push({
            parameter: 'Blood Pressure',
            status: 'Normal Blood Pressure',
            message: 'Blood pressure is within normal range.',
            severity: 'normal'
        });
    }
    
    // Cardiac Rate Interpretation
    if (cardiacRate < vitalSigns.cardiacRate.min) {
        interpretation.push({
            parameter: 'Cardiac Rate',
            status: 'Bradycardia',
            message: 'Heart rate is slower than normal. Monitor for symptoms.',
            severity: 'warning'
        });
    } else if (cardiacRate > vitalSigns.cardiacRate.max) {
        interpretation.push({
            parameter: 'Cardiac Rate',
            status: 'Tachycardia',
            message: 'Heart rate is faster than normal. Assess for causes.',
            severity: 'warning'
        });
    } else {
        interpretation.push({
            parameter: 'Cardiac Rate',
            status: 'Normal Heart Rate',
            message: 'Heart rate is within normal range.',
            severity: 'normal'
        });
    }
    
    // Pulse Rate Interpretation
    if (pulseRate < vitalSigns.pulseRate.min) {
        interpretation.push({
            parameter: 'Pulse Rate',
            status: 'Low Pulse Rate',
            message: 'Pulse rate is below normal range. Monitor cardiovascular status.',
            severity: 'warning'
        });
    } else if (pulseRate > vitalSigns.pulseRate.max) {
        interpretation.push({
            parameter: 'Pulse Rate',
            status: 'Elevated Pulse Rate',
            message: 'Pulse rate is above normal range. Check for exertion, anxiety, or other causes.',
            severity: 'warning'
        });
    } else {
        interpretation.push({
            parameter: 'Pulse Rate',
            status: 'Normal Pulse Rate',
            message: 'Pulse rate is within normal range.',
            severity: 'normal'
        });
    }
    
    // Respiratory Rate Interpretation
    if (respiratoryRate < vitalSigns.respiratoryRate.min) {
        interpretation.push({
            parameter: 'Respiratory Rate',
            status: 'Bradypnea',
            message: 'Breathing rate is slower than normal. Monitor oxygen status.',
            severity: 'warning'
        });
    } else if (respiratoryRate > vitalSigns.respiratoryRate.max) {
        interpretation.push({
            parameter: 'Respiratory Rate',
            status: 'Tachypnea',
            message: 'Breathing rate is faster than normal. Assess for respiratory distress.',
            severity: 'warning'
        });
    } else {
        interpretation.push({
            parameter: 'Respiratory Rate',
            status: 'Normal Respiratory Rate',
            message: 'Breathing rate is within normal range.',
            severity: 'normal'
        });
    }
    
    // Temperature Interpretation
    if (temperature < vitalSigns.temperature.hypothermia) {
        interpretation.push({
            parameter: 'Temperature',
            status: 'Hypothermia',
            message: 'Body temperature is dangerously low. Immediate warming measures required.',
            severity: 'danger'
        });
    } else if (temperature < vitalSigns.temperature.min) {
        interpretation.push({
            parameter: 'Temperature',
            status: 'Low Body Temperature',
            message: 'Body temperature is below normal range. Monitor for signs of hypothermia.',
            severity: 'warning'
        });
    } else if (temperature >= vitalSigns.temperature.fever) {
        interpretation.push({
            parameter: 'Temperature',
            status: 'Fever',
            message: 'Body temperature is elevated. Assess for infection or other causes.',
            severity: 'warning'
        });
    } else {
        interpretation.push({
            parameter: 'Temperature',
            status: 'Normal Temperature',
            message: 'Body temperature is within normal range.',
            severity: 'normal'
        });
    }
    
    return interpretation;
}

function displayInterpretation(interpretation) {
    // Check if interpretation elements exist
    if (!interpretationResult || !interpretationContent) {
        console.error('Interpretation elements not found');
        return;
    }
    
    // Clear previous interpretation
    interpretationContent.innerHTML = '';
    
    // Display overall status
    let overallSeverity = 'normal';
    if (interpretation.some(item => item.severity === 'danger')) {
        overallSeverity = 'danger';
    } else if (interpretation.some(item => item.severity === 'warning')) {
        overallSeverity = 'warning';
    }
    
    // Update result heading
    interpretationResult.className = `interpretation-result status-${overallSeverity}`;
    
    if (overallSeverity === 'danger') {
        interpretationResult.textContent = 'Critical Condition - Immediate Attention Required';
    } else if (overallSeverity === 'warning') {
        interpretationResult.textContent = 'Abnormal Vital Signs - Monitor Closely';
    } else {
        interpretationResult.textContent = 'Normal Vital Signs';
    }
    
    // Create interpretation details
    interpretation.forEach(item => {
        const interpretItem = document.createElement('div');
        interpretItem.className = `interpret-item ${item.severity}`;
        
        interpretItem.innerHTML = `
            <h4>${item.parameter}: <span class="status-${item.severity}">${item.status}</span></h4>
            <p>${item.message}</p>
        `;
        
        interpretationContent.appendChild(interpretItem);
    });
}

// Dashboard Functions
function updateDashboard() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library is not loaded');
        return;
    }
    
    // Get data from localStorage
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    if (!noDataMessage || !dashboardData) {
        console.error('Dashboard elements not found');
        return;
    }
    
    if (patients.length === 0) {
        noDataMessage.classList.remove('hidden');
        dashboardData.classList.add('hidden');
        return;
    }
    
    noDataMessage.classList.add('hidden');
    dashboardData.classList.remove('hidden');
    
    // Update dashboard statistics
    updateDashboardStats(patients);
    
    // Update charts
    try {
        createVitalsOverviewChart(patients);
        createBPDistributionChart(patients);
        createCardiacRateChart(patients);
        createTemperatureChart(patients);
    } catch (error) {
        console.error('Error creating charts:', error);
    }
}

function updateDashboardStats(patients) {
    const totalPatientsElement = document.getElementById('total-patients');
    const criticalCountElement = document.getElementById('critical-count');
    const abnormalCountElement = document.getElementById('abnormal-count');
    const normalCountElement = document.getElementById('normal-count');
    const criticalPercentElement = document.getElementById('critical-percent');
    const abnormalPercentElement = document.getElementById('abnormal-percent');
    const normalPercentElement = document.getElementById('normal-percent');
    
    if (!totalPatientsElement || !criticalCountElement || !abnormalCountElement || 
        !normalCountElement || !criticalPercentElement || !abnormalPercentElement || 
        !normalPercentElement) {
        console.error('Dashboard statistics elements not found');
        return;
    }
    
    const totalPatients = patients.length;
    const criticalCount = patients.filter(p => p.interpretation.some(i => i.severity === 'danger')).length;
    const abnormalCount = patients.filter(p => 
        p.interpretation.some(i => i.severity === 'warning') && 
        !p.interpretation.some(i => i.severity === 'danger')
    ).length;
    const normalCount = patients.filter(p => 
        !p.interpretation.some(i => i.severity === 'warning') && 
        !p.interpretation.some(i => i.severity === 'danger')
    ).length;
    
    // Update statistics display
    totalPatientsElement.textContent = totalPatients;
    criticalCountElement.textContent = criticalCount;
    abnormalCountElement.textContent = abnormalCount;
    normalCountElement.textContent = normalCount;
    
    // Calculate percentages
    criticalPercentElement.textContent = 
        totalPatients > 0 ? Math.round((criticalCount / totalPatients) * 100) + '%' : '0%';
    abnormalPercentElement.textContent = 
        totalPatients > 0 ? Math.round((abnormalCount / totalPatients) * 100) + '%' : '0%';
    normalPercentElement.textContent = 
        totalPatients > 0 ? Math.round((normalCount / totalPatients) * 100) + '%' : '0%';
}

function createVitalsOverviewChart(patients) {
    const chartCanvas = document.getElementById('vitals-overview-chart');
    if (!chartCanvas) {
        console.error('Vitals overview chart canvas not found');
        return;
    }
    
    // Calculate percentages for each vital sign
    const vitalCategories = ['Blood Pressure', 'Cardiac Rate', 'Pulse Rate', 'Respiratory Rate', 'Temperature'];
    const normalData = [];
    const abnormalData = [];
    
    vitalCategories.forEach((category) => {
        // Count normal vs abnormal for each category
        const totalForCategory = patients.length;
        const abnormalForCategory = patients.filter(p => {
            const relevantInterpretation = p.interpretation.find(i => i.parameter === category);
            return relevantInterpretation && relevantInterpretation.severity !== 'normal';
        }).length;
        
        const normalForCategory = totalForCategory - abnormalForCategory;
        
        // Convert to percentages
        normalData.push(Math.round((normalForCategory / totalForCategory) * 100));
        abnormalData.push(Math.round((abnormalForCategory / totalForCategory) * 100));
    });
    
    // Destroy previous chart if it exists
    if (vitalsOverviewChart) {
        vitalsOverviewChart.destroy();
    }
    
    // Create new chart
    const ctx = chartCanvas.getContext('2d');
    vitalsOverviewChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: vitalCategories,
            datasets: [
                {
                    label: 'Normal',
                    data: normalData,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                },
                {
                    label: 'Abnormal',
                    data: abnormalData,
                    backgroundColor: '#FF5722',
                    borderColor: '#E64A19',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Vital Signs'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Vital Signs Overview'
                }
            }
        }
    });
}

function createBPDistributionChart(patients) {
    const chartCanvas = document.getElementById('bp-distribution-chart');
    if (!chartCanvas) {
        console.error('BP distribution chart canvas not found');
        return;
    }
    
    // Count patients in each BP category
    const hypotensionCount = patients.filter(p => {
        const bpInterpretation = p.interpretation.find(i => i.parameter === 'Blood Pressure');
        return bpInterpretation && bpInterpretation.status.includes('Low');
    }).length;
    
    const normalCount = patients.filter(p => {
        const bpInterpretation = p.interpretation.find(i => i.parameter === 'Blood Pressure');
        return bpInterpretation && bpInterpretation.status.includes('Normal');
    }).length;
    
    const hypertensionCount = patients.filter(p => {
        const bpInterpretation = p.interpretation.find(i => i.parameter === 'Blood Pressure');
        return bpInterpretation && bpInterpretation.status.includes('High') && !bpInterpretation.status.includes('Crisis');
    }).length;
    
    const crisisCount = patients.filter(p => {
        const bpInterpretation = p.interpretation.find(i => i.parameter === 'Blood Pressure');
        return bpInterpretation && bpInterpretation.status.includes('Crisis');
    }).length;
    
    // Destroy previous chart if it exists
    if (bpDistributionChart) {
        bpDistributionChart.destroy();
    }
    
    // Create new chart
    const ctx = chartCanvas.getContext('2d');
    bpDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Hypotension', 'Normal', 'Hypertension', 'Hypertensive Crisis'],
            datasets: [{
                data: [hypotensionCount, normalCount, hypertensionCount, crisisCount],
                backgroundColor: ['#2196F3', '#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Blood Pressure Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createCardiacRateChart(patients) {
    const chartCanvas = document.getElementById('cardiac-rate-chart');
    if (!chartCanvas) {
        console.error('Cardiac rate chart canvas not found');
        return;
    }
    
    // Calculate distribution
    const bradycardiaCount = patients.filter(p => p.cardiacRate < vitalSigns.cardiacRate.min).length;
    const normalCount = patients.filter(p => p.cardiacRate >= vitalSigns.cardiacRate.min && p.cardiacRate <= vitalSigns.cardiacRate.max).length;
    const tachycardiaCount = patients.filter(p => p.cardiacRate > vitalSigns.cardiacRate.max).length;
    
    // Destroy previous chart if it exists
    if (cardiacRateChart) {
        cardiacRateChart.destroy();
    }
    
    // Create new chart
    const ctx = chartCanvas.getContext('2d');
    cardiacRateChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bradycardia', 'Normal', 'Tachycardia'],
            datasets: [{
                data: [bradycardiaCount, normalCount, tachycardiaCount],
                backgroundColor: ['#2196F3', '#4CAF50', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Cardiac Rate Distribution'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createTemperatureChart(patients) {
    const chartCanvas = document.getElementById('temperature-chart');
    if (!chartCanvas) {
        console.error('Temperature chart canvas not found');
        return;
    }
    
    // Sort patients by timestamp for chronological display
    const sortedPatients = [...patients].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Only use the last 10 patients for better visualization
    const recentPatients = sortedPatients.slice(-10);
    
    // Prepare data
    const labels = recentPatients.map(p => p.name);
    const temperatureData = recentPatients.map(p => p.temperature);
    
    // Destroy previous chart if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    // Create new chart
    const ctx = chartCanvas.getContext('2d');
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureData,
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                borderColor: 'rgba(255, 152, 0, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 35,
                    max: 40,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Patient'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Patient Temperature Trends'
                }
            }
        }
    });
    
    // Add annotation plugin if available
    if (Chart.annotation) {
        temperatureChart.options.plugins.annotation = {
            annotations: {
                feverLine: {
                    type: 'line',
                    yMin: vitalSigns.temperature.fever,
                    yMax: vitalSigns.temperature.fever,
                    borderColor: '#F44336',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        content: 'Fever',
                        enabled: true,
                        position: 'end'
                    }
                },
 normalLow: {
                    type: 'line',
                    yMin: vitalSigns.temperature.min,
                    yMax: vitalSigns.temperature.min,
                    borderColor: '#2196F3',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        content: 'Normal Low',
                        enabled: true,
                        position: 'start'
                    }
                },
                normalHigh: {
                    type: 'line',
                    yMin: vitalSigns.temperature.max,
                    yMax: vitalSigns.temperature.max,
                    borderColor: '#FFC107',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        content: 'Normal High',
                        enabled: true,
                        position: 'end'
                    }
                }
            }
        };
    }
}

// Export and Data Management Functions
function exportPatientData() {
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    if (patients.length === 0) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    // Convert patient data to CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Name,Systolic BP,Diastolic BP,Cardiac Rate,Pulse Rate,Respiratory Rate,Temperature,Status,Date\n';
    
    // Add data rows
    patients.forEach(patient => {
        // Determine overall status
        let status = 'Normal';
        if (patient.interpretation.some(item => item.severity === 'danger')) {
            status = 'Critical';
        } else if (patient.interpretation.some(item => item.severity === 'warning')) {
            status = 'Abnormal';
        }
        
        // Format date from timestamp
        const date = new Date(patient.timestamp).toLocaleString();
        
        // Add row
        csvContent += `${patient.name},${patient.bloodPressure.systolic},${patient.bloodPressure.diastolic},`;
        csvContent += `${patient.cardiacRate},${patient.pulseRate},${patient.respiratoryRate},${patient.temperature.toFixed(1)},`;
        csvContent += `${status},${date}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'patient_data.csv');
    document.body.appendChild(link);
    
    // Trigger download and remove link
    link.click();
    document.body.removeChild(link);
    
    showAlert('Data exported successfully', 'success');
}

function clearAllData() {
    // Show confirmation
    if (confirm('Are you sure you want to delete all patient data? This action cannot be undone.')) {
        // Clear localStorage
        localStorage.removeItem('patients');
        
        // Update UI
        if (patientTableBody) {
            patientTableBody.innerHTML = '';
        }
        
        if (noDataMessage && dashboardData) {
            noDataMessage.classList.remove('hidden');
            dashboardData.classList.add('hidden');
        }
        
        // Reset any existing charts
        if (vitalsOverviewChart) vitalsOverviewChart.destroy();
        if (bpDistributionChart) bpDistributionChart.destroy();
        if (cardiacRateChart) cardiacRateChart.destroy();
        if (temperatureChart) temperatureChart.destroy();
        
        showAlert('All patient data has been cleared', 'success');
    }
}

// Fix for page navigation issues
function checkPageVisibility() {
    console.log('Checking page visibility');
    
    // Ensure at least one page is visible
    let anyPageVisible = false;
    
    pages.forEach(page => {
        if (page.classList.contains('active')) {
            anyPageVisible = true;
            console.log('Found visible page:', page.id);
        }
    });
    
    // If no page is visible, make the home page visible
    if (!anyPageVisible) {
        console.log('No pages visible, activating home page');
        const homePage = document.getElementById('home');
        if (homePage) {
            homePage.classList.add('active');
            
            // Also update navigation active state
            navLinks.forEach(link => {
                if (link.getAttribute('data-page') === 'home') {
                    link.classList.add('active-nav');
                } else {
                    link.classList.remove('active-nav');
                }
            });
        } else {
            console.error('Home page not found');
        }
    }
}

// Add page visibility check to initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadPatientData();
    setupEventListeners();
    
    // Check and fix page visibility
    checkPageVisibility();
    
    // Additional check after a short delay to handle any race conditions
    setTimeout(checkPageVisibility, 500);
});

// Add a window resize handler to ensure page visibility persists
window.addEventListener('resize', function() {
    checkPageVisibility();
});

// Additional enhancement for navigation debugging
function debugNavigationState() {
    console.log('Navigation state:');
    console.log('Active pages:', Array.from(pages).filter(page => page.classList.contains('active')).map(page => page.id));
    console.log('Active nav links:', Array.from(navLinks).filter(link => link.classList.contains('active-nav')).map(link => link.getAttribute('data-page')));
}

// Call debug function when changing pages
const originalChangePage = changePage;
changePage = function(pageId) {
    console.log('ChangePage called with:', pageId);
    originalChangePage(pageId);
    debugNavigationState();
    
    // Force check visibility after page change
    setTimeout(checkPageVisibility, 100);
};