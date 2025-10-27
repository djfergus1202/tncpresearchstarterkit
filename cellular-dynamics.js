// Cellular Dynamics Simulation - Complete JavaScript Implementation
// Developed by: D. Ferguson
// Module: Cellular Dynamics & Clonal Evolution

//========================
// GLOBAL STATE
//========================

let cellSimulation = {
  // Initial state
  clonality: 'monoclonal',
  populationSize: 1000,
  cells: [],
  
  // Cell parameters
  params: {
    membranePotential: -70,
    metabolicRate: 1.0,
    cellCycleState: 'G1',
    proliferationRate: 50,
    apoptosisSensitivity: 50,
    differentiation: 0
  },
  
  // Environment
  environment: {
    glucose: 5.0,
    oxygen: 5.0,
    lactate: 1.0,
    glutamine: 2.0,
    growthFactors: {
      EGF: 10,
      IGF1: 50,
      VEGF: 20,
      TNF: 0
    },
    pH: 7.4,
    temperature: 37
  },
  
  // Events
  events: [],
  
  // Simulation state
  running: false,
  paused: false,
  currentTime: 0,
  duration: 120,
  timeStep: 1,
  
  // Results
  history: {
    time: [],
    population: [],
    clones: [],
    metabolites: []
  }
};

//========================
// MODULE 1: INITIAL STATE
//========================

function selectClonality(type) {
  cellSimulation.clonality = type;
  
  // Update UI
  document.querySelectorAll('.cell-type-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-clonality="${type}"]`).classList.add('selected');
  
  showModal(`Population type: ${type}`, 'info');
}

function updateCellParam(input) {
  const id = input.id;
  const value = parseFloat(input.value);
  const displayId = id + '-value';
  
  // Update display
  const display = document.getElementById(displayId);
  if (display) {
    switch(id) {
      case 'cell-membrane':
        display.textContent = value + ' mV';
        cellSimulation.params.membranePotential = value;
        break;
      case 'cell-metabolism':
        display.textContent = value + 'x';
        cellSimulation.params.metabolicRate = value;
        break;
      case 'cell-proliferation':
        display.textContent = value + '%';
        cellSimulation.params.proliferationRate = value;
        break;
      case 'cell-apoptosis':
        display.textContent = value;
        cellSimulation.params.apoptosisSensitivity = value;
        break;
      case 'cell-differentiation':
        display.textContent = value + '%';
        cellSimulation.params.differentiation = value;
        break;
    }
  }
}

function loadDefaultEnvironment() {
  // Reset to physiological defaults
  document.getElementById('env-glucose').value = 5.0;
  document.getElementById('env-oxygen').value = 5.0;
  document.getElementById('env-lactate').value = 1.0;
  document.getElementById('env-glutamine').value = 2.0;
  document.getElementById('gf-egf').value = 10;
  document.getElementById('gf-igf1').value = 50;
  document.getElementById('gf-vegf').value = 20;
  document.getElementById('gf-tnf').value = 0;
  document.getElementById('env-ph').value = 7.4;
  document.getElementById('env-temp').value = 37;
  
  showModal('Environment reset to physiological defaults', 'success');
}

//========================
// MODULE 2: EVENTS
//========================

function addMutationEvent() {
  const time = parseInt(document.getElementById('mutation-time').value);
  const gene = document.getElementById('mutation-gene').value;
  const type = document.getElementById('mutation-type').value;
  const target = document.getElementById('mutation-target').value;
  
  const event = {
    id: 'evt_' + Date.now(),
    time: time,
    type: 'mutation',
    gene: gene,
    mutationType: type,
    target: target,
    description: `${type} of ${gene} at ${time}h`
  };
  
  cellSimulation.events.push(event);
  updateEventsDisplay();
  updateTimeline();
  
  showModal(`Mutation event scheduled: ${gene} ${type} at ${time}h`, 'success');
}

function addExpressionEvent() {
  const time = parseInt(document.getElementById('expression-time').value);
  const gene = document.querySelector('.gene-chip.selected')?.dataset.gene || 'Unknown';
  const action = document.getElementById('expression-action').value;
  const fold = parseFloat(document.getElementById('expression-fold').value);
  const target = document.getElementById('expression-target').value;
  
  if (gene === 'Unknown') {
    showModal('Please select a gene', 'error');
    return;
  }
  
  const event = {
    id: 'evt_' + Date.now(),
    time: time,
    type: 'expression',
    gene: gene,
    action: action,
    foldChange: fold,
    target: target,
    description: `${action} ${gene} (${fold}x) at ${time}h`
  };
  
  cellSimulation.events.push(event);
  updateEventsDisplay();
  updateTimeline();
  
  showModal(`Expression event scheduled: ${gene} ${action} at ${time}h`, 'success');
}

function addEnvironmentEvent() {
  const time = parseInt(document.getElementById('env-event-time').value);
  const perturbation = document.getElementById('env-perturbation').value;
  const duration = parseInt(document.getElementById('env-duration').value);
  
  const event = {
    id: 'evt_' + Date.now(),
    time: time,
    type: 'environment',
    perturbation: perturbation,
    duration: duration,
    description: `${perturbation} for ${duration}h starting at ${time}h`
  };
  
  cellSimulation.events.push(event);
  updateEventsDisplay();
  updateTimeline();
  
  showModal(`Environmental event scheduled: ${perturbation} at ${time}h`, 'success');
}

// Gene selector interaction
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.gene-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.gene-chip').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
});

function updateEnvPerturbation() {
  const perturbation = document.getElementById('env-perturbation').value;
  const paramsDiv = document.getElementById('env-perturbation-params');
  
  let html = '';
  switch(perturbation) {
    case 'hypoxia':
      html = '<div class="form-group"><label>New Oxygen Level (%)</label><input type="number" id="hypoxia-o2" value="1.0" step="0.1" min="0" max="21"></div>';
      break;
    case 'nutrient-deprivation':
      html = '<div class="form-group"><label>Reduce Glucose to (mM)</label><input type="number" id="nutrient-glucose" value="0.5" step="0.1" min="0"></div>';
      break;
    case 'acidosis':
      html = '<div class="form-group"><label>New pH</label><input type="number" id="acidosis-ph" value="6.5" step="0.1" min="6.0" max="7.5"></div>';
      break;
    case 'heat-shock':
      html = '<div class="form-group"><label>Temperature (°C)</label><input type="number" id="heatshock-temp" value="42" min="37" max="45"></div>';
      break;
    case 'drug':
      html = '<div class="form-group"><label>Drug Effect</label><select id="drug-effect"><option>Increase Apoptosis</option><option>Inhibit Proliferation</option><option>Block Signaling</option></select></div>';
      break;
  }
  
  paramsDiv.innerHTML = html;
}

function updateEventsDisplay() {
  const table = document.getElementById('events-table');
  
  if (cellSimulation.events.length === 0) {
    table.innerHTML = '<p style="color: var(--muted);">No events scheduled yet.</p>';
    return;
  }
  
  // Sort events by time
  const sortedEvents = [...cellSimulation.events].sort((a, b) => a.time - b.time);
  
  let html = '<table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
  
  sortedEvents.forEach(event => {
    html += `
      <tr>
        <td>${event.time}h</td>
        <td><span class="pill pill-${event.type === 'mutation' ? 'hot' : event.type === 'expression' ? 'new' : 'beta'}">${event.type}</span></td>
        <td>${event.description}</td>
        <td><button class="btn btn-sm btn-outline" onclick="removeEvent('${event.id}')">Remove</button></td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  table.innerHTML = html;
}

function removeEvent(eventId) {
  cellSimulation.events = cellSimulation.events.filter(e => e.id !== eventId);
  updateEventsDisplay();
  updateTimeline();
  showModal('Event removed', 'info');
}

function updateTimeline() {
  const timeline = document.getElementById('event-timeline');
  const duration = parseInt(document.getElementById('sim-duration').value);
  
  // Clear existing markers (except start)
  const existingMarkers = timeline.querySelectorAll('.timeline-marker:not([data-time="0"])');
  existingMarkers.forEach(marker => marker.remove());
  
  // Add event markers
  cellSimulation.events.forEach(event => {
    const percent = (event.time / duration) * 100;
    const marker = document.createElement('div');
    marker.className = 'timeline-marker';
    marker.style.left = percent + '%';
    marker.dataset.time = event.time;
    marker.innerHTML = `<span class="timeline-event">${event.time}h: ${event.gene || event.perturbation || 'Event'}</span>`;
    timeline.appendChild(marker);
  });
}

//========================
// MODULE 3: SIMULATION
//========================

let simulationInterval = null;

function initializeCells() {
  cellSimulation.cells = [];
  const popSize = parseInt(document.getElementById('cell-pop-size').value);
  
  for (let i = 0; i < popSize; i++) {
    cellSimulation.cells.push(createCell(i, 'clone_0'));
  }
  
  cellSimulation.currentTime = 0;
  cellSimulation.history = {
    time: [0],
    population: [popSize],
    clones: [{ clone_0: popSize }],
    metabolites: [{
      glucose: parseFloat(document.getElementById('env-glucose').value),
      oxygen: parseFloat(document.getElementById('env-oxygen').value)
    }]
  };
}

function createCell(id, cloneID) {
  return {
    id: id,
    cloneID: cloneID,
    generation: 0,
    mutations: [],
    expressionChanges: [],
    state: cellSimulation.params.cellCycleState,
    age: 0,
    proliferationRate: cellSimulation.params.proliferationRate,
    apoptosisRate: cellSimulation.params.apoptosisSensitivity,
    alive: true
  };
}

function startCellSimulation() {
  if (cellSimulation.running) return;
  
  // Initialize
  initializeCells();
  cellSimulation.duration = parseInt(document.getElementById('sim-duration').value);
  cellSimulation.timeStep = parseFloat(document.getElementById('sim-timestep').value);
  cellSimulation.running = true;
  cellSimulation.paused = false;
  
  // Update UI
  document.getElementById('start-sim-btn').disabled = true;
  document.getElementById('pause-sim-btn').disabled = false;
  document.getElementById('stop-sim-btn').disabled = false;
  document.getElementById('sim-visualization').style.display = 'block';
  document.getElementById('sim-total-time').textContent = cellSimulation.duration;
  
  // Track usage
  if (typeof trackToolUsage === 'function') {
    trackToolUsage('cellular-dynamics', {
      populationSize: cellSimulation.cells.length,
      duration: cellSimulation.duration,
      events: cellSimulation.events.length
    });
  }
  
  // Start simulation loop
  simulationInterval = setInterval(simulationStep, 100); // Update every 100ms
  
  showModal('Simulation started', 'success');
}

function simulationStep() {
  if (cellSimulation.paused) return;
  
  // Advance time
  cellSimulation.currentTime += cellSimulation.timeStep;
  
  // Check for events
  processEvents();
  
  // Update cells
  updateCellPopulation();
  
  // Update environment
  updateEnvironment();
  
  // Record history
  recordHistory();
  
  // Update visualization
  updateVisualization();
  
  // Check if done
  if (cellSimulation.currentTime >= cellSimulation.duration) {
    stopCellSimulation();
  }
}

function processEvents() {
  const currentEvents = cellSimulation.events.filter(e => 
    Math.abs(e.time - cellSimulation.currentTime) < cellSimulation.timeStep
  );
  
  currentEvents.forEach(event => {
    switch(event.type) {
      case 'mutation':
        applyMutation(event);
        break;
      case 'expression':
        applyExpressionChange(event);
        break;
      case 'environment':
        applyEnvironmentalChange(event);
        break;
    }
  });
}

function applyMutation(event) {
  let targetCells = [];
  
  switch(event.target) {
    case 'single':
      targetCells = [cellSimulation.cells[Math.floor(Math.random() * cellSimulation.cells.length)]];
      break;
    case 'subset':
      const percent = 10; // Could be from event data
      const count = Math.floor(cellSimulation.cells.length * percent / 100);
      targetCells = cellSimulation.cells.slice(0, count);
      break;
    case 'all':
      targetCells = cellSimulation.cells;
      break;
  }
  
  targetCells.forEach(cell => {
    if (!cell.alive) return;
    
    cell.mutations.push({
      gene: event.gene,
      type: event.mutationType,
      time: cellSimulation.currentTime
    });
    
    // Assign new clone ID
    cell.cloneID = 'clone_' + event.gene + '_' + Math.floor(cellSimulation.currentTime);
    
    // Apply mutation effects
    if (event.gene === 'TP53' && event.mutationType === 'knockout') {
      cell.apoptosisRate *= 0.1; // Resistant to apoptosis
      cell.proliferationRate *= 1.5; // Increased proliferation
    } else if (event.gene === 'KRAS' && event.mutationType === 'activation') {
      cell.proliferationRate *= 2.0; // Hyperproliferation
    } else if (event.gene === 'PTEN' && event.mutationType === 'knockout') {
      cell.proliferationRate *= 1.8;
      cell.apoptosisRate *= 0.3;
    }
  });
}

function applyExpressionChange(event) {
  let targetCells = cellSimulation.cells.filter(c => c.alive);
  
  if (event.target === 'mutants') {
    targetCells = targetCells.filter(c => c.mutations.length > 0);
  } else if (event.target === 'wildtype') {
    targetCells = targetCells.filter(c => c.mutations.length === 0);
  }
  
  targetCells.forEach(cell => {
    cell.expressionChanges.push({
      gene: event.gene,
      action: event.action,
      fold: event.foldChange,
      time: cellSimulation.currentTime
    });
    
    // Apply expression effects
    if (event.gene === 'BCL2' && event.action === 'activate') {
      cell.apoptosisRate *= 0.2; // Anti-apoptotic
    } else if (event.gene === 'BAX' && event.action === 'activate') {
      cell.apoptosisRate *= 3.0; // Pro-apoptotic
    }
  });
}

function applyEnvironmentalChange(event) {
  if (event.perturbation === 'hypoxia') {
    cellSimulation.environment.oxygen = 1.0;
  } else if (event.perturbation === 'nutrient-deprivation') {
    cellSimulation.environment.glucose = 0.5;
  } else if (event.perturbation === 'acidosis') {
    cellSimulation.environment.pH = 6.5;
  }
}

function updateCellPopulation() {
  const aliveCells = cellSimulation.cells.filter(c => c.alive);
  const capacity = parseInt(document.getElementById('sim-capacity').value);
  
  // Proliferation
  aliveCells.forEach(cell => {
    cell.age += cellSimulation.timeStep;
    
    // Check if cell should divide
    if (aliveCells.length < capacity) {
      const prolifProb = (cell.proliferationRate / 100) * cellSimulation.timeStep / 24; // Per hour
      if (Math.random() < prolifProb) {
        // Create daughter cell
        const daughter = createCell(cellSimulation.cells.length, cell.cloneID);
        daughter.generation = cell.generation + 1;
        daughter.mutations = [...cell.mutations];
        daughter.expressionChanges = [...cell.expressionChanges];
        daughter.proliferationRate = cell.proliferationRate;
        daughter.apoptosisRate = cell.apoptosisRate;
        cellSimulation.cells.push(daughter);
      }
    }
    
    // Check if cell should die
    const apopProb = (cell.apoptosisRate / 100) * cellSimulation.timeStep / 100;
    if (Math.random() < apopProb) {
      cell.alive = false;
    }
  });
}

function updateEnvironment() {
  const aliveCells = cellSimulation.cells.filter(c => c.alive).length;
  
  // Consume resources
  const glucoseConsumption = aliveCells * 0.001 * cellSimulation.timeStep;
  const oxygenConsumption = aliveCells * 0.0005 * cellSimulation.timeStep;
  
  cellSimulation.environment.glucose = Math.max(0, cellSimulation.environment.glucose - glucoseConsumption);
  cellSimulation.environment.oxygen = Math.max(0, cellSimulation.environment.oxygen - oxygenConsumption);
  
  // Produce lactate
  cellSimulation.environment.lactate += glucoseConsumption * 0.5;
}

function recordHistory() {
  const aliveCells = cellSimulation.cells.filter(c => c.alive);
  
  cellSimulation.history.time.push(cellSimulation.currentTime);
  cellSimulation.history.population.push(aliveCells.length);
  
  // Count clones
  const cloneCounts = {};
  aliveCells.forEach(cell => {
    cloneCounts[cell.cloneID] = (cloneCounts[cell.cloneID] || 0) + 1;
  });
  cellSimulation.history.clones.push(cloneCounts);
  
  cellSimulation.history.metabolites.push({
    glucose: cellSimulation.environment.glucose,
    oxygen: cellSimulation.environment.oxygen,
    lactate: cellSimulation.environment.lactate
  });
}

function updateVisualization() {
  const aliveCells = cellSimulation.cells.filter(c => c.alive);
  
  // Update status
  document.getElementById('sim-current-time').textContent = Math.floor(cellSimulation.currentTime);
  document.getElementById('sim-current-pop').textContent = aliveCells.length;
  
  const clones = new Set(aliveCells.map(c => c.cloneID));
  document.getElementById('sim-clone-count').textContent = clones.size;
  
  if (cellSimulation.history.population.length > 1) {
    const lastPop = cellSimulation.history.population[cellSimulation.history.population.length - 2];
    const currentPop = aliveCells.length;
    const growthRate = ((currentPop - lastPop) / lastPop * 100 / cellSimulation.timeStep).toFixed(2);
    document.getElementById('sim-growth-rate').textContent = growthRate;
  }
  
  // Update plots
  updatePopulationPlot();
  updateCloneFrequencyPlot();
  updateMetabolitePlot();
  
  // Render cells in canvas
  renderCellCanvas();
}

function updatePopulationPlot() {
  const trace = {
    x: cellSimulation.history.time,
    y: cellSimulation.history.population,
    type: 'scatter',
    mode: 'lines',
    line: { color: '#7dd3fc', width: 2 },
    name: 'Total Population'
  };
  
  const layout = {
    title: 'Population Dynamics',
    xaxis: { title: 'Time (hours)', color: '#e5e7eb' },
    yaxis: { title: 'Cell Count', color: '#e5e7eb' },
    paper_bgcolor: '#0a0f1a',
    plot_bgcolor: '#0a0f1a',
    font: { color: '#e5e7eb' }
  };
  
  Plotly.newPlot('population-plot', [trace], layout, { responsive: true });
}

function updateCloneFrequencyPlot() {
  const latestClones = cellSimulation.history.clones[cellSimulation.history.clones.length - 1];
  
  if (!latestClones) return;
  
  const data = [{
    values: Object.values(latestClones),
    labels: Object.keys(latestClones),
    type: 'pie',
    marker: {
      colors: ['#7dd3fc', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#60a5fa']
    }
  }];
  
  const layout = {
    title: 'Clone Distribution',
    paper_bgcolor: '#0a0f1a',
    plot_bgcolor: '#0a0f1a',
    font: { color: '#e5e7eb' }
  };
  
  Plotly.newPlot('clone-frequency-plot', data, layout, { responsive: true });
}

function updateMetabolitePlot() {
  const glucose = cellSimulation.history.metabolites.map(m => m.glucose);
  const oxygen = cellSimulation.history.metabolites.map(m => m.oxygen);
  
  const traces = [
    {
      x: cellSimulation.history.time,
      y: glucose,
      type: 'scatter',
      mode: 'lines',
      name: 'Glucose',
      line: { color: '#34d399' }
    },
    {
      x: cellSimulation.history.time,
      y: oxygen,
      type: 'scatter',
      mode: 'lines',
      name: 'Oxygen',
      line: { color: '#60a5fa' }
    }
  ];
  
  const layout = {
    title: 'Metabolite Concentrations',
    xaxis: { title: 'Time (hours)', color: '#e5e7eb' },
    yaxis: { title: 'Concentration', color: '#e5e7eb' },
    paper_bgcolor: '#0a0f1a',
    plot_bgcolor: '#0a0f1a',
    font: { color: '#e5e7eb' }
  };
  
  Plotly.newPlot('metabolite-plot', traces, layout, { responsive: true });
}

function renderCellCanvas() {
  const canvas = document.getElementById('cell-canvas');
  canvas.innerHTML = '';
  
  const aliveCells = cellSimulation.cells.filter(c => c.alive).slice(0, 100); // Show max 100
  
  aliveCells.forEach(cell => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell-visual';
    
    // Position randomly
    cellDiv.style.left = Math.random() * 90 + '%';
    cellDiv.style.top = Math.random() * 90 + '%';
    
    // Size based on generation
    const size = 8 + cell.generation * 2;
    cellDiv.style.width = size + 'px';
    cellDiv.style.height = size + 'px';
    
    // Color based on clone
    const cloneIndex = parseInt(cell.cloneID.split('_')[1]) || 0;
    const colors = ['#7dd3fc', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#60a5fa'];
    cellDiv.style.background = colors[cloneIndex % colors.length];
    
    // Add mutations indicator
    if (cell.mutations.length > 0) {
      cellDiv.style.border = '2px solid #f87171';
    }
    
    canvas.appendChild(cellDiv);
  });
}

function pauseCellSimulation() {
  cellSimulation.paused = !cellSimulation.paused;
  document.getElementById('pause-sim-btn').textContent = cellSimulation.paused ? '▶️ Resume' : '⏸️ Pause';
  showModal(cellSimulation.paused ? 'Simulation paused' : 'Simulation resumed', 'info');
}

function stopCellSimulation() {
  clearInterval(simulationInterval);
  cellSimulation.running = false;
  
  document.getElementById('start-sim-btn').disabled = false;
  document.getElementById('pause-sim-btn').disabled = true;
  document.getElementById('stop-sim-btn').disabled = true;
  
  // Track result
  if (typeof trackResult === 'function') {
    trackResult('cellular-dynamics', {
      finalPopulation: cellSimulation.cells.filter(c => c.alive).length,
      clones: new Set(cellSimulation.cells.filter(c => c.alive).map(c => c.cloneID)).size,
      duration: cellSimulation.currentTime
    });
  }
  
  showModal('Simulation complete!', 'success');
}

function resetCellSimulation() {
  stopCellSimulation();
  cellSimulation.currentTime = 0;
  cellSimulation.cells = [];
  cellSimulation.history = { time: [], population: [], clones: [], metabolites: [] };
  
  document.getElementById('sim-visualization').style.display = 'none';
  
  showModal('Simulation reset', 'info');
}

//========================
// MODULE 4: PATHOPHYSIOLOGY
//========================

function updatePathophysiologyView() {
  const mode = document.getElementById('patho-view-mode').value;
  
  // Populate cell selector based on mode
  const selectorDiv = document.getElementById('cell-selector-container');
  
  if (mode === 'single') {
    const aliveCells = cellSimulation.cells.filter(c => c.alive).slice(0, 20);
    let html = '<select id="selected-cell" onchange="displayPathophysiology()">';
    aliveCells.forEach((cell, i) => {
      html += `<option value="${cell.id}">Cell ${cell.id} (${cell.cloneID})</option>`;
    });
    html += '</select>';
    selectorDiv.innerHTML = html;
  } else if (mode === 'clone') {
    const clones = [...new Set(cellSimulation.cells.filter(c => c.alive).map(c => c.cloneID))];
    let html = '<select id="selected-clone" onchange="displayPathophysiology()">';
    clones.forEach(clone => {
      html += `<option value="${clone}">${clone}</option>`;
    });
    html += '</select>';
    selectorDiv.innerHTML = html;
  } else {
    selectorDiv.innerHTML = '<p>Viewing population average</p>';
  }
  
  displayPathophysiology();
}

function displayPathophysiology() {
  const mode = document.getElementById('patho-view-mode').value;
  let targetCells = [];
  
  if (mode === 'single') {
    const cellId = parseInt(document.getElementById('selected-cell')?.value);
    targetCells = cellSimulation.cells.filter(c => c.id === cellId);
  } else if (mode === 'clone') {
    const cloneId = document.getElementById('selected-clone')?.value;
    targetCells = cellSimulation.cells.filter(c => c.cloneID === cloneId && c.alive);
  } else {
    targetCells = cellSimulation.cells.filter(c => c.alive);
  }
  
  if (targetCells.length === 0) return;
  
  // Calculate average properties
  const avgProliferation = targetCells.reduce((sum, c) => sum + c.proliferationRate, 0) / targetCells.length;
  const avgApoptosis = targetCells.reduce((sum, c) => sum + c.apoptosisRate, 0) / targetCells.length;
  const hasMutations = targetCells.some(c => c.mutations.length > 0);
  
  // Update behavior
  document.getElementById('patho-prolif').textContent = 
    avgProliferation > 70 ? 'High (Uncontrolled)' : avgProliferation > 40 ? 'Normal' : 'Low';
  document.getElementById('patho-apop').textContent = 
    avgApoptosis < 30 ? 'Resistant' : avgApoptosis < 70 ? 'Normal' : 'Elevated';
  document.getElementById('patho-migr').textContent = hasMutations ? 'Increased' : 'None';
  
  const statusBadge = document.getElementById('patho-status');
  if (avgProliferation > 70 && avgApoptosis < 30) {
    statusBadge.textContent = 'Cancerous';
    statusBadge.style.background = 'var(--red)';
  } else if (avgProliferation > 60) {
    statusBadge.textContent = 'Dysplastic';
    statusBadge.style.background = 'var(--yellow)';
  } else {
    statusBadge.textContent = 'Healthy';
    statusBadge.style.background = 'var(--green)';
  }
  
  // Update organelles based on state
  updateOrganelleStatus(avgProliferation, avgApoptosis, hasMutations);
  
  // Update disease stage
  updateDiseaseStage(avgProliferation, avgApoptosis, hasMutations);
  
  // Update mutations list
  updateGeneticProfile(targetCells);
}

function updateOrganelleStatus(proliferation, apoptosis, hasMutations) {
  const mitoCard = document.getElementById('organelle-mitochondria');
  if (proliferation > 70) {
    mitoCard.classList.add('dysfunctional');
    mitoCard.querySelector('.organelle-metric:nth-child(2) span').textContent = '2.5x baseline (Hyperactive)';
    mitoCard.querySelector('.organelle-metric:nth-child(3) span').textContent = 'High';
    mitoCard.querySelector('.organelle-metric:nth-child(4) span').textContent = 'Warburg effect active';
  } else {
    mitoCard.classList.remove('dysfunctional');
  }
  
  const erCard = document.getElementById('organelle-er');
  if (hasMutations) {
    erCard.classList.add('stressed');
    erCard.querySelector('.organelle-metric:nth-child(2) span').textContent = 'Elevated';
    erCard.querySelector('.organelle-metric:nth-child(3) span').textContent = 'Active (Compensatory)';
  } else {
    erCard.classList.remove('stressed');
  }
}

function updateDiseaseStage(proliferation, apoptosis, hasMutations) {
  // Reset all stages
  document.querySelectorAll('.stage-indicator').forEach(ind => ind.classList.remove('active'));
  
  let currentStage = 'normal';
  
  if (proliferation > 80 && apoptosis < 20) {
    currentStage = 'invasive';
    document.querySelector('#stage-invasive .stage-indicator').classList.add('active');
    document.getElementById('current-stage').textContent = 'Invasive Carcinoma';
    document.getElementById('stage-description').textContent = 
      'Malignant cells with ability to invade surrounding tissue. Multiple hallmarks of cancer present.';
    
    // Check hallmarks
    document.getElementById('hallmark-1').checked = true;
    document.getElementById('hallmark-2').checked = true;
    document.getElementById('hallmark-3').checked = true;
    document.getElementById('hallmark-4').checked = hasMutations;
    document.getElementById('hallmark-9').checked = true;
  } else if (proliferation > 70 && apoptosis < 40) {
    currentStage = 'carcinoma-situ';
    document.querySelector('#stage-carcinoma-situ .stage-indicator').classList.add('active');
    document.getElementById('current-stage').textContent = 'Carcinoma in Situ';
    document.getElementById('stage-description').textContent = 
      'Malignant transformation complete but cells contained. Basement membrane intact.';
    
    document.getElementById('hallmark-1').checked = true;
    document.getElementById('hallmark-2').checked = true;
    document.getElementById('hallmark-3').checked = true;
  } else if (proliferation > 60) {
    currentStage = 'dysplasia';
    document.querySelector('#stage-dysplasia .stage-indicator').classList.add('active');
    document.getElementById('current-stage').textContent = 'Dysplasia';
    document.getElementById('stage-description').textContent = 
      'Abnormal cell morphology and architecture. Pre-cancerous changes present.';
    
    document.getElementById('hallmark-1').checked = true;
  } else if (proliferation > 55) {
    currentStage = 'hyperplasia';
    document.querySelector('#stage-hyperplasia .stage-indicator').classList.add('active');
    document.getElementById('current-stage').textContent = 'Hyperplasia';
    document.getElementById('stage-description').textContent = 
      'Increased cell proliferation but architecture preserved. Still responsive to signals.';
  } else {
    document.querySelector('#stage-normal .stage-indicator').classList.add('active');
    document.getElementById('current-stage').textContent = 'Normal';
    document.getElementById('stage-description').textContent = 
      'Cells maintain normal architecture, growth control, and apoptosis regulation.';
  }
}

function updateGeneticProfile(cells) {
  const mutationsSet = new Set();
  const expressionSet = new Set();
  
  cells.forEach(cell => {
    cell.mutations.forEach(mut => mutationsSet.add(`${mut.gene} ${mut.type}`));
    cell.expressionChanges.forEach(exp => expressionSet.add(`${exp.gene} ${exp.action}`));
  });
  
  const mutList = document.getElementById('mutations-list');
  if (mutationsSet.size === 0) {
    mutList.innerHTML = '<p style="color: var(--green);">No mutations (Wild-type)</p>';
  } else {
    mutList.innerHTML = Array.from(mutationsSet).map(m => 
      `<div class="pill pill-hot" style="margin: 4px;">${m}</div>`
    ).join('');
  }
  
  const expList = document.getElementById('expression-alterations');
  if (expressionSet.size === 0) {
    expList.innerHTML = '<p style="color: var(--muted);">No alterations</p>';
  } else {
    expList.innerHTML = Array.from(expressionSet).map(e => 
      `<div class="pill pill-new" style="margin: 4px;">${e}</div>`
    ).join('');
  }
}

function exportPathophysiologyJSON() {
  const data = {
    simulationTime: cellSimulation.currentTime,
    totalCells: cellSimulation.cells.filter(c => c.alive).length,
    clones: [...new Set(cellSimulation.cells.filter(c => c.alive).map(c => c.cloneID))],
    environment: cellSimulation.environment,
    pathophysiology: {
      // Add current pathophysiology data
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pathophysiology-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showModal('Pathophysiology report exported as JSON', 'success');
}

function exportPathophysiologyPDF() {
  showModal('PDF export functionality would generate comprehensive report', 'info');
}

function shareToResearchCommunity() {
  if (!currentUser) {
    showModal('Please log in to share results', 'error');
    return;
  }
  
  navigateTo('research-sharing');
  showModal('Navigate to Research Community to share your simulation results', 'info');
}