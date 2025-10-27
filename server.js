const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(__dirname));

// In-memory job storage (replace with database in production)
let jobs = [];
let jobCounter = 0;

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '0.1.2',
    timestamp: new Date().toISOString() 
  });
});

// Submit job
app.post('/api/v1/jobs/submit', (req, res) => {
  const { toolkit, config, input_files, priority = 5 } = req.body;
  
  if (!toolkit || !config) {
    return res.status(400).json({ 
      error: 'Missing required fields: toolkit and config' 
    });
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const job = {
    id: jobId,
    toolkit,
    config,
    input_files: input_files || [],
    priority,
    status: 'queued',
    progress: 0,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    queue_position: jobs.filter(j => j.status === 'queued').length + 1,
    estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  };

  jobs.push(job);

  // Simulate job processing
  setTimeout(() => {
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].status = 'running';
      jobs[jobIndex].started_at = new Date().toISOString();
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        const currentJob = jobs.find(j => j.id === jobId);
        if (currentJob && currentJob.status === 'running') {
          currentJob.progress = Math.min(currentJob.progress + Math.random() * 20, 100);
          
          if (currentJob.progress >= 100) {
            currentJob.status = 'completed';
            currentJob.completed_at = new Date().toISOString();
            currentJob.results = generateMockResults(toolkit);
            clearInterval(progressInterval);
          }
        } else {
          clearInterval(progressInterval);
        }
      }, 1000);
    }
  }, 2000);

  res.status(201).json(job);
});

// Get job status
app.get('/api/v1/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// List all jobs
app.get('/api/v1/jobs/list', (req, res) => {
  const { status, toolkit, limit = 50 } = req.query;
  
  let filteredJobs = jobs;
  
  if (status) {
    filteredJobs = filteredJobs.filter(j => j.status === status);
  }
  
  if (toolkit) {
    filteredJobs = filteredJobs.filter(j => j.toolkit === toolkit);
  }
  
  filteredJobs = filteredJobs.slice(0, parseInt(limit));
  
  res.json({
    total: filteredJobs.length,
    jobs: filteredJobs
  });
});

// Cancel/Delete job
app.delete('/api/v1/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const job = jobs[jobIndex];
  
  if (job.status === 'running') {
    job.status = 'cancelled';
    res.json({ message: 'Job cancelled', job });
  } else {
    jobs.splice(jobIndex, 1);
    res.json({ message: 'Job deleted' });
  }
});

// Get system stats
app.get('/api/v1/stats', (req, res) => {
  const stats = {
    total_jobs: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    running: jobs.filter(j => j.status === 'running').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    success_rate: jobs.length > 0 
      ? ((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(2)
      : 100,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
  
  res.json(stats);
});

// Generate mock results based on toolkit
function generateMockResults(toolkit) {
  const results = {
    molecular_dynamics: {
      rmsd_avg: (Math.random() * 5).toFixed(2),
      rmsf_avg: (Math.random() * 3).toFixed(2),
      radius_of_gyration: (15 + Math.random() * 10).toFixed(2),
      total_energy: (-800000 - Math.random() * 100000).toFixed(0),
      potential_energy: (-900000 - Math.random() * 100000).toFixed(0),
      kinetic_energy: (100000 + Math.random() * 50000).toFixed(0),
      plots: ['rmsd_plot.png', 'rmsf_plot.png', 'energy_plot.png']
    },
    structure_prediction: {
      plddt_score: (70 + Math.random() * 25).toFixed(2),
      tm_score: (0.7 + Math.random() * 0.25).toFixed(3),
      model_confidence: Math.random() > 0.5 ? 'high' : 'medium',
      structure_file: 'predicted_structure.pdb',
      alignment_file: 'alignment.a3m'
    },
    quantum_chemistry: {
      total_energy: (-1500.234 - Math.random() * 100).toFixed(6),
      homo_energy: (-0.25 - Math.random() * 0.1).toFixed(4),
      lumo_energy: (0.05 + Math.random() * 0.1).toFixed(4),
      dipole_moment: (Math.random() * 5).toFixed(3),
      optimization_steps: Math.floor(Math.random() * 50) + 20
    },
    molecular_docking: {
      binding_affinity: (-8 - Math.random() * 4).toFixed(2),
      rmsd_lb: (Math.random() * 2).toFixed(3),
      num_poses: Math.floor(Math.random() * 10) + 5,
      best_pose: 'pose_1.pdbqt',
      binding_site_residues: ['ARG123', 'ASP45', 'TYR67', 'PHE89']
    },
    retrosynthesis: {
      num_pathways: Math.floor(Math.random() * 10) + 5,
      pathways: generateRetrosynthesisPathways(),
      sa_score: (Math.random() * 3 + 5).toFixed(1),
      complexity: (Math.random() * 5 + 2).toFixed(1),
      avg_steps: (Math.random() * 2 + 3).toFixed(1),
      success_probability: (Math.random() * 20 + 70).toFixed(0)
    }
  };
  
  return results[toolkit] || { message: 'Results generated successfully' };
}

function generateRetrosynthesisPathways() {
  const numPathways = Math.floor(Math.random() * 5) + 5;
  const pathways = [];
  
  const reactionTypes = [
    'Nucleophilic Substitution', 'Electrophilic Addition', 'Grignard Reaction',
    'Aldol Condensation', 'Friedel-Crafts Acylation', 'Diels-Alder Cycloaddition',
    'Wittig Reaction', 'Reduction', 'Oxidation', 'Esterification'
  ];
  
  const startingMaterials = [
    { name: 'Benzene', smiles: 'c1ccccc1', price: '$15/g', availability: 'commercial' },
    { name: 'Acetone', smiles: 'CC(=O)C', price: '$8/L', availability: 'commercial' },
    { name: 'Ethanol', smiles: 'CCO', price: '$12/L', availability: 'commercial' },
    { name: 'Acetic acid', smiles: 'CC(=O)O', price: '$10/L', availability: 'commercial' }
  ];
  
  for (let i = 0; i < numPathways; i++) {
    const numSteps = Math.floor(Math.random() * 4) + 2;
    const reactions = [];
    
    for (let j = 0; j < numSteps; j++) {
      reactions.push({
        step: j + 1,
        type: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
        yield: (Math.random() * 30 + 70).toFixed(0) + '%',
        reagents: ['Reagent A', 'Reagent B'],
        conditions: 'RT, 2h'
      });
    }
    
    pathways.push({
      id: i + 1,
      score: (85 + Math.random() * 15).toFixed(1),
      steps: numSteps,
      cost: (Math.random() * 500 + 100).toFixed(0),
      reactions: reactions,
      starting_materials: startingMaterials.slice(0, Math.min(numSteps, 3))
    });
  }
  
  return pathways.sort((a, b) => b.score - a.score);
}

// Main route - serve the HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-platform.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🧬 ComputeLab Platform Server v0.2.0     ║
║        🔬 With Retrosynthesis Mapping        ║
╚═══════════════════════════════════════════════╝
    
🚀 Server running on port ${PORT}
🌐 Access at: http://localhost:${PORT}
📊 API endpoint: http://localhost:${PORT}/api/v1
💚 Health check: http://localhost:${PORT}/api/health
🔬 Retrosynthesis: Featured toolkit

Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

module.exports = app;