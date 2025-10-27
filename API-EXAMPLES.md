# ComputeLab API - Usage Examples

## Table of Contents
- [Python Examples](#python-examples)
- [JavaScript Examples](#javascript-examples)
- [cURL Examples](#curl-examples)
- [R Examples](#r-examples)
- [Julia Examples](#julia-examples)

---

## Python Examples

### Setup
```bash
pip install requests
```

### Basic Job Submission

```python
import requests
import json
import time

# Configuration
API_BASE_URL = "https://your-app-name.onrender.com/api/v1"
API_KEY = "your-api-key-here"  # If authentication is enabled

headers = {
    "Content-Type": "application/json",
    # "X-API-Key": API_KEY  # Uncomment if using authentication
}

def submit_job(toolkit, config, input_files=None, priority=5):
    """Submit a computational job."""
    payload = {
        "toolkit": toolkit,
        "config": config,
        "input_files": input_files or [],
        "priority": priority
    }
    
    response = requests.post(
        f"{API_BASE_URL}/jobs/submit",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Job submission failed: {response.text}")

def get_job_status(job_id):
    """Get status of a job."""
    response = requests.get(
        f"{API_BASE_URL}/jobs/{job_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get job status: {response.text}")

def wait_for_job(job_id, poll_interval=5, timeout=3600):
    """Wait for job to complete."""
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        job = get_job_status(job_id)
        status = job['status']
        progress = job.get('progress', 0)
        
        print(f"Job {job_id}: {status} ({progress}%)")
        
        if status == 'completed':
            return job
        elif status == 'failed':
            raise Exception(f"Job failed: {job.get('error', 'Unknown error')}")
        
        time.sleep(poll_interval)
    
    raise TimeoutError(f"Job {job_id} timed out after {timeout} seconds")

# Example 1: Molecular Dynamics Simulation
def run_md_simulation():
    """Example: Submit MD simulation."""
    config = {
        "forcefield": "amber_ff14sb",
        "simulation_time": 100,
        "temperature": 300,
        "ensemble": "NPT",
        "timestep": 2.0
    }
    
    job = submit_job("molecular_dynamics", config, priority=8)
    print(f"Job submitted: {job['id']}")
    
    # Wait for completion
    result = wait_for_job(job['id'])
    print(f"Results: {json.dumps(result.get('results'), indent=2)}")
    
    return result

# Example 2: Protein Structure Prediction
def predict_structure(sequence):
    """Example: Predict protein structure."""
    config = {
        "sequence": sequence,
        "model": "alphafold3",
        "template_mode": "no_templates"
    }
    
    job = submit_job("structure_prediction", config)
    result = wait_for_job(job['id'])
    
    return result

# Example 3: Quantum Chemistry Calculation
def quantum_calculation(molecule_xyz):
    """Example: Run quantum chemistry calculation."""
    config = {
        "calculation_type": "geometry_optimization",
        "theory_level": "B3LYP",
        "basis_set": "6-31G(d,p)",
        "solvent": "water",
        "molecule": molecule_xyz
    }
    
    job = submit_job("quantum_chemistry", config)
    result = wait_for_job(job['id'])
    
    return result

# Example 4: Batch Job Submission
def batch_submit(jobs_list):
    """Submit multiple jobs in batch."""
    job_ids = []
    
    for toolkit, config in jobs_list:
        job = submit_job(toolkit, config)
        job_ids.append(job['id'])
        print(f"Submitted job: {job['id']}")
    
    # Wait for all jobs
    results = []
    for job_id in job_ids:
        result = wait_for_job(job_id)
        results.append(result)
    
    return results

# Example 5: List and Filter Jobs
def list_jobs(status=None, toolkit=None, limit=50):
    """List jobs with optional filtering."""
    params = {"limit": limit}
    if status:
        params["status"] = status
    if toolkit:
        params["toolkit"] = toolkit
    
    response = requests.get(
        f"{API_BASE_URL}/jobs/list",
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to list jobs: {response.text}")

# Example 6: System Stats
def get_system_stats():
    """Get system statistics."""
    response = requests.get(
        f"{API_BASE_URL}/stats",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get stats: {response.text}")

# Usage
if __name__ == "__main__":
    # Run MD simulation
    try:
        result = run_md_simulation()
        print("MD Simulation completed successfully!")
    except Exception as e:
        print(f"Error: {e}")
    
    # Get system stats
    stats = get_system_stats()
    print(f"\nSystem Stats:")
    print(f"Total Jobs: {stats['total_jobs']}")
    print(f"Success Rate: {stats['success_rate']}%")
```

### Advanced Python Client Class

```python
class ComputeLabClient:
    """Advanced ComputeLab API client."""
    
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({"X-API-Key": api_key})
    
    def submit_md(self, forcefield, sim_time, temperature, structure_file):
        """Submit molecular dynamics job."""
        with open(structure_file, 'rb') as f:
            file_data = f.read()
        
        config = {
            "forcefield": forcefield,
            "simulation_time": sim_time,
            "temperature": temperature
        }
        
        input_files = [{
            "name": structure_file,
            "data": file_data.hex()
        }]
        
        return self._submit("molecular_dynamics", config, input_files)
    
    def submit_docking(self, receptor_file, ligand_smiles, algorithm="autodock_vina"):
        """Submit molecular docking job."""
        with open(receptor_file, 'rb') as f:
            receptor_data = f.read()
        
        config = {
            "algorithm": algorithm,
            "ligand_smiles": ligand_smiles
        }
        
        input_files = [{
            "name": receptor_file,
            "data": receptor_data.hex()
        }]
        
        return self._submit("molecular_docking", config, input_files)
    
    def _submit(self, toolkit, config, input_files=None):
        """Internal submit method."""
        payload = {
            "toolkit": toolkit,
            "config": config,
            "input_files": input_files or []
        }
        
        response = self.session.post(
            f"{self.base_url}/jobs/submit",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_job(self, job_id):
        """Get job details."""
        response = self.session.get(f"{self.base_url}/jobs/{job_id}")
        response.raise_for_status()
        return response.json()
    
    def wait_for_completion(self, job_id, callback=None):
        """Wait for job to complete with optional callback."""
        while True:
            job = self.get_job(job_id)
            
            if callback:
                callback(job)
            
            if job['status'] in ['completed', 'failed']:
                return job
            
            time.sleep(5)

# Usage
client = ComputeLabClient("https://your-app.onrender.com/api/v1")

# Submit job
job = client.submit_md(
    forcefield="amber_ff14sb",
    sim_time=100,
    temperature=300,
    structure_file="protein.pdb"
)

# Wait with progress callback
def progress_callback(job):
    print(f"Progress: {job.get('progress', 0)}%")

result = client.wait_for_completion(job['id'], callback=progress_callback)
```

---

## JavaScript Examples

### Node.js

```javascript
const axios = require('axios');

const API_BASE_URL = 'https://your-app-name.onrender.com/api/v1';
const API_KEY = 'your-api-key-here';  // Optional

class ComputeLabClient {
    constructor(baseUrl, apiKey = null) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json'
        };
        
        if (apiKey) {
            this.headers['X-API-Key'] = apiKey;
        }
    }
    
    async submitJob(toolkit, config, inputFiles = [], priority = 5) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/jobs/submit`,
                {
                    toolkit,
                    config,
                    input_files: inputFiles,
                    priority
                },
                { headers: this.headers }
            );
            
            return response.data;
        } catch (error) {
            throw new Error(`Job submission failed: ${error.message}`);
        }
    }
    
    async getJobStatus(jobId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/jobs/${jobId}`,
                { headers: this.headers }
            );
            
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get job status: ${error.message}`);
        }
    }
    
    async waitForJob(jobId, pollInterval = 5000, timeout = 3600000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const job = await this.getJobStatus(jobId);
            const { status, progress = 0 } = job;
            
            console.log(`Job ${jobId}: ${status} (${progress}%)`);
            
            if (status === 'completed') {
                return job;
            } else if (status === 'failed') {
                throw new Error(`Job failed: ${job.error || 'Unknown error'}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        throw new Error(`Job ${jobId} timed out`);
    }
    
    async listJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        
        try {
            const response = await axios.get(
                `${this.baseUrl}/jobs/list?${params}`,
                { headers: this.headers }
            );
            
            return response.data;
        } catch (error) {
            throw new Error(`Failed to list jobs: ${error.message}`);
        }
    }
}

// Usage Example
async function main() {
    const client = new ComputeLabClient(API_BASE_URL);
    
    // Submit MD simulation
    const job = await client.submitJob('molecular_dynamics', {
        forcefield: 'amber_ff14sb',
        simulation_time: 100,
        temperature: 300,
        ensemble: 'NPT'
    });
    
    console.log(`Job submitted: ${job.id}`);
    
    // Wait for completion
    const result = await client.waitForJob(job.id);
    console.log('Results:', result.results);
}

main().catch(console.error);
```

### Browser JavaScript (Fetch API)

```javascript
class ComputeLabAPI {
    constructor(baseUrl, apiKey = null) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async submitJob(toolkit, config) {
        return this.request('/jobs/submit', {
            method: 'POST',
            body: JSON.stringify({ toolkit, config })
        });
    }
    
    async getJob(jobId) {
        return this.request(`/jobs/${jobId}`);
    }
    
    async getStats() {
        return this.request('/stats');
    }
}

// Usage
const api = new ComputeLabAPI('https://your-app.onrender.com/api/v1');

// Submit job
api.submitJob('structure_prediction', {
    sequence: 'MKFLVNVALVFGVALVAFPGKEEHKTIETVKPTRGQELGITIEAESK',
    model: 'alphafold3'
}).then(job => {
    console.log('Job ID:', job.id);
    return api.getJob(job.id);
}).then(job => {
    console.log('Job Status:', job.status);
});
```

---

## cURL Examples

### Submit Job
```bash
curl -X POST https://your-app.onrender.com/api/v1/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "toolkit": "molecular_dynamics",
    "config": {
      "forcefield": "amber_ff14sb",
      "simulation_time": 100,
      "temperature": 300
    },
    "priority": 8
  }'
```

### Get Job Status
```bash
curl https://your-app.onrender.com/api/v1/jobs/job_abc123xyz
```

### List Jobs
```bash
curl "https://your-app.onrender.com/api/v1/jobs/list?status=running&limit=10"
```

### Get System Stats
```bash
curl https://your-app.onrender.com/api/v1/stats
```

### Delete Job
```bash
curl -X DELETE https://your-app.onrender.com/api/v1/jobs/job_abc123xyz
```

---

## R Examples

```r
library(httr)
library(jsonlite)

# Configuration
API_BASE_URL <- "https://your-app.onrender.com/api/v1"

# Submit job function
submit_job <- function(toolkit, config, priority = 5) {
  payload <- list(
    toolkit = toolkit,
    config = config,
    priority = priority
  )
  
  response <- POST(
    url = paste0(API_BASE_URL, "/jobs/submit"),
    body = toJSON(payload, auto_unbox = TRUE),
    content_type_json()
  )
  
  if (status_code(response) == 201) {
    return(content(response))
  } else {
    stop(paste("Job submission failed:", content(response)))
  }
}

# Get job status
get_job_status <- function(job_id) {
  response <- GET(
    url = paste0(API_BASE_URL, "/jobs/", job_id)
  )
  
  if (status_code(response) == 200) {
    return(content(response))
  } else {
    stop(paste("Failed to get job status:", content(response)))
  }
}

# Wait for job completion
wait_for_job <- function(job_id, poll_interval = 5, timeout = 3600) {
  start_time <- Sys.time()
  
  while (as.numeric(difftime(Sys.time(), start_time, units = "secs")) < timeout) {
    job <- get_job_status(job_id)
    status <- job$status
    progress <- ifelse(is.null(job$progress), 0, job$progress)
    
    cat(sprintf("Job %s: %s (%.1f%%)\n", job_id, status, progress))
    
    if (status == "completed") {
      return(job)
    } else if (status == "failed") {
      stop(paste("Job failed:", job$error))
    }
    
    Sys.sleep(poll_interval)
  }
  
  stop(paste("Job", job_id, "timed out"))
}

# Example: Run MD simulation
md_config <- list(
  forcefield = "amber_ff14sb",
  simulation_time = 100,
  temperature = 300,
  ensemble = "NPT"
)

job <- submit_job("molecular_dynamics", md_config, priority = 8)
cat("Job submitted:", job$id, "\n")

result <- wait_for_job(job$id)
print(result$results)
```

---

## Julia Examples

```julia
using HTTP
using JSON3

const API_BASE_URL = "https://your-app.onrender.com/api/v1"

function submit_job(toolkit::String, config::Dict, priority::Int=5)
    payload = Dict(
        "toolkit" => toolkit,
        "config" => config,
        "priority" => priority
    )
    
    response = HTTP.post(
        "$(API_BASE_URL)/jobs/submit",
        ["Content-Type" => "application/json"],
        JSON3.write(payload)
    )
    
    if response.status == 201
        return JSON3.read(String(response.body))
    else
        error("Job submission failed: $(String(response.body))")
    end
end

function get_job_status(job_id::String)
    response = HTTP.get("$(API_BASE_URL)/jobs/$(job_id)")
    
    if response.status == 200
        return JSON3.read(String(response.body))
    else
        error("Failed to get job status: $(String(response.body))")
    end
end

function wait_for_job(job_id::String; poll_interval::Int=5, timeout::Int=3600)
    start_time = time()
    
    while time() - start_time < timeout
        job = get_job_status(job_id)
        status = job.status
        progress = get(job, :progress, 0)
        
        println("Job $job_id: $status ($progress%)")
        
        if status == "completed"
            return job
        elseif status == "failed"
            error("Job failed: $(get(job, :error, "Unknown error"))")
        end
        
        sleep(poll_interval)
    end
    
    error("Job $job_id timed out after $timeout seconds")
end

# Example: Submit MD simulation
config = Dict(
    "forcefield" => "amber_ff14sb",
    "simulation_time" => 100,
    "temperature" => 300,
    "ensemble" => "NPT"
)

job = submit_job("molecular_dynamics", config, 8)
println("Job submitted: $(job.id)")

result = wait_for_job(job.id)
println("Results: $(result.results)")
```

---

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Rate Limiting**: Implement exponential backoff for retries
3. **Async Operations**: Use async/await for better performance
4. **Connection Pooling**: Reuse HTTP connections when possible
5. **Timeouts**: Set reasonable timeouts for long-running jobs
6. **Logging**: Log all API interactions for debugging
7. **Validation**: Validate inputs before submitting jobs

---

**Need More Examples?** Check the full API documentation for additional endpoints and features!