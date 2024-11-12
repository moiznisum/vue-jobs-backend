import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from "body-parser";

// Get the current directory path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;
const jobsFilePath = join(__dirname, "jobs.json");

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Helper function to read data from jobs.json
const readJobsData = () => {
  const rawData = fs.readFileSync(jobsFilePath);
  return JSON.parse(rawData);
};

// Helper function to write data to jobs.json
const writeJobsData = (data) => {
  fs.writeFileSync(jobsFilePath, JSON.stringify(data, null, 2));
};

// 1. GET all jobs
app.get("/jobs", (req, res) => {
  try {
    const jobs = readJobsData();
    res.json(jobs);
  } catch (error) {
    res.status(500).send("Error reading jobs data");
  }
});

// 2. GET a single job by ID
app.get("/jobs/:id", (req, res) => {
  const { id } = req.params;
  try {
    const jobs = readJobsData();
    const job = jobs.find((job) => job.id === id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).send("Job not found");
    }
  } catch (error) {
    res.status(500).send("Error reading jobs data");
  }
});

// 3. POST a new job
app.post("/jobs", (req, res) => {
  const { title, description, company, location, salary, type } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  try {
    const jobs = readJobsData();
    const newJob = {
      id: String(parseInt(jobs[jobs.length - 1].id, 10) + 1),  // Use current timestamp as unique ID
      title,
      description,
      company, location, salary, type
    };
    jobs.push(newJob);
    writeJobsData(jobs);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).send("Error adding new job");
  }
});

// 4. PUT (Update) a job by ID
app.put("/jobs/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  try {
    const jobs = readJobsData();
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).send("Job not found");
    }

    // Update the job
    jobs[jobIndex] = { id, title, description };
    writeJobsData(jobs);
    res.json(jobs[jobIndex]);
  } catch (error) {
    res.status(500).send("Error updating job");
  }
});

// 5. DELETE a job by ID
app.delete("/jobs/:id", (req, res) => {
  const { id } = req.params;
  try {
    const jobs = readJobsData();
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).send("Job not found");
    }

    // Remove the job
    jobs.splice(jobIndex, 1);
    writeJobsData(jobs);
    res.status(204).send();
  } catch (error) {
    res.status(500).send("Error deleting job");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
